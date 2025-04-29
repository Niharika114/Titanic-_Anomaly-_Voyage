
import { useState, useEffect } from 'react';

// Define types
export interface Passenger {
  PassengerId: number;
  Survived: number;
  Pclass: number;
  Name: string;
  Sex: string;
  Age: number | null;
  SibSp: number;
  Parch: number;
  Ticket: string;
  Fare: number;
  Cabin: string | null;
  Embarked: string | null;
  
  // Derived features
  Title?: string;
  FamilySize?: number;
  IsAlone?: boolean;
  HasCabin?: boolean;
  
  // Anomaly detection results
  IsAnomalyIsolation?: boolean;
  IsAnomalyLOF?: boolean;
  AnomalyScoreIsolation?: number;
  AnomalyScoreLOF?: number;
}

// Titanic dataset from a public URL
const TITANIC_DATA_URL = 'https://raw.githubusercontent.com/datasciencedojo/datasets/master/titanic.csv';

// Helper function to parse CSV
const parseCSV = (text: string): Passenger[] => {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map((line) => {
    const values = line.split(',');
    const passenger: any = {};
    
    headers.forEach((header, index) => {
      let value = values[index];
      
      // Convert numerical values
      if (['PassengerId', 'Survived', 'Pclass', 'SibSp', 'Parch'].includes(header)) {
        passenger[header] = parseInt(value);
      } else if (header === 'Age' || header === 'Fare') {
        passenger[header] = value ? parseFloat(value) : null;
      } else {
        passenger[header] = value === '' ? null : value;
      }
    });
    
    // Feature engineering
    passenger.Title = extractTitle(passenger.Name);
    passenger.FamilySize = passenger.SibSp + passenger.Parch + 1;
    passenger.IsAlone = passenger.FamilySize === 1;
    passenger.HasCabin = passenger.Cabin !== null;
    
    return passenger as Passenger;
  });
};

// Extract title from name
const extractTitle = (name: string): string => {
  const match = name.match(/,\s([^\.]+)\./);
  if (match && match[1]) {
    const title = match[1].trim();
    // Consolidate rare titles
    if (['Capt', 'Col', 'Major', 'Dr', 'Rev'].includes(title)) {
      return 'Officer';
    } else if (['Dona', 'Lady', 'the Countess', 'Sir', 'Don', 'Jonkheer'].includes(title)) {
      return 'Royalty';
    } else if (['Mlle', 'Ms'].includes(title)) {
      return 'Miss';
    } else if (title === 'Mme') {
      return 'Mrs';
    }
    return title;
  }
  return 'Unknown';
};

