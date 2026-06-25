import { useRef } from "react";
import { NemoWorker } from "../nemoWorker/NemoWorker";
import { NemoWorkerContext } from "./NemoWorkerContext";

interface NemoWorkerProviderProps {
  children: React.ReactNode;
}

export function NemoWorkerProvider({ children }: NemoWorkerProviderProps) {
  const workerRef = useRef<NemoWorker | undefined>(undefined);

  return (
    <NemoWorkerContext.Provider value={workerRef}>
      {children}
    </NemoWorkerContext.Provider>
  );
}
