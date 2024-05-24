import { Form, ButtonGroup, ToggleButton } from "react-bootstrap";
import { Icon } from "../Icon";
import "./NavigationBar.css";
import { useAppDispatch, useAppSelector } from "../../store";
import { uiSettingsSlice } from "../../store/uiSettings";
import { TextTooltip } from "../TextTooltip";

export function UISettings() {
  const dispatch = useAppDispatch();
  const uiSettings = useAppSelector((state) => state.uiSettings);

  return (
    <Form className="navigation-bar-disable-hover">
      <ButtonGroup>
        <TextTooltip
          text="Show program editor"
          tooltipID="ui-settings-left-panel-tooltip"
        >
          <ToggleButton
            id="ui-settings-left-panel-toggle"
            variant="outline-dark"
            type="checkbox"
            checked={uiSettings.showLeftPanel}
            value={1}
            onChange={() => dispatch(uiSettingsSlice.actions.toggleLeftPanel())}
          >
            <Icon name="file-earmark-code" />
          </ToggleButton>
        </TextTooltip>
        <TextTooltip
          text="Show execution panel"
          tooltipID="ui-settings-right-panel-tooltip"
        >
          <ToggleButton
            id="ui-settings-right-panel-toggle"
            variant="outline-dark"
            type="checkbox"
            checked={uiSettings.showRightPanel}
            value={1}
            onChange={() =>
              dispatch(uiSettingsSlice.actions.toggleRightPanel())
            }
          >
            <Icon name="caret-right" />
          </ToggleButton>
        </TextTooltip>
      </ButtonGroup>{" "}
      <TextTooltip text="Maximize" tooltipID="ui-settings-maximize-tooltip">
        <ToggleButton
          id="ui-settings-maximize-toggle"
          variant="outline-secondary"
          type="checkbox"
          checked={uiSettings.enableFullscreen}
          value={1}
          onChange={() => {
            dispatch(uiSettingsSlice.actions.toggleFullscreen());
          }}
        >
          <Icon name="arrows-fullscreen" />
        </ToggleButton>
      </TextTooltip>
    </Form>
  );
}
