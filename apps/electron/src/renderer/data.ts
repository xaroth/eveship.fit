import { createEngine, type Engine, type FitStore } from "@eveshipfit/fitting";
import { Images } from "@eveshipfit/images";
import { LocalFits } from "@eveshipfit/react-hooks";
import { loadSde, loadTexts, type Texts } from "@eveshipfit/sde-loader";

export interface Data {
  engine: Engine;
  texts: Texts;
  fit: FitStore;
  localFits: LocalFits;
}

/** The game data, with the images on their own as they are enough for an empty window. */
export function loadData(): { images: Promise<Images>; data: Promise<Data> } {
  const files = window.esf.loadGame();
  const images = files.then((game) => new Images(game.images, { baseUrl: game.imagesUrl }));
  const data = files.then(async (game) => {
    const sde = await loadSde({ bytes: game.sde });
    const [engine, texts] = await Promise.all([
      createEngine(sde, { wasm: game.wasm }),
      loadTexts({ bytes: game.texts }),
    ]);
    return { engine, texts, fit: engine.createFit(), localFits: new LocalFits() };
  });
  return { images, data };
}
