
import { Compass } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-ocean-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <Compass className="h-8 w-8 text-ocean-300 mr-2" />
          <h1 className="text-2xl font-bold">Titanic Anomaly Voyage</h1>
        </div>
        <p className="text-ocean-200 text-sm max-w-md text-center sm:text-right">
          Exploring outliers and anomalies in the Titanic dataset using unsupervised learning techniques
        </p>
      </div>
    </header>
  );
};

export default Header;
