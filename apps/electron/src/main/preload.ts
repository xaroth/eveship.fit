import { contextBridge, ipcRenderer } from "electron";

import type { EsfBridge } from "../shared/bridge";

const bridge: EsfBridge = {
  loadGame: () => ipcRenderer.invoke("esf:game"),
  setPanels: (panels) => ipcRenderer.invoke("esf:panels", panels),
};

contextBridge.exposeInMainWorld("esf", bridge);
