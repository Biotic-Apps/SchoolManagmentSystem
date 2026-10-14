package com.schoolapp.feature.questionbank

import androidx.lifecycle.ViewModel
import com.schoolapp.feature.questionbank.common.QuestionBankChange
import com.schoolapp.feature.questionbank.common.QuestionBankEvents
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject

/** Menu host: the success message of the last save made on a detail screen. */
@HiltViewModel
class QuestionBankHostViewModel @Inject constructor(
    private val events: QuestionBankEvents,
) : ViewModel() {
    val pending: StateFlow<QuestionBankChange?> = events.pending

    fun onShown() = events.consume()
}
