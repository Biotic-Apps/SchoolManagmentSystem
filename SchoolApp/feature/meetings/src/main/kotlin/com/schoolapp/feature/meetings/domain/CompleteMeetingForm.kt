package com.schoolapp.feature.meetings.domain

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.meeting.CompleteMeetingInput
import com.schoolapp.core.model.meeting.FollowUpInput

/** One follow-up row in the complete sheet; [key] keeps rows stable while editing. */
@Immutable
data class FollowUpDraft(val key: Int, val title: String = "", val dueDate: String? = null)

@Immutable
data class CompleteErrors(
    val notes: Boolean = false,
    val summary: Boolean = false,
    val followUpTitles: Set<Int> = emptySet(),
    val followUpDates: Set<Int> = emptySet(),
) {
    val isEmpty: Boolean get() = !notes && !summary && followUpTitles.isEmpty() && followUpDates.isEmpty()
}

@Immutable
data class CompleteMeetingForm(
    val notes: String = "",
    val shareSummary: Boolean = false,
    val summary: String = "",
    val followUps: List<FollowUpDraft> = emptyList(),
) {
    /** Follow-ups are owned by the caller (`ownerUserId` null -> server uses the signed-in user). */
    fun toInput() = CompleteMeetingInput(
        notes = notes.trim(),
        shareSummaryWithParent = shareSummary,
        summary = summary.trim().takeIf { shareSummary && it.isNotEmpty() },
        followUps = followUps.map { FollowUpInput(title = it.title.trim(), ownerUserId = null, dueDate = checkNotNull(it.dueDate)) },
    )
}

/** Notes are required; a shared summary needs text; each follow-up needs a title and a due date. */
object CompleteValidation {
    fun validate(form: CompleteMeetingForm) = CompleteErrors(
        notes = form.notes.isBlank(),
        summary = form.shareSummary && form.summary.isBlank(),
        followUpTitles = form.followUps.filter { it.title.isBlank() }.map { it.key }.toSet(),
        followUpDates = form.followUps.filter { it.dueDate.isNullOrBlank() }.map { it.key }.toSet(),
    )
}
