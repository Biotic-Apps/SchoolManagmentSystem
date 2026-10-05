package com.schoolapp.core.sync

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject
import timber.log.Timber

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val processor: OutboxProcessor,
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result = when (processor.process()) {
        OutboxProcessor.Outcome.COMPLETED -> Result.success()
        OutboxProcessor.Outcome.RETRY_LATER -> {
            Timber.d("Outbox sync will retry (attempt %d)", runAttemptCount)
            Result.retry()
        }
    }
}
