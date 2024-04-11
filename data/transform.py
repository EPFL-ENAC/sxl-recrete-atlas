from osgeo import ogr, osr
import os
import glob
import math

driver = ogr.GetDriverByName('GeoJSON')
# viridis colors from https://observablehq.com/@d3/color-schemes
colors = {
    "voc": [
        {
            "range": [2784.4, 100000.0],
            "color": "#440154"
        },
        {
            "range": [807.3, 2784.4],
            "color": "#482878"
        },
        {
            "range": [538.2, 807.3],
            "color": "#3e4989"
        },
        {
            "range": [198.5, 538.2],
            "color": "#31688e"
        },
        {
            "range": [116.8, 198.5],
            "color": "#26828e"
        },
        {
            "range": [87.2, 116.8],
            "color": "#1f9e89"
        },
        {
            "range": [51.9, 87.2],
            "color": "#35b779"
        },
        {
            "range": [23.1, 51.9],
            "color": "#6ece58"
        },
        {
            "range": [5.1, 23.1],
            "color": "#b5de2b"
        },
        {
            "range": [0, 5.1],
            "color": "#fde725"
        }
    ],
    "o3": [
        {
            "range": [0, 31],
            "color": "#440154"
        },
        {
            "range": [31, 110],
            "color": "#482878"
        },
        {
            "range": [110, 153],
            "color": "#3e4989"
        },
        {
            "range": [153, 228],
            "color": "#31688e"
        },
        {
            "range": [228, 269],
            "color": "#26828e"
        },
        {
            "range": [269, 441],
            "color": "#1f9e89"
        },
        {
            "range": [441, 717],
            "color": "#35b779"
        },
        {
            "range": [717, 1049],
            "color": "#6ece58"
        },
        {
            "range": [1049, 2235],
            "color": "#b5de2b"
        },
        {
            "range": [2235, 120000],
            "color": "#fde725"
        }
    ],
    "ofp": [
        {
            "range": [28.197, 700],
            "color": "#440154"
        },
        {
            "range": [4.883, 28.197],
            "color": "#482878"
        },
        {
            "range": [3.237, 4.883],
            "color": "#3e4989"
        },
        {
            "range": [1.128, 3.237],
            "color": "#31688e"
        },
        {
            "range": [0.537, 1.128],
            "color": "#26828e"
        },
        {
            "range": [0.34, 0.537],
            "color": "#1f9e89"
        },
        {
            "range": [0.256, 0.34],
            "color": "#35b779"
        },
        {
            "range": [0.093, 0.256],
            "color": "#6ece58"
        },
        {
            "range": [0.021, 0.093],
            "color": "#b5de2b"
        },
        {
            "range": [0, 0.021],
            "color": "#fde725"
        }
    ],
    "pm10": [
        {
            "range": [0, 23],
            "color": "#440154"
        },
        {
            "range": [23, 100],
            "color": "#482878"
        },
        {
            "range": [100, 180],
            "color": "#3e4989"
        },
        {
            "range": [180, 206],
            "color": "#31688e"
        },
        {
            "range": [206, 299],
            "color": "#26828e"
        },
        {
            "range": [299, 371],
            "color": "#1f9e89"
        },
        {
            "range": [371, 430],
            "color": "#35b779"
        },
        {
            "range": [430, 505],
            "color": "#6ece58"
        },
        {
            "range": [505, 628],
            "color": "#b5de2b"
        },
        {
            "range": [628, 40000],
            "color": "#fde725"
        }
    ]
}
fieldNames = [
    "GENRE_lat", "GENRE_fr", "GENRE_eng", 
    "NOM_COMPLET_lat", "NOM_COMPLET_fr", "NOM_COMPLET_eng", 
    "COMMUNE", "L_area", "leaf", "D_COUR_M",
    "O3_rm_gy", "VOC_g_y", "OFP_kg_y", "PM10_rm_gy",
    "radius", "color_voc", "color_o3", "color_ofp", "color_pm10"
    ]

def getColor(measure, value):
    """
    Get the color from the measure's categorical color scheme.
    """
    #print(f"getColor({measure}, {value})")  
    color = "#000000"
    if value != None:
        scheme = [d for d in colors[measure] if d["range"][0] <= value and value < d["range"][1]]
        color = scheme[0]["color"]
    return color

