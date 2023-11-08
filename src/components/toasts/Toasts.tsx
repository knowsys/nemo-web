import { useEffect } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../store";
import { toastsSlice } from "../../store/toasts";
import "./Toasts.css";

export function Toasts() {
  const dispatch = useAppDispatch();
  const activeToasts = useAppSelector((state) => state.toasts.activeToasts);

  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = function forwardErrorToToast() {
      dispatch(
        toastsSlice.actions.addToast({
          title: "Error",
          // eslint-disable-next-line prefer-rest-params
          description: [...arguments]
            .filter(
              (error: any) =>
                typeof error === "string" || error instanceof Error,
            )
            .map((error: any) => error.toString())
            .join(", "),
          variant: "danger",
        }),
      );
      // eslint-disable-next-line prefer-rest-params
      originalConsoleError(arguments);
    };
    return () => {
      console.error = originalConsoleError;
    };
  });

  return (
    <ToastContainer className="toasts-toast-container" position="top-end">
      {activeToasts.map((toast, index) => (
        <Toast
          bg={toast.variant}
          animation
          key={index}
          onClose={() => {
            dispatch(toastsSlice.actions.removeToast(index));
          }}
        >
          <Toast.Header closeButton={true}>
            <strong className="me-auto">{toast.title}</strong>
          </Toast.Header>
          <Toast.Body>{toast.description}</Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
}
