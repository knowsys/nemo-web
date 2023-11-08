import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { Placement } from "react-bootstrap/esm/types";

export interface TooltipProps {
  text: string;
  tooltipID: string;
  children: JSX.Element;
  placement?: Placement;
}

/**
 * Simple tooltip only containing unformatted text.
 *
 * The children property does not support all kinds of HTML elements.
 */
export function TextTooltip(props: TooltipProps) {
  return (
    <OverlayTrigger
      placement={props.placement || "bottom"}
      overlay={<Tooltip id={props.tooltipID}>{props.text}</Tooltip>}
    >
      {props.children}
    </OverlayTrigger>
  );
}
