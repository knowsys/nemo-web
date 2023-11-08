export interface ToastInfo {
  variant: "warning" | "danger" | "info";
  title: string;
  description: string;
}

export interface Toasts {
  activeToasts: ToastInfo[];
}
