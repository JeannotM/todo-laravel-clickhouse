<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ClickhouseTask;
use Illuminate\Validation\Rule;

class TaskController extends Controller
{
    public function updateDescription(Request $request) 
    {
        $data = $request->validate([
            'id' => ['required', 'uuid'],
            'description' => ['required', 'string', 'max:500'],
        ]);

        ClickhouseTask::findOrFail($data['id'])->update(['description' => $data['description']]);
        return response()->noContent();
    }

    public function updateState(Request $request)
    {
        $data = $request->validate([
            'id' => ['required', 'uuid'],
            'fromCol' => ['required', Rule::in(['todo', 'active', 'test', 'done'])],
            'toCol' => ['required', Rule::in(['todo', 'active', 'test', 'done'])],
        ]);

        ClickhouseTask::where(['id' => $data['id'], 'state' => $data['fromCol']])->update(['state' => $data['toCol']]);
        return response()->noContent();
    }
}
