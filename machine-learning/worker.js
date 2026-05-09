importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest');

const MODEL_PATH = `yolov5n_web_model/model.json`;
const LABELS_PATH = `yolov5n_web_model/labels.json`; // Tudo o que o modelo vai reconhecer/classificar
const INPUT_MODEL_DIMENSIONS = 640;
// Limiar de confiança para detecções. Equilíbrio: muito baixo gera falsos
// positivos que confundem o tracking; muito alto perde detecções legítimas
// e quebra a continuidade entre frames.
const CLASS_THRESHOLD = 0.30;
// Valor de cinza usado como padding no letterbox (convenção do YOLO).
const LETTERBOX_PAD_VALUE = 114;
// O modelo COCO não tem "duck"; o pato é detectado normalmente como kite/bird.
const TARGET_LABELS = new Set(['kite', 'bird']);

let _labels = [];
let _model = null;

async function loadModelAndLabels() {

    await tf.ready();
    _labels = JSON.parse(await fetch(LABELS_PATH).then(res => res.text()));
    _model = await tf.loadGraphModel(MODEL_PATH);

    // aquecendo o modelo (warmup)
    const dummyInput = tf.ones(_model.inputs[0].shape);
    const warmup = await _model.executeAsync(dummyInput);
    tf.dispose(dummyInput);
    if (Array.isArray(warmup)) {
        warmup.forEach(t => tf.dispose(t));
    } else {
        tf.dispose(warmup);
    }

    postMessage({ type: 'modelLoaded' });

}

/**
 * Pré-processa a imagem para o formato esperado pelo YOLO usando letterbox:
 *  - Mantém o aspect ratio original (sem distorcer)
 *  - Redimensiona o lado maior para INPUT_MODEL_DIMENSIONS
 *  - Preenche as laterais com cinza (114), padrão do YOLO
 *
 * Retorna também os parâmetros (ratio, padX, padY) necessários para mapear as
 * caixas detectadas de volta para coordenadas da imagem original.
 */
function preprocessImage(inputImage) {
    const W = inputImage.width;
    const H = inputImage.height;
    const ratio = Math.min(INPUT_MODEL_DIMENSIONS / W, INPUT_MODEL_DIMENSIONS / H);
    const newW = Math.round(W * ratio);
    const newH = Math.round(H * ratio);
    const padX = Math.floor((INPUT_MODEL_DIMENSIONS - newW) / 2);
    const padY = Math.floor((INPUT_MODEL_DIMENSIONS - newH) / 2);
    const padXRight = INPUT_MODEL_DIMENSIONS - newW - padX;
    const padYBottom = INPUT_MODEL_DIMENSIONS - newH - padY;

    const input = tf.tidy(() => {
        const image = tf.browser.fromPixels(inputImage);
        const resized = tf.image.resizeBilinear(image, [newH, newW]);
        const padded = tf.pad(
            resized,
            [[padY, padYBottom], [padX, padXRight], [0, 0]],
            LETTERBOX_PAD_VALUE
        );
        return padded.div(255).expandDims(0);
    });

    return { input, ratio, padX, padY };
}

async function runInference(tensor) {
    const output = await _model.executeAsync(tensor);
    tf.dispose(tensor);

    // As 3 primeiras saídas são: caixas, pontuações e classes.
    const [boxes, scores, classes] = output;
    const [boxesData, scoresData, classesData] = await Promise.all([
        boxes.data(),
        scores.data(),
        classes.data()
    ]);

    output.forEach(t => tf.dispose(t));

    return {
        boxes: boxesData,
        scores: scoresData,
        classes: classesData
    };
}

/**
 * Filtra e processa as predições do YOLO:
 *  - Aplica o limiar de confiança (CLASS_THRESHOLD)
 *  - Mantém apenas as classes-alvo (kite/bird)
 *  - Converte caixas normalizadas do espaço do modelo (640x640 com letterbox)
 *    de volta para o espaço da imagem original (descontando padding e escala)
 *  - Calcula o centro do bounding box
 */
function* processPrediction({ boxes, scores, classes }, ratio, padX, padY) {
    for (let i = 0; i < scores.length; i++) {
        const score = scores[i];
        if (score < CLASS_THRESHOLD) continue;

        const label = _labels[classes[i]];
        if (!TARGET_LABELS.has(label)) continue;

        let [x1, y1, x2, y2] = boxes.slice(i * 4, (i + 1) * 4);

        // Caixas vêm normalizadas em [0..1] do input do modelo (640).
        // Desfazemos o letterbox: pixels_no_input = norm * 640
        // depois subtraímos o padding e dividimos pelo ratio para voltar ao
        // espaço da imagem original.
        x1 = (x1 * INPUT_MODEL_DIMENSIONS - padX) / ratio;
        y1 = (y1 * INPUT_MODEL_DIMENSIONS - padY) / ratio;
        x2 = (x2 * INPUT_MODEL_DIMENSIONS - padX) / ratio;
        y2 = (y2 * INPUT_MODEL_DIMENSIONS - padY) / ratio;

        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        yield {
            x: centerX,
            y: centerY,
            score,
            label,
        };
    }
}

loadModelAndLabels();

self.onmessage = async ({ data }) => {
    if (data.type !== 'predict') return;
    if (!_model) return;

    const { width, height } = data.image;
    const { input, ratio, padX, padY } = preprocessImage(data.image);

    let detections = [];
    try {
        const inferenceResults = await runInference(input);
        for (const prediction of processPrediction(inferenceResults, ratio, padX, padY)) {
            detections.push(prediction);
        }
    } catch (err) {
        // Garante resposta mesmo em erro, para o main destravar o `workerBusy`.
        console.error('AI inference failed', err);
        detections = [];
    } finally {
        // Libera memória da ImageBitmap transferida.
        if (data.image && typeof data.image.close === 'function') {
            data.image.close();
        }
    }

    postMessage({
        type: 'predictions',
        detections,
        width,
        height,
        captureT: data.captureT,
    });
};
