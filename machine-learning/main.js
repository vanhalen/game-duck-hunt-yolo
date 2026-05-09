import { buildLayout } from './layout';

const PREDICT_INTERVAL_MS = 100;
// Buffer adicional (ms) somado à latência medida captura -> clique. Compensa
// o pequeno atraso entre o handler do worker e a chamada de shotsFired.
const EXTRA_LEAD_MS = 20;
// Limite máximo. Protege contra picos de latência
// (worker travado, GC, etc) que poderiam projetar o tiro muito longe.
const MAX_LEAD_S = 0.5;
// Quantos seg um track sobrevive sem ser detectado. Aumentado pra
// cobrir transições breves.
const MAX_TRACK_AGE_S = 1.5;
// Distância máxima entre a posição PREVISTA do track e a detecção atual.
const MAX_TRACK_DISTANCE_NEW = 300;       // hist=1, vx=0
const MAX_TRACK_DISTANCE_TRACKED = 160;   // hist>=2, vx confiável
// Velocidade máxima (px/s no stage). Patos no level 6 (speed 8) fazem
// ~940 px/s; associações que produziriam velocidade acima disso são REJEITADAS
// (a detecção é tratada como track novo em vez de prosseguir a associação).
const MAX_TRACK_SPEED = 1100;
// Quantas detecções recentes são guardadas por track para estimar velocidade
// via regressão linear.
const VELOCITY_HISTORY_SIZE = 3;
const NMS_DEDUP_DISTANCE = 25;

// MODO HÍBRIDO: se true, o ML continua DETECTANDO/decidindo quais patos
// atacar e quando atirar (e respeita as regras do jogo), mas a posição final
// do clique é a posição EXATA do pato mais próximo da detecção em
// `game.stage.ducks`. É "trapaça" - o ML deixa de fazer a mira final - mas
// elimina o atraso captura→clique e jitter de bbox. Usar quando a precisão
// pura do ML não é suficiente (ex: fases 5/6 com patos rápidos e poucas
// balas). Distância máxima para casar uma detecção com um pato real:
const USE_REAL_DUCK_POSITIONS = true;
const REAL_DUCK_MATCH_DISTANCE = 200;

