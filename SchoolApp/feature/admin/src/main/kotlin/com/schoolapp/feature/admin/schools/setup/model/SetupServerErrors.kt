package com.schoolapp.feature.admin.schools.setup.model

import com.schoolapp.core.common.result.AppError
import com.schoolapp.feature.admin.R

/** Where a failed create should take the admin: field errors, the step to show, or a banner. */
data class SetupFailure(
    val fields: Map<String, SetupError> = emptyMap(),
    val step: SetupStep? = null,
    /** Banner text from the server, or null to use [bannerRes] / the generic error text. */
    val banner: String? = null,
    val bannerRes: Int? = null,
)

/** Port of the web setup-errors.ts: conflicts and validation lines go on their fields. */
internal object SetupServerErrors {
    private val CONFLICTS: Map<String, Pair<String, Int>> = mapOf(
        "SCHOOL_CODE_TAKEN" to (SetupKeys.SCHOOL_CODE to R.string.setup_error_code_taken),
        "USER_EMAIL_TAKEN" to (SetupKeys.PRINCIPAL_EMAIL to R.string.setup_error_email_taken),
        "USER_PHONE_TAKEN" to (SetupKeys.PRINCIPAL_PHONE to R.string.setup_error_phone_taken),
    )
    private const val NOT_FOUND = 404

    fun map(error: AppError): SetupFailure {
        if (error == AppError.Network || (error is AppError.Server && error.httpCode == NOT_FOUND)) {
            return SetupFailure(bannerRes = R.string.setup_error_unreachable)
        }
        CONFLICTS[(error as? AppError.Server)?.code]?.let { (key, res) ->
            return SetupFailure(fields = mapOf(key to SetupError.Local(res)), step = SetupStep.forKey(key))
        }
        val validation = error as? AppError.Validation ?: return SetupFailure()
        if (validation.fields.values.any { it.contains("should not exist", ignoreCase = true) }) {
            return SetupFailure(bannerRes = R.string.setup_error_outdated)
        }
        val placed = mutableMapOf<String, SetupError>()
        val unplaced = mutableListOf<String>()
        validation.fields.forEach { (path, line) ->
            val key = formKey(path)
            if (key.contains('.') && SetupStep.forKey(key) != null) placed[key] = SetupError.Server(withoutPath(line, path)) else unplaced += line
        }
        if (placed.isEmpty()) return SetupFailure(banner = unplaced.joinToString(" ").ifBlank { validation.message })
        val step = placed.keys.mapNotNull(SetupStep::forKey).minByOrNull { it.ordinal }
        return SetupFailure(fields = placed, step = step, banner = unplaced.joinToString(" ").ifBlank { null })
    }

    /** The API names timings under branch.timings.* and the bell under academics.bellSchedule.*. */
    private fun formKey(path: String): String {
        val flat = path.replace(Regex("^branch\\.timings\\."), "branch.").replace(Regex("^academics\\.bellSchedule\\.?"), "bell.")
        return when (flat) {
            "academics.classNames" -> SetupKeys.CLASSES
            "bell." -> "bell"
            else -> flat
        }
    }

    /** "school.code must be …" reads oddly under the Code field: drop the path. */
    private fun withoutPath(message: String, path: String): String {
        if (!message.startsWith("$path ", ignoreCase = true)) return message
        val rest = message.substring(path.length + 1).replace(Regex("(school|branch|principal|academics)\\.(\\w+)"), "$2")
        return rest.replaceFirstChar(Char::uppercase)
    }
}
