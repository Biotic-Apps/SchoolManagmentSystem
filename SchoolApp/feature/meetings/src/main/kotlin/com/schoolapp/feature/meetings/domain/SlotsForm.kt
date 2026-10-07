package com.schoolapp.feature.meetings.domain

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.meeting.MeetingMode
import com.schoolapp.core.model.meeting.SlotInput

/** One row of the "Add slots" sheet; [key] is stable across removals. Date `YYYY-MM-DD`, times `HH:mm`. */
@Immutable
data class SlotDraft(
    val key: Int,
    val date: String,
    val startTime: String = SlotTimes.DEFAULT_START,
    val endTime: String = SlotTimes.DEFAULT_END,
    val mode: MeetingMode = MeetingMode.IN_PERSON,
    val location: String = "",
)

/** Rows of the "Add slots" sheet, mirroring the web dialog: a new row copies the last one, starting where it ended. */
@Immutable
data class SlotsForm(val drafts: List<SlotDraft>, private val nextKey: Int = drafts.size) {

    val canAddRow: Boolean get() = drafts.size < MAX_SLOTS

    fun addRow(): SlotsForm {
        if (!canAddRow) return this
        val last = drafts.lastOrNull() ?: return copy(drafts = listOf(SlotDraft(nextKey, "")), nextKey = nextKey + 1)
        val length = SlotTimes.minutes(last.endTime) - SlotTimes.minutes(last.startTime)
        val next = last.copy(
            key = nextKey,
            startTime = last.endTime,
            endTime = SlotTimes.time(SlotTimes.minutes(last.endTime) + maxOf(length, SlotTimes.MIN_LENGTH_MINUTES)),
        )
        return copy(drafts = drafts + next, nextKey = nextKey + 1)
    }

    /** The last row cannot be removed. */
    fun removeRow(key: Int): SlotsForm = if (drafts.size <= 1) this else copy(drafts = drafts.filterNot { it.key == key })

    fun update(key: Int, transform: (SlotDraft) -> SlotDraft): SlotsForm =
        copy(drafts = drafts.map { if (it.key == key) transform(it) else it })

    fun toInputs(): List<SlotInput> = drafts.map {
        SlotInput(it.date, it.startTime, it.endTime, it.mode, it.location.trim().ifBlank { null })
    }

    companion object {
        /** API limit per request. */
        const val MAX_SLOTS = 50

        fun start(date: String) = SlotsForm(listOf(SlotDraft(key = 0, date = date)), nextKey = 1)
    }
}
