from datetime import datetime
from pytz import timezone
import base64
import json
import requests
import os

TOKEN = os.environ.get('CW_TOKEN')
ROOMID = os.environ.get('CW_ROOMID')
URL = 'https://api.chatwork.com/v2/rooms'
POST = '{0}/{1}/messages'.format(URL, ROOMID)

def hello_pubsub(event, context):
    """Triggered from a message on a Cloud Pub/Sub topic.
    Args:
        event (dict): Event payload.
        context (google.cloud.functions.Context): Metadata for the event.
    """
    pubsub_message = json.loads(base64.b64decode(event['data']).decode('utf-8'))
    print(pubsub_message)

    message = pubsub_message['incident']
    incident_flag = message['state']
    summary = message['summary']

    # とりあえずmessage等をそのまま使う

    if incident_flag == 'open':
        start_date = datetime.fromtimestamp(message['started_at']) # UNIX時間→yyyy-MM-dd HH:mm:ss
        jst = start_date.astimezone(timezone('Asia/Tokyo')) # UTC -> JST
    elif incident_flag == 'closed':
        end_date = datetime.fromtimestamp(message['ended_at']) # UNIX時間→yyyy-MM-dd HH:mm:ss
        jst = end_date.astimezone(timezone('Asia/Tokyo')) # UTC -> JST

    mes = """
        [info][title]検知: % s[/title]
        時刻: % s
        対象リソース名: % s
        エラー詳細: % s[/info]
        """ % (
            incident_flag,
            jst,
            message['resource_name'],
            message['documentation']['content']
        )
    # [info][title]はチャットワークへの通知で使うための記載
    print(mes)

    headers = { 'X-ChatWorkToken': TOKEN }
    params = { 'body': mes }
    requests.post(POST, headers=headers, params=params)