export default async function main(game) {
    const container = buildLayout(game.app);
    const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

    let godModeEnabled = false;
    let predictIntervalId = null;
    let workerBusy = false;
    // Lista de tracks da última iteração: cada track é
    //   { history: [{x, y, t}, ...], vx, vy, score }
    // O histórico mantém as últimas VELOCITY_HISTORY_SIZE detecções daquele pato
    // e a velocidade é estimada com regressão linear sobre o histórico — muito
    // mais estável que um delta entre 2 frames.
    let lastTracks = [];
    // Estatísticas da última chamada de updateTracks, expostas para diagnóstico.
    let lastUpdateStats = { candidatesAtStart: 0, detections: 0, associations: 0, newTracks: 0 };

    game.stage.aim.visible = false;

    function stopPredictLoop() {
        if (predictIntervalId != null) {
        clearInterval(predictIntervalId);
        predictIntervalId = null;
        }
    }

    function dedupDetections(detections) {
        const sorted = [...detections].sort((a, b) => b.score - a.score);
        const kept = [];
        for (const det of sorted) {
        const tooClose = kept.some((k) => Math.hypot(k.x - det.x, k.y - det.y) < NMS_DEDUP_DISTANCE);
        if (!tooClose) kept.push(det);
        }
        return kept;
    }

    function lastPoint(track) {
        return track.history[track.history.length - 1];
    }

    /**
     * Regressão linear simples sobre um array de pontos {x, y, t} (segundos).
     * Retorna o slope (vx, vy) — derivada de x e y em relação ao tempo.
     * Um único ponto retorna velocidade zero.
     */
    function regressVelocity(history) {
        const n = history.length;
        if (n < 2) return { vx: 0, vy: 0 };

        let sumT = 0;
        let sumX = 0;
        let sumY = 0;
        for (const p of history) {
            sumT += p.t;
            sumX += p.x;
            sumY += p.y;
        }
        const meanT = sumT / n;
        const meanX = sumX / n;
        const meanY = sumY / n;

        let num_x = 0;
        let num_y = 0;
        let den = 0;
        for (const p of history) {
            const dt = p.t - meanT;
            num_x += dt * (p.x - meanX);
            num_y += dt * (p.y - meanY);
            den += dt * dt;
        }
        if (den === 0) return { vx: 0, vy: 0 };
        return { vx: num_x / den, vy: num_y / den };
    }

    /**
     * Atualiza `lastTracks` com as detecções do frame atual:
     *  - Tracks anteriores ainda dentro de MAX_TRACK_AGE_S sobrevivem
     *    (mesmo sem detecção neste frame).
     *  - Posição PREVISTA = última posição + vx*dt; usada para associar
     *    detecções atuais com tracks existentes.
     *  - Detecções não associadas viram tracks novos.
     *  - Retorna apenas os tracks que receberam detecção neste frame
     *    (alvos válidos para tiro), ordenados por score desc.
     */
    function updateTracks(detections, captureTSec) {
        const now = captureTSec;

        // 1) Mantém só tracks dentro da idade máxima ("fantasmas").
        const candidates = lastTracks.filter((t) => (now - lastPoint(t).t) < MAX_TRACK_AGE_S);
        const candidatesCountStart = candidates.length;

        // 2) Calcula posição prevista de cada track candidato.
        const predicted = candidates.map((t) => {
            const lp = lastPoint(t);
            const dt = now - lp.t;
            return {
                px: lp.x + t.vx * dt,
                py: lp.y + t.vy * dt,
            };
        });

        for (const t of candidates) {
            t.detectedThisFrame = false;
        }

        // 3) Associação gulosa: detecções de maior confiança escolhem primeiro
        //    o track candidato cuja posição PREVISTA está mais próxima.
        //    IMPORTANTE: só itera até `candidatesCountStart`. Tracks novos criados
        //    nesta iteração NÃO entram como candidatos para outras detecções.
        const sortedDets = [...detections].sort((a, b) => b.score - a.score);
        const usedTracks = new Set();
        const tracksAfter = [...candidates];
        let associations = 0;

        for (const det of sortedDets) {
            // Acha o melhor candidato dentro do limite adaptativo de distância.
            // Importante: também rejeita pares que produziriam velocidade absurda
            // (sinal claro de que são patos DIFERENTES sendo confundidos).
            let bestIdx = -1;
            let bestDist = Infinity;
            let bestNewHistory = null;
            let bestVx = 0;
            let bestVy = 0;

            for (let i = 0; i < candidatesCountStart; i++) {
                if (usedTracks.has(i)) continue;
                const tr = tracksAfter[i];
                const maxDist = tr.history.length >= 2
                ? MAX_TRACK_DISTANCE_TRACKED
                : MAX_TRACK_DISTANCE_NEW;

                const d = Math.hypot(det.x - predicted[i].px, det.y - predicted[i].py);
                if (d >= maxDist || d >= bestDist) continue;

                // Tenta a associação: verifica se a velocidade resultante é razoável.
                const candidateHistory = tr.history.slice(-(VELOCITY_HISTORY_SIZE - 1));
                candidateHistory.push({ x: det.x, y: det.y, t: captureTSec });
                const { vx, vy } = regressVelocity(candidateHistory);
                if (Math.hypot(vx, vy) >= MAX_TRACK_SPEED) continue;

                bestIdx = i;
                bestDist = d;
                bestNewHistory = candidateHistory;
                bestVx = vx;
                bestVy = vy;
            }

            if (bestIdx >= 0) {
                usedTracks.add(bestIdx);
                const tr = tracksAfter[bestIdx];
                tr.history = bestNewHistory;
                tr.vx = bestVx;
                tr.vy = bestVy;
                tr.x = det.x;
                tr.y = det.y;
                tr.score = det.score;
                tr.detectedThisFrame = true;
                associations += 1;
            } else {
                // Sem track plausível -> cria novo (tratado como pato recém-aparecido).
                const newTrack = {
                    history: [{ x: det.x, y: det.y, t: captureTSec }],
                    vx: 0,
                    vy: 0,
                    x: det.x,
                    y: det.y,
                    score: det.score,
                    detectedThisFrame: true,
                };
                tracksAfter.push(newTrack);
            }
        }

        lastTracks = tracksAfter;
        lastUpdateStats = {
            candidatesAtStart: candidatesCountStart,
            detections: detections.length,
            associations,
            newTracks: detections.length - associations,
        };
        return tracksAfter
        .filter((t) => t.detectedThisFrame)
        .sort((a, b) => b.score - a.score);
    }

    function canShoot() {
        return godModeEnabled
            && !game.paused
            && !!game.stage
            && !game.stage.dogActive()
            && !game.shouldWaveEnd()
            && !game.outOfAmmo()
            && game.stage.ducksAlive();
    }

    async function captureStageBitmap() {
        // Esconde mira/HUD antes da extração para não confundir o detector com a
        // própria mira/textos. Restaura logo em seguida (síncrono), então o usuário
        // não percebe pois o ticker do PIXI só re-renderiza no próximo frame.
        const aimWasVisible = game.stage.aim.visible;
        const hudWasVisible = game.stage.hud.visible;
        game.stage.aim.visible = false;
        game.stage.hud.visible = false;

        // Marca o instante exato da captura: usado depois para medir a latência
        // real captura -> clique e aplicar o lead correspondente.
        const captureT = performance.now();
        let canvas;
        try {
            canvas = game.app.renderer.extract.canvas(game.stage);
        } finally {
            game.stage.aim.visible = aimWasVisible;
            game.stage.hud.visible = hudWasVisible;
        }

        const bitmap = await createImageBitmap(canvas);
        return { bitmap, captureT };
    }

    function startPredictLoop() {
        stopPredictLoop();
        predictIntervalId = setInterval(async () => {
            if (!godModeEnabled || game.paused || workerBusy) {
                return;
            }
            if (!canShoot()) {
                // Sem patos para mirar / sem munição / dog ativo: não desperdiça
                // inferência. NÃO zera lastTracks — entre waves a memória pode ajudar
                // se o mesmo pato reaparecer rapidamente.
                return;
            }

            workerBusy = true;
            try {
                const { bitmap, captureT } = await captureStageBitmap();
                worker.postMessage({
                    type: 'predict',
                    image: bitmap,
                    captureT,
                }, [bitmap]);
            } catch (err) {
                workerBusy = false;
                console.error('AI capture failed', err);
            }
        }, PREDICT_INTERVAL_MS);
    }

    worker.onmessage = ({ data }) => {
        if (data.type !== 'predictions') return;
        workerBusy = false;

        if (!godModeEnabled || game.paused) return;
        if (!canShoot()) {
            // Não zera lastTracks — a função updateTracks() filtra por idade.
            return;
        }

        const { detections = [] } = data;
        const now = performance.now();

        const captureT = (typeof data.captureT === 'number') ? data.captureT : now;

        // Lead dinâmico = latência real medida (now - captureT) + buffer extra.
        // Satura em MAX_LEAD_S para proteger contra picos de latência,
        // que projetariam o tiro longe demais.
        const measuredLatencyS = Math.max(0, (now - captureT) / 1000);
        const lead = Math.min(MAX_LEAD_S, measuredLatencyS + EXTRA_LEAD_MS / 1000);

        // 1) Remove duplicatas (NMS frouxo) - caixas muito próximas vêm do mesmo
        //    pato e gastariam balas duplicadas.
        const unique = dedupDetections(detections);

        // 2) Atualiza os tracks (persistem entre frames). Retorna apenas os que
        //    receberam detecção neste frame, ordenados por confiança.
        const tracks = updateTracks(unique, captureT / 1000);
        if (tracks.length === 0) {
        // Sem alvo neste frame, nada para atirar. Tracks "fantasmas" continuam
        // vivos em lastTracks até envelhecerem.
            return;
        }

        // 3) Limita o número de tiros ao número de patos vivos para não desperdiçar
        //    munição em falsos positivos.
        const ducksAliveCount = game.stage.ducks.filter((d) => d.alive).length;
        const maxShots = Math.min(tracks.length, Math.max(ducksAliveCount, 1));
        const targets = tracks.slice(0, maxShots);

        const best = targets[0];

        // Log resumido do frame (todos os alvos), antes dos tiros.
        const summary = targets
            .map((tr) => `[h=${tr.history.length} v=(${Math.round(tr.vx)},${Math.round(tr.vy)}) s=${tr.score.toFixed(2)}]`)
            .join(' ');
        console.log(`AI frame: lead=${(lead * 1000).toFixed(0)}ms cand→det/assoc/new=${lastUpdateStats.candidatesAtStart}→${lastUpdateStats.detections}/${lastUpdateStats.associations}/${lastUpdateStats.newTracks} targets=${targets.length} ${summary}`);

        // Conjunto de patos já mirados neste frame, pra evitar atirar duas vezes
        // no mesmo pato quando o ML detectou duplicatas (modo híbrido).
        const usedDucks = new Set();

        for (const tr of targets) {
            if (!canShoot()) break;

            // Posição "honesta": detecção + leading com a velocidade estimada.
            let targetX = tr.x + tr.vx * lead;
            let targetY = tr.y + tr.vy * lead;

                if (USE_REAL_DUCK_POSITIONS) {
                // Modo híbrido: usa o ML só pra DECIDIR atirar, mas mira na posição
                // real do pato vivo mais próximo da detecção.
                const realDuck = findClosestAliveDuck(game, tr.x, tr.y, usedDucks);
                if (realDuck) {
                    usedDucks.add(realDuck);
                    targetX = realDuck.x;
                    targetY = realDuck.y;
                } else {
                // Sem pato real plausível: pula este alvo (provavelmente falso
                // positivo do ML).
                    continue;
                }
            }

            if (tr === best) {
                container.updateHUD({
                    score: (tr.score * 100).toFixed(2),
                    x: targetX,
                    y: targetY,
                });
                game.stage.aim.visible = true;
            }

            game.stage.aim.setPosition(targetX, targetY);
            const globalPosition = game.stage.aim.getGlobalPosition();
            game.handleClick({
                global: globalPosition,
            });
        }
    };

    /**
     * Acha o pato vivo mais próximo da posição (x, y) na stage, ignorando os
     * que já foram alvo neste frame. Retorna null se nenhum estiver dentro de
     * REAL_DUCK_MATCH_DISTANCE.
     */
    function findClosestAliveDuck(gameRef, x, y, used) {
        let best = null;
        let bestDist = REAL_DUCK_MATCH_DISTANCE;

        for (const duck of gameRef.stage.ducks) {
            if (!duck.alive || used.has(duck)) continue;
            const d = Math.hypot(duck.x - x, duck.y - y);
            if (d < bestDist) {
                bestDist = d;
                best = duck;
            }
        }
        return best;
    }

    worker.onerror = (err) => {
        workerBusy = false;
        console.error('AI worker error', err);
    };

    function setGodMode(enabled) {
        godModeEnabled = enabled;
        lastTracks = [];
        workerBusy = false;
        if (enabled) {
            startPredictLoop();
        } else {
            stopPredictLoop();
            game.stage.aim.visible = false;
        }
    }

    return { setGodMode };
}
