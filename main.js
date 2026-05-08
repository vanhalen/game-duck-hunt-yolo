import main from './machine-learning/main';
import Game from './src/modules/Game';

document.addEventListener('DOMContentLoaded', async function () {
  const game = new Game({
    spritesheet: 'sprites.json'
  });
  await game.load();
  game.mlGod = await main(game);

}, false);
