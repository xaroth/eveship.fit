import { app, BrowserWindow, ipcMain, screen } from "electron";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";

import type { GameFiles } from "../shared/bridge";
import { INITIAL_PANELS, MIN_HEIGHT, minWidth, PANEL_WIDTH, type Panels, type Side } from "../shared/layout";

const { resolve } = createRequire(import.meta.url);

/** Set by `pnpm dev`: the renderer comes from Vite's dev server, for HMR. */
const devServerUrl = process.env.ESF_DEV_SERVER_URL;

/** The dev server's page cannot load file: URLs, so it gets the images from the dev server too. */
function imagesUrl(dir: string): string {
  if (devServerUrl) return new URL(`@fs/${dir.replaceAll("\\", "/").replace(/^\//, "")}/`, devServerUrl).href;
  return `${pathToFileURL(dir).href}/`;
}

async function loadGameFiles(): Promise<GameFiles> {
  const imagesDat = resolve("@eveshipfit/images/dist/images.dat");
  const [sde, texts, images, wasm] = await Promise.all([
    readFile(resolve("@eveshipfit/sde/dist/sde.dat")),
    readFile(resolve("@eveshipfit/sde/dist/texts.dat")),
    readFile(imagesDat),
    readFile(resolve("@eveshipfit/dogma-engine/esf_dogma_engine_bg.wasm")),
  ]);
  return {
    sde,
    texts,
    images,
    wasm,
    imagesUrl: imagesUrl(path.join(path.dirname(imagesDat), "images")),
  };
}

const shownPanels = new WeakMap<BrowserWindow, Panels>();

/** Widens or narrows the window on the side of each panel that changed, so the rest stays in place. */
function setPanels(win: BrowserWindow, panels: Panels) {
  const shown = shownPanels.get(win) ?? INITIAL_PANELS;
  shownPanels.set(win, panels);
  const delta = (side: Side) =>
    panels[side] === shown[side] ? 0 : panels[side] ? PANEL_WIDTH[side] : -PANEL_WIDTH[side];
  const left = delta("left");
  const right = delta("right");

  // Lowered before narrowing and raised after widening, so the minimum never blocks the resize.
  if (left + right < 0) setMinimumContentSize(win, minWidth(panels));
  if (!win.isMaximized() && !win.isFullScreen()) {
    const bounds = win.getContentBounds();
    const { workArea } = screen.getDisplayMatching(win.getBounds());
    win.setContentBounds({
      ...bounds,
      x: Math.max(workArea.x, bounds.x - left),
      width: Math.max(minWidth(panels), bounds.width + left + right),
    });
  }
  if (left + right > 0) setMinimumContentSize(win, minWidth(panels));
}

/** `setMinimumSize` takes the outer size; this takes the size inside the frame, like the layout. */
function setMinimumContentSize(win: BrowserWindow, width: number) {
  const [outerWidth, outerHeight] = win.getSize();
  const [innerWidth, innerHeight] = win.getContentSize();
  win.setMinimumSize(width + outerWidth! - innerWidth!, MIN_HEIGHT + outerHeight! - innerHeight!);
}

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  const min = minWidth(INITIAL_PANELS);
  const win = new BrowserWindow({
    width: Math.min(min, width),
    height: Math.min(MIN_HEIGHT, height),
    useContentSize: true,
    backgroundColor: "#0b0d0f",
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(import.meta.dirname, "preload.cjs"),
    },
  });
  setMinimumContentSize(win, min);

  if (devServerUrl) void win.loadURL(devServerUrl);
  else void win.loadFile(path.join(import.meta.dirname, "renderer/index.html"));
}

ipcMain.handle("esf:game", loadGameFiles);
ipcMain.handle("esf:panels", (event, panels: Panels) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) setPanels(win, panels);
});

void app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
