<?php

namespace App\Events;

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public $message;

    /**
     * Create a new event instance.
     */
    public function __construct($message)
    {
        // bawa data message + relasi sender
        $this->message = $message->load('sender:id,name');
    }

    /**
     * Channel broadcast
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('consulting.' . $this->message->consulting_id),
        ];
    }

    /**
     * Nama event di frontend
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}