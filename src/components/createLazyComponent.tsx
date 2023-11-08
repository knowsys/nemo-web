import { ComponentType, lazy } from "react";

export function createLazyComponent<T extends ComponentType<any>>(
  loader: () => Promise<Record<any, T>>,
) {
  return lazy(async () => {
    return { default: Object.values(await loader())[0] };
  });
}
