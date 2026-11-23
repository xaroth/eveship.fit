export type Side = "left" | "right";

export type Panels = Record<Side, boolean>;

export const INITIAL_PANELS: Panels = { left: true, right: true };

/** What a panel adds to the window when open, padding and border included. */
export const PANEL_WIDTH: Record<Side, number> = { left: 420, right: 310 };

/** Room for the fitting window, which needs 708 at 100%. */
export const FITTING_WIDTH = 710;
export const MIN_HEIGHT = 720;

export function minWidth(panels: Panels): number {
  return FITTING_WIDTH + (panels.left ? PANEL_WIDTH.left : 0) + (panels.right ? PANEL_WIDTH.right : 0);
}
