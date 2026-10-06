package com.schoolapp.feature.dashboard.finance

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.fees.FeesRepository
import com.schoolapp.core.model.SessionContext
import com.schoolapp.core.model.fees.FinanceOverview
import javax.inject.Inject

/** "Finance this month" card: [overview] or an inline [error]; [month] is `YYYY-MM`. */
@Immutable
data class FinanceCardState(
    val month: String,
    val overview: FinanceOverview? = null,
    val error: AppError? = null,
)

/** Loads the month's finance overview for roles with `fees.view`; null for everyone else. */
class FinanceLoader @Inject constructor(private val feesRepository: FeesRepository) {

    fun shows(session: SessionContext): Boolean = session.has(FEES_VIEW)

    /** [date] is today's ISO date; the card covers its month. */
    suspend fun load(session: SessionContext, date: String): FinanceCardState? {
        if (!shows(session)) return null
        val month = date.take(MONTH_LENGTH)
        return when (val result = feesRepository.financeOverview(session.activeBranchId, month)) {
            is AppResult.Success -> FinanceCardState(month, overview = result.data)
            is AppResult.Failure -> FinanceCardState(month, error = result.error)
        }
    }

    private companion object {
        const val FEES_VIEW = "fees.view"
        const val MONTH_LENGTH = 7
    }
}
