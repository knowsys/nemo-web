import { useEffect, useRef, useState } from "react";
import Form from "react-bootstrap/Form";
import "./Evonne.css";

export interface EvonneProps {
  data: string;
}

export function Evonne({ data }: EvonneProps) {
  const [isFileBrowserLayout, setFileBrowserLayout] = useState(true);
  const evonneFrame = useRef<HTMLIFrameElement | null>(null);
  const evonneFrameInitialized = useRef<boolean>(false);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.source !== evonneFrame.current?.contentWindow) {
        return;
      }

      evonneFrame.current!.contentWindow!.postMessage(
        {
          command: "show",
          data,
          isFileBrowserLayout,
        },
        "*",
      );

      evonneFrameInitialized.current = true;
    };
    window.addEventListener("message", listener);

    return () => window.removeEventListener("message", listener);
  });

  useEffect(() => {
    if (!evonneFrameInitialized.current) return;

    evonneFrame.current!.contentWindow!.postMessage(
      {
        command: "show",
        data,
        isFileBrowserLayout,
      },
      "*",
    );
  }, [data, isFileBrowserLayout]);

  return (
    <>
      <Form.Check
        type="switch"
        id="file-browser-layout-switch"
        label="File-Browser Layout"
        checked={isFileBrowserLayout}
        onChange={(ev) => setFileBrowserLayout(ev.currentTarget.checked)}
      />
      <iframe ref={evonneFrame} className="evonne-iframe" src="./evonne.html" />
    </>
  );
}
