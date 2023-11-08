import { createSlice } from "@reduxjs/toolkit";
import { initialUISettings } from "./initialUISettings";
import { setAllUISettings } from "./reducers/setAllUISettings";
import { toggleFullscreen } from "./reducers/toggleFullscreen";
import { toggleLeftPanel } from "./reducers/toggleLeftPanel";
import { toggleRightPanel } from "./reducers/toggleRightPanel";

export const uiSettingsSlice = createSlice({
  name: "uiSettings",
  initialState: initialUISettings,
  reducers: {
    toggleLeftPanel,
    toggleRightPanel,
    toggleFullscreen,
    setAllUISettings,
  },
});
