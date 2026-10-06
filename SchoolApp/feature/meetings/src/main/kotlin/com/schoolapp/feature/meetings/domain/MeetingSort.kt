package com.schoolapp.feature.meetings.domain

import com.schoolapp.core.model.meeting.Meeting

internal fun List<Meeting>.chronological(): List<Meeting> = sortedWith(compareBy<Meeting>({ it.date }, { it.startTime }))

internal fun List<Meeting>.newestFirst(): List<Meeting> = chronological().asReversed()
