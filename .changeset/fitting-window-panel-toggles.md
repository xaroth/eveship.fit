---
"@eveshipfit/ui-ingame": minor
---

`FittingWindow` can now work with an item browser and statistics that live outside it. Pass `browserToggle` or `statisticsToggle`, and its Item Browser and Statistics buttons call `onToggle` instead of sliding out their own panel. With either set, the window stretches to fill its container, keeps the wheel centered, and puts the buttons flush against its edges. The Statistics button then also shows before a hull is picked
