# ToDo-List
The tool is simple and straightforward, probably a bit over-engineered considering the TechStack chosen. It was created to learn how to properly use LiveWire and ClickHouse.

![](/docs/Desktop%2026-10-2026%2010-32-26.gif)

### Stack
- **BACKEND**:  Laravel
- **FRONTEND**: LiveWire + Tailwind
- **DATABASE**: ClickHouse

### Main Files
- migrations\2026_10_25_135645_create_todo_tasks.php
- app\Livewire\TaskColumn.php
- Models\ClickhouseTask.php
- views\livewire\task-column.blade.php
- views\index.blade.php
- css\app.css
- js\task.ts
- js\app.js
- start.sh

### How to run
- You will have to install the required Laravel packages, which can be found on the [Installing PHP and the Laravel Installer](https://laravel.com/framework/docs#installing-php) page. Node/ NPM was used for this project.
- Install Docker as well if you plan on using the `./start.sh` which uses a docker-compose to start ClickHouse.
- Add the [ClickHouse ENV](https://github.com/laravel-clickhouse/laravel-clickhouse/blob/master/docs/docs/installation.md#configuration) lines to .env in ./todo-lijst/.env.
- run `./start.sh` from this folder.
