
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis 
} from 'recharts';
import { useTitanicData } from '@/services/titanicData';
import LoadingState from './LoadingState';
import ErrorState from './ErrorState';

const COLORS = {
  anomaly: '#ef4444',
  normal: '#22c55e',
};

const Dashboard = () => {
  const { data, isLoading, error, updateContamination, getAnomalyStats } = useTitanicData();
  const [algorithm, setAlgorithm] = useState<'isolation' | 'lof'>('isolation');
  const [contamination, setContamination] = useState<number>(5);
  
  // Handle contamination change
  const handleContaminationChange = (value: number[]) => {
    const newValue = value[0];
    setContamination(newValue);
    updateContamination(newValue);
  };
  
  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  
  const stats = getAnomalyStats(algorithm);
  if (!stats) return <ErrorState error="Failed to calculate statistics" />;
  
  // Prepare data for visualizations
  const survivalData = [
    { name: 'Anomalies', survival: stats.survivalRate.anomalies },
    { name: 'Normal', survival: stats.survivalRate.normal },
  ];
  
  const classDistributionData = Object.entries(stats.pclassDistribution.anomalies).map(([key, value]) => ({
    name: `Class ${key}`,
    anomaly: value,
    normal: stats.pclassDistribution.normal[key] || 0,
  }));
  
  const genderDistributionData = Object.entries(stats.sexDistribution.anomalies).map(([key, value]) => ({
    name: key,
    value,
  }));
  
  // Scatter plot data (Age vs Fare)
  const scatterData = data.map(p => ({
    x: p.Age || 0, 
    y: p.Fare || 0,
    z: 10,
    isAnomaly: algorithm === 'isolation' ? p.IsAnomalyIsolation : p.IsAnomalyLOF,
    passengerId: p.PassengerId,
  }));
  
  const anomalyScatterData = scatterData.filter(d => d.isAnomaly);
  const normalScatterData = scatterData.filter(d => !d.isAnomaly);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Anomaly Detection Algorithm</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="isolation" onValueChange={(v) => setAlgorithm(v as 'isolation' | 'lof')}>
              <TabsList className="w-full">
                <TabsTrigger value="isolation" className="w-1/2">Isolation Forest</TabsTrigger>
                <TabsTrigger value="lof" className="w-1/2">Local Outlier Factor</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Contamination Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="pt-2">
              <Slider 
                value={[contamination]} 
                onValueChange={handleContaminationChange}
                min={1}
                max={20}
                step={1}
              />
              <div className="mt-2 text-center text-sm text-muted-foreground">
                {contamination}% of passengers will be flagged as anomalies
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Anomaly Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-anomaly">{stats.count}</span> anomalous passengers detected
                (<span className="font-medium">{stats.percentage.toFixed(1)}%</span> of total)
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-anomaly">{stats.survivalRate.anomalies.toFixed(1)}%</span> survival rate for anomalies vs. 
                <span className="font-medium text-normal"> {stats.survivalRate.normal.toFixed(1)}%</span> for normal passengers
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Age vs Fare Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="x" name="Age" unit=" yrs" />
                  <YAxis type="number" dataKey="y" name="Fare" unit=" £" />
                  <ZAxis range={[60, 60]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter
                    name="Normal Passengers"
                    data={normalScatterData}
                    fill={COLORS.normal}
                    opacity={0.7}
                  />
                  <Scatter
                    name="Anomalies"
                    data={anomalyScatterData}
                    fill={COLORS.anomaly}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Survival Rate Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={survivalData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis label={{ value: 'Survival Rate (%)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="survival" name="Survival Rate" fill="#0da2e7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Passenger Class Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={classDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="anomaly" name="Anomalies" fill={COLORS.anomaly} />
                  <Bar dataKey="normal" name="Normal" fill={COLORS.normal} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Anomaly Gender Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={genderDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {genderDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ec4899'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Anomaly Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Key Characteristics of Anomalies:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <span className="font-medium">Age:</span> Anomalies average {stats.avgAge.anomalies.toFixed(1)} years vs {stats.avgAge.normal.toFixed(1)} for normal passengers
                </li>
                <li>
                  <span className="font-medium">Fare:</span> Anomalies paid £{stats.avgFare.anomalies.toFixed(2)} on average vs £{stats.avgFare.normal.toFixed(2)} for normal passengers
                </li>
                <li>
                  <span className="font-medium">Family Size:</span> Anomalies have {stats.avgFamilySize.anomalies.toFixed(1)} family members vs {stats.avgFamilySize.normal.toFixed(1)} for normal passengers
                </li>
                <li>
                  <span className="font-medium">Survival Impact:</span> Being classified as an anomaly {
                    stats.survivalRate.anomalies > stats.survivalRate.normal 
                      ? 'increased' 
                      : 'decreased'
                  } survival probability by {Math.abs(stats.survivalRate.anomalies - stats.survivalRate.normal).toFixed(1)}%
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Interpretation:</h3>
              <p className="text-sm text-muted-foreground">
                Anomalies represent statistically unusual passengers based on their characteristics. 
                These may include passengers with extremely high or low fares, unusual age groups, 
                or unique combinations of features that make them stand out from the majority of passengers.
                The {algorithm === 'isolation' ? 'Isolation Forest' : 'Local Outlier Factor'} algorithm
                identifies these outliers without using survival information.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
