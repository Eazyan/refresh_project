import redis
import json
from uuid import UUID

class UUIDEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, UUID):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def set_cache(key: str, value: any, ttl: int = 300):
    """
    Устанавливает значение в кэш.
    - key: Ключ, по которому будут сохранены данные.
    - value: Значение. Мы преобразуем его в JSON-строку.
    - ttl: Time-to-live (время жизни) в секундах. По умолчанию 5 минут.
    """
    redis_client.setex(key, ttl, json.dumps(value, cls=UUIDEncoder))

def get_cache(key: str) -> any:
    """
    Получает значение из кэша.
    - key: Ключ для поиска.
    """
    value = redis_client.get(key)
    if value:
        return json.loads(value)
    return None

def invalidate_cache(key: str):
    """
    Удаляет (делает невалидным) значение из кэша.
    - key: Ключ для удаления.
    """
    redis_client.delete(key)