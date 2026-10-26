<?php

namespace App\Models;

use ClickHouse\Laravel\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

/**
 * @property uuid $id
 * @property string $description
 * @property string $state
 */
#[Fillable(['description', 'state'])]
class ClickhouseTask extends Model
{
    use HasUuids;

    protected $connection = 'clickhouse';
    protected $table = 'tasks';
    protected $fillable = ['description', 'state'];

    public function newEloquentBuilder($query)
    {
        return new \App\Models\Builders\ClickhouseBuilder($query);
    }
}