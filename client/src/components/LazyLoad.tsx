import { ErrorBoundary } from "react-error-boundary";
import Spinner from "react-bootstrap/Spinner";
import { useNavigate } from "react-router-dom";
import { Suspense } from "react";

interface LazyLoadProps {
  element?: React.ReactNode;
  children?: React.ReactNode;
}

const LazyLoad = ({ element, children }: LazyLoadProps) => {
  const navigate = useNavigate();
  const content = element ?? children;
  return (
    <ErrorBoundary fallback={<h2>Could not fetch. Please refresh</h2>} onReset={() => navigate("/")}>
      <Suspense fallback={<Spinner animation="border" className="mt-5" />}>{content}</Suspense>
    </ErrorBoundary>
  );
};

export default LazyLoad;
