package com.schoolapp.core.sync

interface SyncScheduler {
    /** Enqueues an outbox sync that runs once the device is online. */
    fun requestSync()
}
