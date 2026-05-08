import { buildLayout } from './layout';

const PREDICT_INTERVAL_MS = 320;

export default async function main(game) {
  const container = buildLayout(game.app);
  const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });

  let godModeEnabled = false;
  let predictIntervalId = null;

  game.stage.aim.visible = false;

  function stopPredictLoop() {
    if (predictIntervalId != null) {
      clearInterval(predictIntervalId);
      predictIntervalId = null;
    }
  }

  function startPredictLoop() {
    stopPredictLoop();
    predictIntervalId = setInterval(async () => {
      if (!godModeEnabled || game.paused) {
        return;
      }
      const canvas = game.app.renderer.extract.canvas(game.stage);
      const bitmap = await createImageBitmap(canvas);

      worker.postMessage({
        type: 'predict',
        image: bitmap,
      }, [bitmap]);
    }, PREDICT_INTERVAL_MS);
  }

  worker.onmessage = ({ data }) => {
    const { type } = data;

    if (type === 'prediction' && godModeEnabled && !game.paused) {
      console.log(`🎯 AI predicted at: (${data.x}, ${data.y})`);
      container.updateHUD(data);
      game.stage.aim.visible = true;

      game.stage.aim.setPosition(data.x, data.y);
      const position = game.stage.aim.getGlobalPosition();

      game.handleClick({
        global: position,
      });
    }
  };

  function setGodMode(enabled) {
    godModeEnabled = enabled;
    if (enabled) {
      startPredictLoop();
    } else {
      stopPredictLoop();
      game.stage.aim.visible = false;
    }
  }

  return { setGodMode };
}
