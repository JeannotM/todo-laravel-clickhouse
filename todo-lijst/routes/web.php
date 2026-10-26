<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TaskController;

Route::view('/', 'index')->name('home');

Route::prefix("api/tasks")->group(function() {
    Route::post('/updateDescription', [TaskController::class, 'updateDescription']);
    Route::post('/updateState', [TaskController::class, 'updateState']);
});