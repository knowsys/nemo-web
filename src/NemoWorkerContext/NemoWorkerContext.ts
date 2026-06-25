import { createContext, MutableRefObject, useContext } from "react";
import { NemoWorker } from "../nemoWorker/NemoWorker";

export const NemoWorkerContext = createContext<MutableRefObject<
  NemoWorker | undefined
> | null>(null);

export function useNemoWorkerRef() {
  return useContext(NemoWorkerContext);
}
