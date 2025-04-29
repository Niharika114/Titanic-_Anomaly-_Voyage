
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  retry?: () => void;
}

const ErrorState = ({ error, retry }: ErrorStateProps) => {
  return (
    <div className="h-96 flex flex-col items-center justify-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
      <h2 className="text-xl font-semibold text-white mb-2">Something Went Wrong</h2>
      <p className="text-gray-300 text-center max-w-md mb-6">{error}</p>
      {retry && (
        <Button onClick={retry} variant="outline">
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
