package com.schoolapp.feature.accounts.categories

import com.schoolapp.core.common.result.AppError

enum class CategoryError { NAME_REQUIRED, NAME_SHORT, NAME_LONG, CODE_INVALID }

data class CategoryFormState(
    val name: String = "",
    val code: String = "",
    val nameError: CategoryError? = null,
    val codeError: CategoryError? = null,
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    val hasErrors: Boolean get() = nameError != null || codeError != null

    /** Name 2-80 chars; optional code in server form (upper snake case, starts with a letter, 2-30 chars). */
    fun validated(): CategoryFormState {
        val name = name.trim()
        val code = code.trim()
        val nameError = when {
            name.isEmpty() -> CategoryError.NAME_REQUIRED
            name.length < MIN_NAME -> CategoryError.NAME_SHORT
            name.length > MAX_NAME -> CategoryError.NAME_LONG
            else -> null
        }
        val codeError = if (code.isNotEmpty() && !CodePattern.matches(code)) CategoryError.CODE_INVALID else null
        return copy(nameError = nameError, codeError = codeError)
    }

    companion object {
        const val MIN_NAME = 2
        const val MAX_NAME = 80
        const val MAX_CODE = 30
        private val CodePattern = Regex("^[A-Z][A-Z0-9_]{1,29}$")
    }
}
