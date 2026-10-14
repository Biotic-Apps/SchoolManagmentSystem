package com.schoolapp.feature.organisation.sessions.edit

import androidx.annotation.StringRes
import androidx.compose.runtime.Immutable
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.feature.organisation.R

enum class RangeField { NAME, START, END }

/** Name + date range form shared by sessions and terms; dates are `YYYY-MM-DD`. */
@Immutable
data class RangeForm(
    val id: String? = null,
    val name: String = "",
    val startDate: String = "",
    val endDate: String = "",
    val errors: Map<RangeField, Int> = emptyMap(),
    val saving: Boolean = false,
    val error: ActionError? = null,
) {
    val isNew: Boolean get() = id == null
}

/** Activate a draft session or close the active one (closing is final). */
@Immutable
data class SessionTransition(
    val session: AcademicSession,
    val activate: Boolean,
    val saving: Boolean = false,
    val error: ActionError? = null,
)

@Immutable
data class SessionEditorState(
    val form: RangeForm? = null,
    val transition: SessionTransition? = null,
    @StringRes val notice: Int? = null,
)

/** Checks shared by session and term forms (API: session name 2–30, term name 1–40, end on or after start). */
internal object RangeRules {
    fun validate(form: RangeForm, minName: Int, maxName: Int): Map<RangeField, Int> = buildMap {
        if (form.name.trim().length !in minName..maxName) put(RangeField.NAME, R.string.org_range_name_invalid)
        if (form.startDate.isEmpty()) put(RangeField.START, R.string.org_pick_start_date)
        if (form.endDate.isEmpty()) put(RangeField.END, R.string.org_pick_end_date)
        if (form.startDate.isNotEmpty() && form.endDate.isNotEmpty() && form.endDate < form.startDate) {
            put(RangeField.END, R.string.org_end_before_start)
        }
    }
}
