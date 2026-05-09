# Duck Hunt com Modo God (Machine Learning)

Uma releitura do clássico Duck Hunt em JavaScript, utilizando machine learning para identificar patos na tela e atirar automaticamente.
O foco deste projeto não é apenas o jogo em si, mas a experimentação prática de um hack com o modelo YOLO, modo "God" com IA, que pode ser ativado/desativado durante os testes para comparar jogabilidade manual e assistida.

## 🌐 Acesse a demonstração

[https://duckhunt.rodrigorchagas.com.br](https://duckhunt.rodrigorchagas.com.br)

## ⭐ Arquivos principais

Os pontos centrais da funcionalidade de machine learning estão em:

- `machine-learning/main.js`
- `machine-learning/worker.js`

Em `machine-learning/main.js` acontece a integração com o jogo (HUD, mira, disparo automático e tracking).
Em `machine-learning/worker.js` ocorre a inferência do YOLOv5n em Web Worker.

## 📁 Estrutura do Projeto

```text
.
├── main.js
├── machine-learning/
├── src/
├── dist/
├── webpack.config.js
└── package.json
```

### Descrição dos diretórios

- `main.js` — Ponto de entrada da aplicação
- `machine-learning/` — Integração do modo God com modelo e worker de inferência
- `src/` — Lógica principal do jogo (stage, personagens, HUD, regras de onda/pontuação)
- `dist/` — Arquivos estáticos e artefatos gerados para execução

---

## 🚀 Como executar o projeto

### 1. Instale as dependências

```bash
npm install
```

### 2. Inicie a aplicação

```bash
npm start
```

### 3. Acesse no navegador

```text
http://localhost:8989
```

---

## ✨ Funcionalidades

- Jogo Duck Hunt clássico com HUD, pontuação e progressão por ondas
- Mira e disparo manual como modo padrão
- Integração com inferência em tempo real via Web Worker
- Modo "God" com assistência de IA para detectar patos e automatizar tiros
- Camada de visualização para acompanhar previsões geradas pelo modelo
- Base preparada para experimentos e evolução de estratégias de automação

---

## 🎯 Como o Modo God funciona

O modo é ativado/desativado pelo jogador pressionando a tecla **`g`** durante a partida.

A inferência do YOLOv5n leva ~180ms entre capturar o canvas e disparar o clique. Nas fases finais isso é tempo suficiente pro pato sair do lugar, e o tiro erra mesmo com previsão de velocidade.

Para contornar, existe a flag `USE_REAL_DUCK_POSITIONS` em `machine-learning/main.js`:

- `false` — mira 100% no que o YOLO detectou + leading. Honesto, mas erra nas fases altas.
- `true` — o YOLO continua detectando e decidindo quando atirar, mas a coordenada final do clique vem de `game.stage.ducks` (posição exata do pato). Sem latência, sem jitter.

### Quem faz o quê

| Responsabilidade           | Quem faz                    |
| -------------------------- | --------------------------- |
| Detectar pato na tela      | YOLO                        |
| Decidir se vale atirar     | YOLO + regras do jogo       |
| Decidir qual pato atacar   | YOLO + tracker              |
| Mira final (flag `false`)  | YOLO + leading              |
| Mira final (flag `true`)   | Posição real do pato no jogo |

Sem detecção do YOLO, nenhum tiro acontece nos dois modos.

---

## 🔮 Melhorias futuras

- **Mira 100% via ML** (remover a flag `USE_REAL_DUCK_POSITIONS`). Caminhos: treinar um modelo customizado nos sprites do jogo, reduzir a latência de inferência (modelo menor / quantização) ou usar tracking mais robusto (Kalman) para o leading.
- Visualização das bboxes/tracks no canvas para debug.
- Métricas de hit/miss por wave para comparar os modos.

---

## 🛠 Tecnologias utilizadas

- JavaScript
- HTML5
- PixiJS
- GSAP
- Howler.js
- TensorFlow.js
- Web Worker

---

Se precisar de ajuda ou encontrar problemas, não hesite em abrir uma issue no repositório! 🚀
