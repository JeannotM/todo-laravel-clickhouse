<div class="task-type" id="{{ $state }}">
    <h3>{{ $title }}</h3>
    <div class="task-container">
        @foreach ($this->tasks as $task)
            <custom-task wire:key="{{ $task->id }}">{{ $task->description }}</custom-task>
        @endforeach

        @if ($state == 'todo')
            <button type="button" class="task task-add" wire:click="addTask" wire:loading.attr="enabled">
                add
            </button>
        @endif
    </div>
</div>