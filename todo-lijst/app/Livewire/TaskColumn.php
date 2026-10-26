<?php

namespace App\Livewire;

use App\Models\ClickhouseTask;
use Illuminate\Support\Str;
use Livewire\Attributes\Computed;
use Livewire\Component;

class TaskColumn extends Component
{
    public string $state = 'todo';
    public string $title = 'Todo';

    #[Computed]
    public function tasks()
    {
        return ClickhouseTask::where('state', $this->state)->get();
    }

    public function addTask(): void
    {
        ClickhouseTask::create([
            'id' => (string) Str::uuid(),
            'description' => 'New task',
            'state' => $this->state,
        ]);

        unset($this->tasks);
    }

    public function render()
    {
        return view('livewire.task-column');
    }
}