def transform_specie(filePath):
    fileName = os.path.basename(filePath)
    baseName = fileName.replace(".geojson", "").replace("_voc", "").replace("specie_", "")

    print(f"Transforming {fileName}")

    # get the input layer
    inDataSet = driver.Open(filePath)
    inLayer = inDataSet.GetLayer()

    inSpatialRef = inLayer.GetSpatialRef()

    # loading projection
    sr = osr.SpatialReference(str(inSpatialRef))

    # detecting EPSG/SRID
    res = sr.AutoIdentifyEPSG()

    srid = sr.GetAuthorityCode(None)

    # input SpatialReference
    inSpatialRef.ImportFromEPSG(int(srid))

    # output SpatialReference
    outSpatialRef = osr.SpatialReference()
    outSpatialRef.ImportFromEPSG(4326)
    outSpatialRef.SetAxisMappingStrategy(osr.OAMS_TRADITIONAL_GIS_ORDER)

    # create the CoordinateTransformation
    coordTrans = osr.CoordinateTransformation(inSpatialRef, outSpatialRef)

    # create the output layer
    outputShapefile = f"./output/{baseName}.geojson"

    if os.path.exists(outputShapefile):
        driver.DeleteDataSource(outputShapefile)

    outDataSet = driver.CreateDataSource(outputShapefile)
    outLayer = outDataSet.CreateLayer(baseName, geom_type=ogr.wkbPoint)

    # add fields
    inLayerDefn = inLayer.GetLayerDefn()

    
    for i in range(0, inLayerDefn.GetFieldCount()):
        fieldDefn = inLayerDefn.GetFieldDefn(i)
        fieldName = fieldDefn.GetNameRef()
        if fieldName in fieldNames:
            outLayer.CreateField(fieldDefn)

    # new field
    radiusField = ogr.FieldDefn("radius", ogr.OFTReal)
    outLayer.CreateField(radiusField)
    colorField = ogr.FieldDefn("color_voc", ogr.OFTString)
    outLayer.CreateField(colorField)
    colorField = ogr.FieldDefn("color_o3", ogr.OFTString)
    outLayer.CreateField(colorField)
    colorField = ogr.FieldDefn("color_ofp", ogr.OFTString)
    outLayer.CreateField(colorField)
    colorField = ogr.FieldDefn("color_pm10", ogr.OFTString)
    outLayer.CreateField(colorField)

    # get the output layer's feature definition
    outLayerDefn = outLayer.GetLayerDefn()

    # loop through the input features
    inFeature = inLayer.GetNextFeature()

    while inFeature:
        # get the input geometry
        geom = inFeature.GetGeometryRef()
        # reproject the geometry
        geom.Transform(coordTrans)
        # create a new feature
        outFeature = ogr.Feature(outLayerDefn)
        # set the geometry
        outFeature.SetGeometry(geom)
        
        # calculate radius from the L_area and colors from the measures' color scheme
        radius = None
        color = {
            "voc": "#000000",
            "o3": "#000000",
            "ofp": "#000000",
            "pm10": "#000000"
        }
        for i in range(0, outLayerDefn.GetFieldCount()):
            fieldName = outLayerDefn.GetFieldDefn(i).GetNameRef()
            if fieldName == "L_area":
                fieldValue = inFeature.GetField(inFeature.GetFieldIndex(fieldName))
                radius = math.sqrt(fieldValue/3.14159) if fieldValue != None else 1
            elif fieldName == "VOC_g_y":
                color["voc"] = getColor("voc", inFeature.GetField(inFeature.GetFieldIndex(fieldName)))
            elif fieldName == "O3_rm_gy":
                color["o3"] = getColor("o3", inFeature.GetField(inFeature.GetFieldIndex(fieldName)))
            elif fieldName == "OFP_kg_y":
                color["ofp"] = getColor("ofp", inFeature.GetField(inFeature.GetFieldIndex(fieldName)))
            elif fieldName == "PM10_rm_gy":
                color["pm10"] = getColor("pm10", inFeature.GetField(inFeature.GetFieldIndex(fieldName)))
        
        # set the attributes
        for i in range(0, outLayerDefn.GetFieldCount()):
            fieldName = outLayerDefn.GetFieldDefn(i).GetNameRef()
            fieldValue = None
            if fieldName == "radius":
                fieldValue = radius
            elif fieldName == "color_voc":
                fieldValue = color["voc"]
            elif fieldName == "color_o3":
                fieldValue = color["o3"]
            elif fieldName == "color_ofp":
                fieldValue = color["ofp"]
            elif fieldName == "color_pm10":
                fieldValue = color["pm10"]
            else:
                fieldValue = inFeature.GetField(inFeature.GetFieldIndex(fieldName))
            outFeature.SetField(fieldName, fieldValue)
        
        # add the feature to the shapefile
        outLayer.CreateFeature(outFeature)
        # destroy the features and get the next input feature
        outFeature.Destroy()
        inFeature.Destroy()
        inFeature = inLayer.GetNextFeature()

    # close the shapefiles
    inDataSet.Destroy()
    outDataSet.Destroy()

# main
for file in glob.glob("./input/*/specie_*.geojson"):
    transform_specie(file)

for file in glob.glob("./input/*/genus_*.geojson"):
    transform_specie(file)