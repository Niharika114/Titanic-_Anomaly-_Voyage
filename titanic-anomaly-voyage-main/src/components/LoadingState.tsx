
import { Wand2 } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="h-96 flex flex-col items-center justify-center">
      <Wand2 className="h-12 w-12 text-ocean-400 animate-pulse-slow mb-4" />
      <h2 className="text-xl font-semibold text-ocean-100 mb-2">Detecting Anomalies...</h2>
      <p className="text-ocean-300 text-center max-w-md">
        Analyzing passenger data to find unusual patterns and outliers
      </p>
    </div>
  );
};

export default LoadingState;
