
import pandas as pd
from io import StringIO, BytesIO

#Read file helper function (supports CSV and Excel)
async def read_file(file):
    content = await file.read()
    filename = file.filename.lower()
    
    # Check file extension and read accordingly
    if filename.endswith('.csv'):
        # Convert bytes to string for pandas
        csv_string = content.decode('utf-8')
        # Read CSV into DataFrame
        df = pd.read_csv(StringIO(csv_string))
    elif filename.endswith(('.xlsx', '.xls')):
        # Read Excel into DataFrame
        df = pd.read_excel(BytesIO(content))
    else:
        raise ValueError("Unsupported file format. Please upload CSV or Excel files.")
    
    return df