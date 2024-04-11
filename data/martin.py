import geopandas
import os
import glob
from sqlalchemy import create_engine
# Replace with enacit4r-tiles postgres credentials (enactit4r keeweb)
dbuser = 'postgres'
dbpassword = 'password'
dbhost = 'localhost:25432'
dbname = 'db'
engine = create_engine(f"postgresql://{dbuser}:{dbpassword}@{dbhost}/{dbname}")  
schema = 'urbtrees'

for file in glob.glob("./output/*.geojson"):
  fileName = os.path.basename(file)
  baseName = fileName.replace(".geojson", "")
  print(baseName)
  gdf = geopandas.read_file(file)
  gdf.to_postgis(baseName, engine, if_exists='replace', schema=schema)