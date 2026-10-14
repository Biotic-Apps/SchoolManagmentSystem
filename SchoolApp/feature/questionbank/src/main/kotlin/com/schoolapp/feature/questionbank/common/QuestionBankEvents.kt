package com.schoolapp.feature.questionbank.common

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

enum class QuestionBankChange { QUESTION_ADDED, QUESTION_UPDATED, QUESTION_ARCHIVED, PAPER_GENERATED, PAPER_UPDATED }

/** Feature-wide hand-off: lists reload when [version] moves; the menu screen shows [pending] once as a snackbar. */
@Singleton
class QuestionBankEvents @Inject constructor() {
    private val _version = MutableStateFlow(0)
    val version: StateFlow<Int> = _version.asStateFlow()

    private val _pending = MutableStateFlow<QuestionBankChange?>(null)
    val pending: StateFlow<QuestionBankChange?> = _pending.asStateFlow()

    /** [announce] false when the screen that made the change shows its own message. */
    fun post(change: QuestionBankChange, announce: Boolean = true) {
        _version.update { it + 1 }
        if (announce) _pending.value = change
    }

    fun consume() {
        _pending.value = null
    }
}
