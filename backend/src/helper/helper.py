
import pandas as pd
from io import StringIO

#Read csv helper function
async def read_csv(file):
    content = await file.read()
    # Convert bytes to string for pandas
    csv_string = content.decode('utf-8')
    # Read CSV into DataFrame
    df = pd.read_csv(StringIO(csv_string))
    return df