from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from src.helper.helper import read_csv

import pandas as pd
import numpy as np

stored_dataframes = {}
stored_geos = []

app = FastAPI(title="Axperiments API", description="Synthetic Control Analysis API")

origins = [
    "https://axperiments-frontend.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=['*'],
    allow_headers=['*']
)

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/get-geos")
def get_geos():
    if stored_geos and len(stored_geos) > 0:
        return {"geos": stored_geos}
    else:
        return {"error":"No Stored geos found"}

@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    from geolocation import GeoSelector

    if not file.filename.endswith('.csv'):
        return {"error": "File must be a CSV"}
    
    try:
        df = await read_csv(file)
        stored_dataframes["main"] = df
        global stored_geos
        stored_geos = df['geo'].unique().tolist()
        print(f"Stored geos: {stored_geos}")

        geo_test = GeoSelector(df, metric='leads', geo_column='geo')
        results = geo_test.calculate_all_results()
        
        return {
            "status": "success", 
            "message": "File uploaded and analyzed successfully",
            "results": results.to_dict(orient="index")
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


class geoConfig(BaseModel):
    geo:str
    effect_sizes: list = [0.05, 0.10, 0.15, 0.20]

class plotConfig(BaseModel):
    geo:str
    effect_size: float = 0.10

@app.post("/analyze-geo")
async def analyze(geo:geoConfig):
    df = stored_dataframes.get("main")
    if df is None:
        return {"status": "error", "message": "No DataFrame stored. Please upload a CSV first."}
    
    try:
        from geolocation import GeoTest
        geo_test = GeoTest(df, "leads", "geo", geo.geo)
        results = geo_test.calculate_power(effect_sizes=geo.effect_sizes)
        
        return {
            "status": "success",
            "geo": geo.geo,
            "effect_sizes": geo.effect_sizes,
            "power_analysis": results.to_dict(orient="records")
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}

@app.post("/generate-plot")
async def generate_plot(config: plotConfig):
    df = stored_dataframes.get("main")
    if df is None:
        return {"status": "error", "message": "No DataFrame stored. Please upload a CSV first."}
    
    try:
        from geolocation import GeoTest
        import base64
        import io
        import matplotlib
        import matplotlib.pyplot as plt
        
        # Set non-interactive backend before any plotting
        matplotlib.use('Agg')
        
        geo_test = GeoTest(df, "leads", "geo", config.geo)
        
        # Get the data for plotting
        y_pred_pre, pre_period_y, y_pred_post, post_period_y = geo_test.model(config.geo)
        
        # Simulate effect
        simulated_post = post_period_y * (1 + config.effect_size)
        
        # Get dates
        dates = df['date'].unique()[-180:]
        pre_dates = dates[:-60]
        post_dates = dates[-60:]
        
        # Create the plot manually
        plt.figure(figsize=(12, 6))
        
        # Plot original data
        plt.plot(pre_dates, pre_period_y, 'b-', label='Actual (Pre)', linewidth=2)
        plt.plot(pre_dates, y_pred_pre, 'b--', label='Synthetic (Pre)', linewidth=2)
        plt.plot(post_dates, post_period_y, 'r-', label='Actual (Post - Original)', linewidth=2, alpha=0.5)
        plt.plot(post_dates, y_pred_post, 'r--', label='Synthetic (Post)', linewidth=2)
        
        # Plot simulated effect
        plt.plot(post_dates, simulated_post, 'g-', label=f'Actual (Post + {config.effect_size*100:.0f}% Effect)', linewidth=3)
        
        plt.axvline(x=post_dates[0], color='gray', linestyle=':', label='Treatment Start')
        plt.title(f'Effect Simulation - {config.geo} ({config.effect_size*100:.0f}% Effect)')
        plt.ylabel('Leads')
        plt.legend()
        plt.grid(True, alpha=0.3)
        plt.xticks(rotation=45)
        plt.tight_layout()
        
        # Save plot to base64
        buf = io.BytesIO()
        plt.savefig(buf, format='png', dpi=150, bbox_inches='tight')
        buf.seek(0)
        plot_data = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        
        return {
            "status": "success",
            "geo": config.geo,
            "effect_size": config.effect_size,
            "plot": plot_data
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
