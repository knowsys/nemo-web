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
        isLinear: true,
        isCompact: true,
      }
    : {
        isLinear: false,
        isCompact: false,
      };

  init_proof({
    external: {
      ...layoutOptions,
      div: "root",
      path: URL.createObjectURL(blob),
      drawTime: 500,
      showRules: true,
      trays: { upper: false, lower: false },
      stepNavigator: false,
    },
  });
});

console.info("[Evonne main.ts] Finished initialization");

window.parent.postMessage("", "*");
