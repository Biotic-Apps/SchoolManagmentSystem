package com.schoolapp.feature.meetings.domain

import java.time.LocalDateTime

enum class SlotProblem { DATE_PAST, START_PAST, END_BEFORE_START, OVERLAP, LOCATION_TOO_LONG }

/** Client-side mirror of the API's slot rules, so most mistakes never leave the device. */
internal object SlotValidator {
    const val MAX_LOCATION = 200

    /** Problems per draft key; an empty map means the form can be submitted. ISO strings compare in time order. */
    fun validate(drafts: List<SlotDraft>, now: LocalDateTime): Map<Int, Set<SlotProblem>> {
        val today = now.toLocalDate().toString()
        val nowTime = SlotTimes.time(now.hour * 60 + now.minute)
        return drafts.mapIndexed { index, draft ->
            draft.key to buildSet {
                when {
                    draft.date < today -> add(SlotProblem.DATE_PAST)
                    draft.date == today && draft.startTime <= nowTime -> add(SlotProblem.START_PAST)
                }
                if (draft.endTime <= draft.startTime) add(SlotProblem.END_BEFORE_START)
                if (drafts.take(index).any { it.overlaps(draft) }) add(SlotProblem.OVERLAP)
                if (draft.location.trim().length > MAX_LOCATION) add(SlotProblem.LOCATION_TOO_LONG)
            }
        }.filter { it.second.isNotEmpty() }.toMap()
    }

    /** `[start, end)` ranges on the same day intersect. */
    private fun SlotDraft.overlaps(other: SlotDraft): Boolean =
        date == other.date && startTime < other.endTime && other.startTime < endTime
}
