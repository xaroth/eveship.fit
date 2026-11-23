import { app, BrowserWindow } from "electron";
import path from "node:path";

/** Set by `pnpm dev`: the renderer comes from Vite's dev server, for HMR. */
const devServerUrl = process.env.ESF_DEV_SERVER_URL;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 900,
    backgroundColor: "#0b0d0f",
    autoHideMenuBar: true,
  });

  if (devServerUrl) void win.loadURL(devServerUrl);
  else void win.loadFile(path.join(import.meta.dirname, "renderer/index.html"));
}

void app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
