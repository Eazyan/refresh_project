# Урок 7.1: API Gateway и полная оркестрация — Итоги

## Что мы изучили и реализовали:

1.  **Паттерн API Gateway**: Мы создали единую точку входа для всех наших бэкенд-сервисов с помощью **Nginx**. Теперь фронтенд общается только с одним адресом (`http://localhost`), а Nginx уже сам "разруливает" запросы к нужным микросервисам (`backend-api` или `analytics-service`).
2.  **Конфигурация Nginx**: Мы написали базовый, но очень мощный `nginx.conf`, используя директивы `location` и `proxy_pass` для маршрутизации запросов на основе URL.
3.  **Полная оркестрация с Docker Compose**: Мы обновили наш `docker-compose.yml`, добавив в него Nginx. Теперь **вся наша бэкенд-инфраструктура** (2 приложения, 4 базы данных/брокера) полностью управляется Docker. Мы также научились скрывать порты внутренних сервисов, делая Gateway единственной точкой доступа.
4.  **Централизованный API-клиент**: Мы отрефакторили весь наш фронтенд-код (`TasksContext`, `TaskForm`, `TaskItem`, `LoginPage`, `RegisterPage`), чтобы он использовал единый, централизованный `apiClient` (`axios`), настроенный на работу с API Gateway.
5.  **Отладка в распределенной среде**: Мы столкнулись с целым комплексом реальных проблем и научились их решать:
    *   **Nginx `proxy_pass`**: Разобрались с тонкостями того, как Nginx передает URL внутренним сервисам.
    *   **CORS за прокси**: Поняли, почему возникает ошибка CORS, когда запросы проходят через Gateway, и научились решать ее.
    *   **`ERR_CONNECTION_REFUSED`**: Убедились, что сокрытие портов работает, и исправили фронтенд, чтобы он не пытался обращаться к сервисам напрямую.
    *   **`axios` vs `fetch`**: Закрепили разницу в обработке ошибок между двумя популярными HTTP-клиентами.

## Ключевые выводы и важные замечания:

### 1. Единая точка входа — это стандарт

Использование API Gateway — это не просто "хорошая практика", это стандарт де-факто для любой микросервисной архитектуры. Это упрощает разработку фронтенда, повышает безопасность и дает гибкость в управлении бэкендом.

### 2. Отладка — это самое ценное

Самым важным на этом уроке был не код, который мы написали, а ошибки, которые мы исправили. Проблемы с сетью, CORS, конфигурацией прокси — это 90% работы DevOps и бэкенд-инженера. Пройдя через это, вы получили бесценный практический опыт.

### 3. Чистота Frontend-кода

Рефакторинг всего кода для использования одного `apiClient` — это пример того, как правильная архитектура бэкенда (API Gateway) напрямую влияет на чистоту и простоту кода на фронтенде. Нам больше не нужно думать, на какой порт отправлять тот или иной запрос.

---

## Финальный код урока:

### `docker-compose.yml` (фрагменты)
```yaml
services:
  # ... db, redis, zookeeper, kafka ...

  api-gateway:
    image: nginx:1.25
    container_name: api-gateway
    ports:
      - "80:80"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      backend-api:
        condition: service_started
      analytics-service:
        condition: service_started

  backend-api:
    build: ./task-manager-backend
    container_name: backend-api
    # ports: # <-- УБРАЛИ ПОРТЫ
    # ...

  analytics-service:
    build: ./analytics-service
    container_name: analytics-service
    # ports: # <-- УБРАЛИ ПОРТЫ
    # ...
```

### `nginx/nginx.conf`
```nginx
events {}

http {
    server {
        listen 80;
        
        location /api/reports/ {
            proxy_pass http://analytics-service:8001/api/reports/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-for $proxy_add_x_forwarded_for;
        }

        location /api/ {
            proxy_pass http://backend-api:8000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-for $proxy_add_x_forwarded_for;
        }
    }
}
```

### `task-manager/src/api/apiClient.ts`
```ts
import axios from 'axios';

const apiClient = axios.create({
  // Теперь все запросы идут на порт 80 (по умолчанию)
  baseURL: 'http://localhost/api', 
});

// ... interceptor ...
```