import { Suspense } from "react";
import { Spinner } from "react-bootstrap";

export function DefaultSpinner() {
  return (
    <>
      <div className="d-flex justify-content-center">
        <div className="spinner-border m-2" role="status">
          <span className="visually-hidden">
            <Spinner />
          </span>
        </div>
      </div>
    </>
  );
}

export interface DefaultSuspenseProps {
  children: JSX.Element;
}

export function DefaultSuspense({ children }: DefaultSuspenseProps) {
  return <Suspense fallback={<DefaultSpinner />}>{children}</Suspense>;
}