// Main hook for handling Titanic data
export const useTitanicData = () => {
  const [data, setData] = useState<Passenger[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(TITANIC_DATA_URL);
        
        if (!response.ok) {
          throw new Error('Failed to fetch Titanic data');
        }
        
        const text = await response.text();
        const passengers = parseCSV(text);
        
        // Apply mock anomaly detection results for demonstration
        // In a real app, this would use actual ML algorithms
        applyMockAnomalyDetection(passengers);
        
        setData(passengers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
        console.error('Error fetching Titanic data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Run mock anomaly detection using simple rules
  // In a real app, this would use actual ML algorithms like Isolation Forest and LOF
  const applyMockAnomalyDetection = (passengers: Passenger[], contamination = 0.05) => {
    // Calculate number of anomalies based on contamination rate
    const anomalyCount = Math.ceil(passengers.length * contamination);
    
    // Sort passengers by anomaly score (for demonstration, we'll use extreme values)
    const withScores = passengers.map(p => {
      const fareScore = p.Fare ? Math.abs((p.Fare - 33) / 50) : 0; // Fare outliers
      const ageScore = p.Age ? Math.abs((p.Age - 30) / 30) : 0; // Age outliers
      const classScore = p.Pclass === 1 && p.Fare && p.Fare > 200 ? 1 : 0; // High fare first class
      const familyScore = p.FamilySize && p.FamilySize > 5 ? 1 : 0; // Large families
      
      // Different scoring methods for different algorithms
      const isolationScore = fareScore * 0.4 + ageScore * 0.3 + classScore * 0.2 + familyScore * 0.1;
      const lofScore = fareScore * 0.5 + ageScore * 0.2 + familyScore * 0.3;
      
      return {
        ...p,
        AnomalyScoreIsolation: isolationScore,
        AnomalyScoreLOF: lofScore
      };
    });
    
    // Sort by scores and mark top anomalies
    const isolationSorted = [...withScores].sort((a, b) => 
      (b.AnomalyScoreIsolation || 0) - (a.AnomalyScoreIsolation || 0));
    const lofSorted = [...withScores].sort((a, b) => 
      (b.AnomalyScoreLOF || 0) - (a.AnomalyScoreLOF || 0));
    
    // Get IDs of top anomalies
    const isolationAnomalyIds = new Set(
      isolationSorted.slice(0, anomalyCount).map(p => p.PassengerId)
    );
    const lofAnomalyIds = new Set(
      lofSorted.slice(0, anomalyCount).map(p => p.PassengerId)
    );
    
    // Mark anomalies in the original data
    passengers.forEach(p => {
      p.IsAnomalyIsolation = isolationAnomalyIds.has(p.PassengerId);
      p.IsAnomalyLOF = lofAnomalyIds.has(p.PassengerId);
    });
  };
  
  // Apply a different contamination rate (percent of outliers)
  const updateContamination = (newContamination: number) => {
    if (data.length > 0) {
      const newData = [...data];
      applyMockAnomalyDetection(newData, newContamination / 100);
      setData(newData);
    }
  };
  
  // Get stats about anomalies
  const getAnomalyStats = (algorithm: 'isolation' | 'lof') => {
    if (data.length === 0) return null;
    
    const isAnomalyKey = algorithm === 'isolation' ? 'IsAnomalyIsolation' : 'IsAnomalyLOF';
    const anomalies = data.filter(p => p[isAnomalyKey]);
    const normal = data.filter(p => !p[isAnomalyKey]);
    
    const getAverage = (arr: any[], key: keyof Passenger) => {
      const validValues = arr.filter(item => item[key] !== null && item[key] !== undefined);
      if (validValues.length === 0) return 0;
      return validValues.reduce((sum, item) => sum + Number(item[key]), 0) / validValues.length;
    };
    
    const getDistribution = (arr: any[], key: keyof Passenger) => {
      const counts: Record<string, number> = {};
      arr.forEach(item => {
        if (item[key] !== null && item[key] !== undefined) {
          const value = String(item[key]);
          counts[value] = (counts[value] || 0) + 1;
        }
      });
      return counts;
    };
    
    return {
      count: anomalies.length,
      percentage: (anomalies.length / data.length) * 100,
      avgAge: {
        anomalies: getAverage(anomalies, 'Age'),
        normal: getAverage(normal, 'Age'),
      },
      avgFare: {
        anomalies: getAverage(anomalies, 'Fare'),
        normal: getAverage(normal, 'Fare'),
      },
      avgFamilySize: {
        anomalies: getAverage(anomalies, 'FamilySize'),
        normal: getAverage(normal, 'FamilySize'),
      },
      pclassDistribution: {
        anomalies: getDistribution(anomalies, 'Pclass'),
        normal: getDistribution(normal, 'Pclass'),
      },
      sexDistribution: {
        anomalies: getDistribution(anomalies, 'Sex'),
        normal: getDistribution(normal, 'Sex'),
      },
      survivalRate: {
        anomalies: getAverage(anomalies, 'Survived') * 100,
        normal: getAverage(normal, 'Survived') * 100,
      },
      embarkedDistribution: {
        anomalies: getDistribution(anomalies, 'Embarked'),
        normal: getDistribution(normal, 'Embarked'),
      },
      titleDistribution: {
        anomalies: getDistribution(anomalies, 'Title'),
        normal: getDistribution(normal, 'Title'),
      }
    };
  };
  
  return {
    data,
    isLoading,
    error,
    updateContamination,
    getAnomalyStats
  };
};
