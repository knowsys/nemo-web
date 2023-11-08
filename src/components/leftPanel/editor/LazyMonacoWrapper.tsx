import { createLazyComponent } from "../../createLazyComponent";

export const LazyMonacoWrapper = createLazyComponent(
  () => import("./MonacoWrapper"),
);
