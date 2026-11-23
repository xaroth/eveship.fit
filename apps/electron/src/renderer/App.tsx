import type { Images } from "@eveshipfit/images";
import { EveShipFitProvider, ImagesProvider, TextsProvider, useHasFit } from "@eveshipfit/react-hooks";
import { FittingWindow, FittingWindowLoading, ItemBrowser, ShipStatistics } from "@eveshipfit/ui-ingame";
import { useId, useState, type ReactNode } from "react";

import { INITIAL_PANELS, PANEL_WIDTH, type Side } from "../shared/layout";
import styles from "./App.module.css";
import type { Data } from "./data";

/** `data` is undefined while it loads, and null when it failed; `images` can come before it. */
export function App({ data, images }: { data: Data | null | undefined; images?: Images }) {
  const [panels, setPanels] = useState(INITIAL_PANELS);
  const browserId = useId();
  const statisticsId = useId();

  if (data === null) return <p className={styles.message}>EVEShip.fit could not load.</p>;
  if (images === undefined) return <p className={styles.message}>Loading ships…</p>;

  const toggle = (side: Side, open: boolean) => {
    if (panels[side] === open) return;
    const next = { ...panels, [side]: open };
    // Closing, the panel goes before the window narrows; opening, the window widens first.
    if (!open) setPanels(next);
    void window.esf.setPanels(next).then(() => setPanels(next));
  };

  if (data === undefined) {
    return (
      <ImagesProvider images={images}>
        <main className={styles.app}>
          <Panel side="left" open={panels.left} />
          <div className={styles.fitting}>
            <FittingWindowLoading text="Loading ships…" />
          </div>
          <Panel side="right" open={panels.right} />
        </main>
      </ImagesProvider>
    );
  }

  return (
    <EveShipFitProvider engine={data.engine} fit={data.fit} localFits={data.localFits}>
      <ImagesProvider images={images}>
        <TextsProvider texts={data.texts}>
          <main className={styles.app}>
            <Panel id={browserId} side="left" open={panels.left}>
              <ItemBrowser pasteToOpen />
            </Panel>
            <div className={styles.fitting}>
              <FittingWindow
                browserToggle={{ open: panels.left, onToggle: (open) => toggle("left", open), controls: browserId }}
                statisticsToggle={{
                  open: panels.right,
                  onToggle: (open) => toggle("right", open),
                  controls: statisticsId,
                }}
                placeholder={"To start, drag a hull here from the left,\nor right-click it and pick Simulate Ship."}
              />
            </div>
            <Panel id={statisticsId} side="right" open={panels.right}>
              <Statistics />
            </Panel>
          </main>
        </TextsProvider>
      </ImagesProvider>
    </EveShipFitProvider>
  );
}

function Statistics() {
  if (!useHasFit()) return <p className={styles.message}>Pick a hull to see its statistics.</p>;
  return <ShipStatistics />;
}

function Panel({ id, side, open, children }: { id?: string; side: Side; open: boolean; children?: ReactNode }) {
  if (!open) return <div />;
  return (
    <div id={id} className={`${styles.panel} ${styles[side]}`} style={{ width: PANEL_WIDTH[side] }}>
      {children}
    </div>
  );
}
