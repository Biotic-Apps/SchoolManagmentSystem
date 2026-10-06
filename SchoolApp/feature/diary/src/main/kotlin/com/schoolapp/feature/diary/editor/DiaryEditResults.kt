package com.schoolapp.feature.diary.editor

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

enum class DiaryEditResult { DRAFT_SAVED, PUBLISHED, PENDING_REVIEW, QUEUED }

/** Hands the editor's outcome back to the diary list that opened it (shown once, then consumed). */
@Singleton
class DiaryEditResults @Inject constructor() {
    private val _latest = MutableStateFlow<DiaryEditResult?>(null)
    val latest: StateFlow<DiaryEditResult?> = _latest.asStateFlow()

    fun post(result: DiaryEditResult) {
        _latest.value = result
    }

    fun consume() {
        _latest.value = null
    }
}
