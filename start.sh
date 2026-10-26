#!/bin/bash
cleanup() {
    echo 'Stopping'
    docker compose stop
}
trap cleanup EXIT INT TERM
docker compose up -d --build --wait clickhouse

cd todo-lijst
npm i && npm run build

# might as well since this is only a small app
php artisan migrate
composer run dev