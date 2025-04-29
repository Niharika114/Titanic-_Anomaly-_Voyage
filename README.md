 Titanic Anomaly Voyage

## Overview

Titanic Anomaly Voyage is an interactive web application that explores anomalies and outliers in the Titanic dataset using unsupervised machine learning techniques. The application uses mock implementations of Isolation Forest and Local Outlier Factor (LOF) algorithms to detect passengers with unusual characteristics.
Screenshot 
![image](https://github.com/user-attachments/assets/89dc8dc3-9690-49ca-9a11-b4a05aadf0bf)
![image](https://github.com/user-attachments/assets/d04547bd-a2d6-4502-8891-c35fc47effe4)



## Features

- **Interactive Anomaly Detection**: Toggle between Isolation Forest and Local Outlier Factor algorithms
- **Adjustable Contamination Rate**: Control the percentage of passengers that will be flagged as anomalies
- **Visual Analytics**:
  - Age vs. Fare scatter plot highlighting anomalies
  - Survival rate comparison between anomalies and normal passengers
  - Passenger class distribution analysis
  - Gender distribution among anomalous passengers
  - Comprehensive insights into what makes certain passengers unusual

## Technologies Used

- **React**: Frontend framework
- **TypeScript**: Type-safe JavaScript
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: UI component library
- **Recharts**: Charting library for visualizations
- **Vite**: Build tool and development environment

## Getting Started

### Local Development

```sh
# Clone the repository 
git clone <REPOSITORY_URL>

# Navigate to the project directory
cd titanic-anomaly-voyage

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at http://localhost:5173/

## How It Works

1. **Data Loading**: The application fetches the Titanic dataset from a public source
2. **Preprocessing**: The data undergoes cleaning and feature engineering to prepare for anomaly detection
3. **Anomaly Detection**: Two algorithms are simulated to identify statistical outliers:
   - **Isolation Forest**: Identifies anomalies by isolating observations
   - **Local Outlier Factor**: Detects outliers by measuring local density deviation
4. **Visualization**: Interactive charts display the characteristics of anomalies compared to normal passengers

## Understanding Anomalies

In this application, anomalies represent statistically unusual passengers based on their characteristics such as:
- Extreme fare values
- Unusual age groups
- Uncommon combinations of features
- Atypical family sizes

The algorithms don't use survival information when identifying anomalies, allowing for unbiased exploration of how these unusual cases correlated with survival outcomes.

## Project Structure

- `src/components/`: React components including the dashboard and visualizations
- `src/services/`: Data fetching and processing logic
- `src/pages/`: Application pages


## Acknowledgements

- Data sourced from the public Titanic dataset
- Anomaly detection algorithms are simulated for educational purposes# Titanic-_Anomaly-_Voyage
  
