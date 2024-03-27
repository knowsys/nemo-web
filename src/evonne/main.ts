async function init() {
  console.info("[Evonne main.ts] Initializing");

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.io = () => {
    return {
      on: () => {},
    };
  };
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await import("materialize-css/dist/js/materialize.min.js");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.svgPanZoom = (await import("svg-pan-zoom")).default;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window._ = await import("underscore/underscore-min.js");
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  window.d3 = await import("d3");

  const { init_proof } = await import(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    "evonne/frontend/public/js/proof/proof.js"
  );

  window.addEventListener("message", (event) => {
    console.info("[Evonne main.ts] Received message", event);

    const { command, data } = event.data;

    if (command !== "show") {
      throw new Error("Unknown command");
    }

    const blob = new Blob([data], {
      type: "application/xml",
    });

    init_proof({
      external: {
        div: "root",
        path: URL.createObjectURL(blob),
        drawTime: 500,
      },
    });
  });

  console.info("[Evonne main.ts] Finished initialization");

  window.parent.postMessage("", "*");
}

init().catch(console.error);
