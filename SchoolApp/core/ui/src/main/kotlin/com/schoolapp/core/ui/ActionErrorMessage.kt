package com.schoolapp.core.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.ReadOnlyComposable
import com.schoolapp.core.common.result.AppError

/**
 * Text for a failed edit (save, remove, publish). Unlike [appErrorMessage], rule errors the server explains
 * itself — 400 SUBJECT_NOT_IN_CLASS, 403 OWN_ASSIGNMENT, 409 SECTION_IN_USE … — are shown as sent, and the
 * server's [details] lines ("30 students enrolled") follow on new lines.
 */
@Composable
@ReadOnlyComposable
fun actionErrorMessage(error: AppError, details: List<String> = emptyList()): String {
    val server = when (error) {
        is AppError.Server -> error.message?.takeIf { error.httpCode in CLIENT_ERRORS && it.isNotBlank() }
        is AppError.Forbidden -> error.message?.takeIf { it.isNotBlank() }
        else -> null
    }
    val head = server ?: appErrorMessage(error)
    return if (details.isEmpty()) head else (listOf(head) + details.map { "• $it" }).joinToString("\n")
}

private val CLIENT_ERRORS = 400..499
