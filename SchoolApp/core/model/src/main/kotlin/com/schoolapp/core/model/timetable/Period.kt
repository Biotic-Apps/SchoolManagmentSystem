package com.schoolapp.core.model.timetable

/**
 * One bell-schedule row. [number] is the ordinal among the day's teaching periods ("Period N"),
 * null for breaks; [label] only means something on breaks ("Break", "Lunch").
 */
data class Period(
    val index: Int,
    val startTime: String,
    val endTime: String,
    val isBreak: Boolean,
    val label: String?,
    val number: Int? = null,
)
