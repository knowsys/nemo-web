import { useEffect, useRef } from "react";
import "./Evonne.css";

export interface EvonneProps {
  data: string;
}

export function Evonne({ data }: EvonneProps) {
  const evonneFrame = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.source !== evonneFrame.current?.contentWindow) {
        return;
      }

      evonneFrame.current!.contentWindow!.postMessage(
        {
          command: "show",
          data,
        },
        "*",
      );
    };
    window.addEventListener("message", listener);

    return () => window.removeEventListener("message", listener);
  });

  return (
    <iframe ref={evonneFrame} className="evonne-iframe" src="./evonne.html" />
  );
}
