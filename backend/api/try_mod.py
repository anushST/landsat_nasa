import requests
from requests_aws4auth import AWS4Auth
import json
import os
# Ваши AWS ключи
aws_access_key = os.getenv('AWS_KEY_ID')
aws_secret_key = os.getenv('AWS_SECRET_KEY')
region = 'us-west-2'  # Замените на нужный вам регион
service = 's3'

awsauth = AWS4Auth(aws_access_key, aws_secret_key, region, service)

def load_mlt_json_from_usgs(object_key):
    url = f'https://usgs-landsat.s3.amazonaws.com/{object_key}'
    
    # Добавляем заголовок Request-Payer для доступа к Requester Pays ведрам
    headers = {
        'x-amz-request-payer': 'requester'
    }

    try:
        # Отправляем GET-запрос на получение файла
        response = requests.get(url, auth=awsauth, headers=headers)

        # Проверяем статус ответа
        response.raise_for_status()  # Вызывает исключение для кодов ошибок

        # Преобразуем содержимое в JSON
        json_content = response.json()
        
        return json_content
    except requests.exceptions.HTTPError as err:
        return {"error": str(err)}
