import asyncio
import aioredis
import aiohttp
import json
from pprint import pprint
from datetime import datetime, timedelta
import sqlite3
import psycopg2

import os

API_URL = "https://api.spectator.earth/acquisition-plan/"
API_KEY = os.getenv('SPECTATOR_API_KEY')
SATELLITES = ['Landsat-8', 'Landsat-9']


def get_the_last_date(satellite):
    conn = sqlite3.connect("db.sqlite3")
    cursor = conn.cursor()

    with psycopg2.connect(
        user="postgres",
        password="postgres",
        host="db",
        port="5432",
        database="postgres"
    ) as connection:
        with connection.cursor() as cursor:
            cursor.execute('''
            SELECT has_info_date
            FROM api_acqusitiondatesinfo
            WHERE satellite = %s
            ORDER BY has_info_date DESC
            LIMIT 1;
            ''', (satellite,))

            last_date = cursor.fetchone()

            return last_date[0] if last_date else None


async def fetch_and_save_data(redis: aioredis.Redis):
    while True:
        async with aiohttp.ClientSession() as session:
            for satellite in SATELLITES:
                date = get_the_last_date(satellite)
                if not date:
                    date = datetime.utcnow()
                else:
                    date = datetime.strptime(date, "%Y-%m-%d %H:%M:%S")
                times = 0
                while times < 100:
                    times += 1
                    date = date + timedelta(days=1)
                    date_str = date.strftime("%Y-%m-%d")
                    needed_date = date_str
                    date_str = date_str + 'T00:00:00Z'
                    params = {
                        "api_key": API_KEY,
                        "satellites": satellite,
                        "datetime": date_str
                    }
                    async with session.get(API_URL, params=params) as response:
                        if response.status == 200:
                            data = await response.json()
                            if data.get("features"):
                                await save_to_db(data["features"], date, satellite)
                                print(type(json.dumps(data['features'])))
                                await redis.set(needed_date, json.dumps(data['features']), 604800*3)
                                print('set')
                            else:
                                continue
                        else:
                            print(f"Ошибка {response.status} для спутника {satellite} и даты {date_str}")
        await asyncio.sleep(3600*3)


async def save_to_db(features, datetime: datetime, satellite):
    conn = psycopg2.connect(
        user='postgres',
        password='postgres',
        database='postgres',
        host='db',
        port='5432'
    )

    try:
        with conn:
            with conn.cursor() as cursor:
                # for feature in features:
                #     properties = feature["properties"]
                #     date = properties['begin_time'].split('T')
                #     date = f'{date[0]} {date[1][:-1]}'
                    
                #     cursor.execute('''
                #         INSERT INTO api_satelliteacqusition (path, row, satellite, datetime)
                #         VALUES (%s, %s, %s, %s)
                #     ''', (properties["path"], properties["row"], properties["satellite"], date))

                date_ = datetime.strftime("%Y-%m-%d %H:%M:%S")
                
                cursor.execute('''
                    INSERT INTO api_acqusitiondatesinfo (satellite, has_info_date)
                    VALUES (%s, %s)
                ''', (satellite, date_))

    except Exception as e:
        print("Ошибка при сохранении в БД:", e)
    finally:
        conn.close()


def BuildSquare(lon, lat, delta):
    c1 = [lon + delta, lat + delta]
    c2 = [lon + delta, lat - delta]
    c3 = [lon - delta, lat - delta]
    c4 = [lon - delta, lat + delta]
    geometry = {"type": "Polygon", "coordinates": [[c1, c2, c3, c4, c1]]}
    return geometry

def convert_to_rfc3339(date_str):
    dates = date_str.split('/')
    extra_part = 'T00:00:00Z'
    return f'{dates[0]}{extra_part}/{dates[1]}{extra_part}'


async def get_landsat_items(lon, lat, time_range, min_cloud=0, max_cloud=100):
    url = "https://landsatlook.usgs.gov/stac-server/search"
    geometry = BuildSquare(lon, lat, 0.004)
    payload = {
        "intersects": geometry,
        "datetime": convert_to_rfc3339(time_range),
        "query": {
            "eo:cloud_cover": {
                "gte": min_cloud,
                "lte": max_cloud,
            }
        },
        "collections": ["landsat-c2l2-sr"]
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload) as response:
            if response.status == 200:
                data = await response.json()
                return data["features"] if data['features'] else {'message': 'not found'}
            else:
                print(f"Ошибка: {response.status}")
                return None

async def worker(redis: aioredis.Redis):
    while True:
        request_data = await redis.lpop('request_queue')
        if request_data:
            request = json.loads(request_data)
            print(request)
            request_id = request['request_id']
            lon = request['lon']
            lat = request['lat']
            min_cloud = int(request['min_cloud'])
            max_cloud = int(request['max_cloud'])
            time_range = request['time_range']

            items = await get_landsat_items(lon, lat, time_range, min_cloud, max_cloud)

            await redis.set(f"result:{request_id}", json.dumps(items), ex=120)

            print('done')

        await asyncio.sleep(1)

async def main():
    redis = await aioredis.from_url("redis://redis:6379/0")
    task1 = asyncio.create_task(worker(redis))
    task2 = asyncio.create_task(fetch_and_save_data(redis))
    await task1
    await task2

if __name__ == "__main__":
    asyncio.run(main())
