importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest');

const MODEL_PATH = `yolov5n_web_model/model.json`;
const LABELS_PATH = `yolov5n_web_model/labels.json`; // Tudo o que o modelo vai reconhecer/classificar
const INPUT_MODEL_DIMENSIONS = 640;
const CLASS_TRASHOLD = 0.32;

let _labels = [];
let _model = null;

async function loadModelAndLabels() {

    await tf.ready();
    _labels = JSON.parse(await fetch(LABELS_PATH).then(res => res.text()));
    _model = await tf.loadGraphModel(MODEL_PATH);

    // aquecendo o modelo (warmup)
    const dummyInput = tf.ones(_model.inputs[0].shape);
    await _model.executeAsync(dummyInput);
    tf.dispose(dummyInput); // liberando/limpando a memória pra não ter vazamentos

    postMessage({ type: 'modelLoaded' });

}

/**
 * Vai pré-processar a imagem para o formato esperado pelo modelo YOLO.
 * tf.browser.fromPixels(image) -> Converte a imagem para um tensor.
 * tf.resizeBilinear() -> Redimensiona a imagem para o tamanho do modelo.
 */
function preprocessImage(inputImage) {
    return tf.tidy(() => {
        const image = tf.browser.fromPixels(inputImage);

        return image.resizeBilinear([INPUT_MODEL_DIMENSIONS, INPUT_MODEL_DIMENSIONS])
            .div(255)
            .expandDims(0);
    });
}

async function runInference(tensor) {

    const output = await _model.executeAsync(tensor); // Pega o que o YOLO retornou
    tf.dispose(tensor);

    // Assume que as 3 primeiras saídas são: caixas, pontuações e classes
    const [boxes, scores, classes] = output.slice([0, 3]);
    const [boxesData, scoresData, classesData] = await Promise.all(
        [
            boxes.data(),
            scores.data(),
            classes.data()
        ]
    );

    output.forEach(t => tf.dispose());

    return {
        boxes: boxesData,
        scores: scoresData,
        classes: classesData
    }
}

/**
 * Filtra e processa as predições do YOLO.
 * - Aplica o limiar de confiança (CLASS_TRASHOLD)
 * - Filtra por classe específica (kite)
 * - Converte as coordenadas normalizadas para pixels
 * - Calcula o centro do bounding box
 *
 *  Gerador (funcion*)
 * - Permite enviar as predições uma por uma, sem precisar esperar todas terminarem
 */
function* processPrediction({ boxes, scores, classes }, width, height) {
    for (let i = 0; i < scores.length; i++) {
        if(scores[i] < CLASS_TRASHOLD) continue;
        const label = _labels[classes[i]];

        // O YOLO reconhece o pato como kite
        if (label !== 'kite' && label !== 'bird') continue;


        let [x1, y1, x2, y2] = boxes.slice(i * 4, (i + 1) * 4); // pegando os 4 valores da caixa (x1, y1, x2, y2)
        x1 = x1 * width;
        y1 = y1 * height;
        x2 = x2 * width;
        y2 = y2 * height;

        const boxWidth = x2 - x1;
        const boxHeight = y2 - y1;

        const centerX = x1 + (boxWidth / 2);
        const centerY = y1 + (boxHeight / 2);

        yield {
            x: centerX,
            y: centerY,
            score: (scores[i] * 100).toFixed(2)
        };
    }


}

loadModelAndLabels();

self.onmessage = async ({ data }) => {
    if (data.type !== 'predict') return
    if (!_model) return;

    const input = preprocessImage(data.image);
    const { width, height } = data.image;

    const inferenceResults = await runInference(input);

    for(const prediction of processPrediction(inferenceResults, width, height)) {
        postMessage({
            type: 'prediction',
            ...prediction,
        });
    }

};