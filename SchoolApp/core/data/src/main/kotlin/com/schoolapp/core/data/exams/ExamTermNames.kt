package com.schoolapp.core.data.exams

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.ExamsApi
import com.schoolapp.core.network.dto.exams.ExamDto
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Exams carry only `termId`; this resolves term names from `sessions/:id/terms`, once per session per
 * app run. A failed lookup (offline, or a role without `sessions.view`) just leaves the term unnamed and
 * is retried on the next exam load.
 */
@Singleton
class ExamTermNames @Inject constructor(
    private val api: ExamsApi,
    private val apiCaller: ApiCaller,
) {
    private val bySession = ConcurrentHashMap<String, Map<String, String>>()

    /** Term id to name for every session of [exams] that has an exam without an embedded term name. */
    suspend fun forExams(exams: List<ExamDto>): Map<String, String> {
        val sessionIds = exams
            .filter { it.termId != null && it.termName.isNullOrBlank() && it.term?.name.isNullOrBlank() }
            .mapNotNull { it.sessionId }
            .distinct()
        return sessionIds.fold(emptyMap<String, String>()) { names, sessionId -> names + termsOf(sessionId) }
    }

    private suspend fun termsOf(sessionId: String): Map<String, String> {
        bySession[sessionId]?.let { return it }
        return when (val result = apiCaller.call { api.sessionTerms(sessionId).data.toTermNames() }) {
            is AppResult.Success -> result.data.also { bySession[sessionId] = it }
            is AppResult.Failure -> emptyMap()
        }
    }
}
