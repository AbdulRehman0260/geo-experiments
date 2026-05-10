# Axperiments - Geographic Analysis Tool

A synthetic control analysis web application for geographic data analysis and power calculation. Upload CSV data and analyze treatment effects across different geographies using advanced statistical methods.

## 🌟 Features

- **Data Upload**: Simple CSV file upload interface
- **Geographic Analysis**: Analyze treatment effects across multiple geographies
- **Power Analysis**: Calculate sample size requirements for different effect sizes
- **Interactive Plots**: Generate synthetic control visualizations
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Results**: Instant analysis with detailed metrics

## 🏗️ Architecture

### Frontend (React + Vite)
- **React 18** with modern hooks
- **Tailwind CSS** for responsive styling
- **Recharts** for data visualization
- **React Router** for navigation

### Backend (FastAPI + Python)
- **FastAPI** for REST API endpoints
- **Synthetic Control Method** implementation
- **Power Analysis** calculations
- **Matplotlib** for plot generation

## 📋 Prerequisites

- Node.js 18+ 
- Python 3.8+
- pip

## 🚀 Quick Start

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:
```bash
python main.py
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📊 Data Format

Upload CSV files with the following required columns:

| Column | Description | Example |
|--------|-------------|---------|
| `date` | Date of observation | `2024-01-01` |
| `geo` | Geography identifier | `US-CA` |
| `leads` | Metric value to analyze | `1250` |

### Sample CSV Structure
```csv
date,geo,leads
2024-01-01,US-CA,1250
2024-01-02,US-CA,1180
2024-01-01,US-NY,980
2024-01-02,US-NY,1020
```

## 🔧 API Endpoints

### Upload and Analyze
- `POST /upload-csv` - Upload CSV file and run analysis
- `GET /get-geos` - Get list of available geographies
- `POST /analyze-geo` - Analyze specific geography
- `POST /generate-plot` - Generate synthetic control plot

### Response Format
```json
{
  "status": "success",
  "results": {
    "US-CA": {
      "nrmse_pre": 0.0234,
      "nrmse_post": 0.0187,
      "lift": 0.156
    }
  }
}
```

## 📈 Analysis Features

### Synthetic Control Method
- Creates weighted combination of control geographies
- Estimates counterfactual for treated geography
- Measures treatment effect through lift calculation

### Power Analysis
- Calculates required sample sizes for different effect sizes
- Supports various power levels (80%, 90%, 95%)
- Helps plan experiments with adequate statistical power

### Visualization
- Pre-treatment fit validation
- Post-treatment effect visualization
- Interactive plots with customizable effect sizes

## 🎯 Usage Workflow

1. **Upload Data**: Start by uploading your CSV file on the home page
2. **View Results**: See overall analysis metrics and geography comparisons
3. **Deep Dive**: Navigate to individual geography analysis
4. **Generate Plots**: Create visualizations for specific geographies
5. **Power Planning**: Use power analysis for future experiment planning

## 🛠️ Development

### Project Structure
```
Axperiments/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── geolocation/
│   │   └── geo_experiment.py # Core analysis logic
│   └── src/helper/
│       └── helper.py        # Utility functions
├── frontend/
│   ├── src/
│   │   ├── pages/           # React components
│   │   │   ├── HomePage.jsx
│   │   │   ├── BestModel.jsx
│   │   │   └── GeoPage.jsx
│   │   ├── datastore/
│   │   │   └── data.js     # Data utilities
│   │   └── App.jsx          # Main app component
│   └── package.json
└── README.md
```

### Adding New Features
- Backend: Add new endpoints in `main.py`
- Frontend: Create new components in `src/pages/`
- Styling: Use Tailwind CSS classes for consistency

## 🔍 Troubleshooting

### Common Issues

**Upload Fails**
- Ensure CSV has required columns: `date`, `geo`, `leads`
- Check file format is valid CSV
- Verify file size is reasonable (< 50MB)

**Analysis Errors**
- Check console for detailed error messages
- Ensure sufficient data points (minimum 30 days recommended)
- Verify multiple geographies exist for synthetic control

**Plot Generation Issues**
- Check backend logs for matplotlib errors
- Ensure sufficient pre-treatment data
- Verify effect size is within reasonable range (5-20%)

## 📝 License

This project is developed by Abdul Rehman Shoukat as part of the Axperiments series.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues or questions, please refer to the project documentation or create an issue in the repository.

---

**Built with synthetic control methodology**  
*A project by Abdul Rehman Shoukat*
