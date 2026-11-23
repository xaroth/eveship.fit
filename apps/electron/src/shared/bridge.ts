import type { Panels } from "./layout";

/** The game data the main process hands the renderer. */
export interface GameFiles {
  sde: Uint8Array;
  texts: Uint8Array;
  images: Uint8Array;
  wasm: Uint8Array;
  /** Where the images of `images` are, ending in a slash. */
  imagesUrl: string;
}

export interface EsfBridge {
  loadGame(): Promise<GameFiles>;
  /** Resizes the window for panels opened or closed, keeping the rest in place on screen. */
  setPanels(panels: Panels): Promise<void>;
}
