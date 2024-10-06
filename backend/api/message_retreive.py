import os

import rasterio
from rasterio.session import AWSSession
import boto3
from pyproj import Transformer
import concurrent.futures
import json
from api.try_mod import load_mlt_json_from_usgs

credentials = {
    'aws_access_key_id': os.getenv('AWS_KEY_ID'),
    'aws_secret_access_key': os.getenv('AWS_SECRET_KEY'),
    'region_name': 'us-west-2'
}

# Создаем сессию AWS
session = boto3.Session(**credentials)

# Открываем сессию для работы с S3
aws_session = AWSSession(session, requester_pays=True)

def get_product_info(product_id: str):
    parts = product_id.split('_')
    path = parts[2][:-3]
    row = parts[2][3:]
    year = parts[3][:-4]

    return {'path': path, 'row': row, 'year': year}


def get_scene_data(product_id, lat, lon):
    product_info = get_product_info(product_id)
    cog_url = ('s3://usgs-landsat/collection02/level-2/standard/oli-tirs/'
               f'{product_info["year"]}/{product_info["path"]}/{product_info["row"]}/'
               f'{product_id}/')
    file_endings = [
        # '_ANG.txt',
        # '_MTL.json',
        # '_MTL.txt',
        # '_MTL.xml',
        '_QA_PIXEL.TIF',
        '_QA_RADSAT.TIF',
        '_SR_B1.TIF',
        '_SR_B2.TIF',
        '_SR_B3.TIF',
        '_SR_B4.TIF',
        '_SR_B5.TIF',
        '_SR_B6.TIF',
        '_SR_B7.TIF',
        '_SR_QA_AEROSOL.TIF',
        # # '_SR_stac.json',
        '_ST_ATRAN.TIF',
        '_ST_B10.TIF',
        '_ST_CDIST.TIF',
        '_ST_DRAD.TIF',
        '_ST_EMIS.TIF',
        '_ST_EMSD.TIF',
        '_ST_QA.TIF',
        '_ST_TRAD.TIF',
        '_ST_URAD.TIF',
        # '_ST_stac.json',
    ]
    key = f'collection02/level-2/standard/oli-tirs/{product_info["year"]}/{product_info["path"]}/{product_info["row"]}/{product_id}/{product_id}_MTL.json'
    data = load_mlt_json_from_usgs(key)
    output = {'MTL': data}
    with rasterio.Env(aws_session):
        for file in file_endings:
            url = cog_url + product_id + file
            with rasterio.open(url) as dataset:
                img_crs = dataset.crs
                transformer = Transformer.from_crs("EPSG:4326", img_crs, always_xy=True)
                x, y = transformer.transform(lon, lat)
                row, col = dataset.index(x, y)
                pixel_value = dataset.read(1, window=rasterio.windows.Window(col-1, row-1, 3, 3))
                key = file[1:-4]
                output[key] = {
                    'row': row, 'col': col, 'pixel_value': pixel_value,
                }
    return output
