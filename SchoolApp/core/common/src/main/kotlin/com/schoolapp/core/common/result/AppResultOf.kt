package com.schoolapp.core.common.result

import kotlin.coroutines.cancellation.CancellationException

/** Runs [block], turning thrown exceptions (except cancellation) into [AppError.Unknown]. */
inline fun <T> appResultOf(block: () -> T): AppResult<T> = try {
    AppResult.Success(block())
} catch (e: CancellationException) {
    throw e
} catch (e: Exception) {
    AppResult.Failure(AppError.Unknown(e))
}
