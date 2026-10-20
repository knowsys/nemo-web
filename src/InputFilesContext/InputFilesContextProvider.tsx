import { useMemo, useState } from "react";
import { InputFile, InputFilesContext } from "./InputFilesContext";

interface InputFilesProviderProps {
  children: React.ReactNode;
}

export function InputFilesProvider({ children }: InputFilesProviderProps) {
  const [inputs, setInputs] = useState<InputFile[]>([]);

  const value = useMemo(() => ({ inputs, setInputs }), [inputs]);

  return (
    <InputFilesContext.Provider value={value}>
      {children}
    </InputFilesContext.Provider>
  );
}
