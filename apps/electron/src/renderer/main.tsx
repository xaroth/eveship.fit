import type { Images } from "@eveshipfit/images";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@fontsource-variable/noto-sans";
import "@eveshipfit/ui-ingame/theme.css";
import "./global.css";

import { App } from "./App";
import { loadData, type Data } from "./data";

const root = createRoot(document.getElementById("root")!);
const loaded: { data?: Data | null; images?: Images } = {};
const render = () =>
  root.render(
    <StrictMode>
      <App data={loaded.data} images={loaded.images} />
    </StrictMode>,
  );

render();
const { images, data } = loadData();
images.then(
  (loadedImages) => {
    loaded.images = loadedImages;
    render();
  },
  () => {},
);
data.then(
  (loadedData) => {
    loaded.data = loadedData;
    render();
  },
  (error: unknown) => {
    console.error(error);
    loaded.data = null;
    render();
  },
);
