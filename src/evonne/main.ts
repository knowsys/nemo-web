console.info("[Evonne main.ts] Initializing");

import "materialize-css/dist/js/materialize.min.js";

import svgPanZoom from "svg-pan-zoom";
// @ts-ignore
import * as underscore from "underscore/underscore-min.js";
// @ts-ignore
import * as d3 from "d3";

// @ts-ignore
window.svgPanZoom = svgPanZoom;
// @ts-ignore
window._ = underscore;
// @ts-ignore
window.d3 = d3;

// @ts-ignore
import { init_proof } from "evonne/frontend/public/js/proof/proof.js";

window.addEventListener("message", (event) => {
  console.info("[Evonne main.ts] Received message", event);

  const { command, data, isFileBrowserLayout } = event.data;

  if (command !== "show") {
    throw new Error("Unknown command");
  }

  const blob = new Blob([data], {
    type: "application/xml",
  });

  const layoutOptions = isFileBrowserLayout
    ? {
        drawTime: 0,
        isLinear: true,
        isBreadthFirst: false,
        bottomRoot: false,
        isCompact: true,
        isZoomPan: true, // TODO: for some reason changing this when switching layout still does not allow panning so we keep it always enables
        compactInteraction: true,
      }
    : {
        drawTime: 500,
        isLinear: false,
        isBreadthFirst: true,
        bottomRoot: true,
        isCompact: false,
        isZoomPan: true,
        compactInteraction: false,
      };

  init_proof({
    external: {
      ...layoutOptions,
      div: "root",
      path: URL.createObjectURL(blob),
      showRules: true,
      trays: { upper: false, lower: false },
      stepNavigator: false,
    },
  });
});

console.info("[Evonne main.ts] Finished initialization");

window.parent.postMessage("", "*");
