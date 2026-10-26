<?php

namespace App\Models\Builders;

use Illuminate\Database\Eloquent\Builder;

class ClickhouseBuilder extends Builder
{
    protected function addUpdatedAtColumn(array $values)
    {
        $column = $this->model->getUpdatedAtColumn();

        if (! $this->model->usesTimestamps() || $column === null || array_key_exists($column, $values)) {
            return $values;
        }

        return [$column => $this->model->freshTimestampString()] + $values;
    }
}