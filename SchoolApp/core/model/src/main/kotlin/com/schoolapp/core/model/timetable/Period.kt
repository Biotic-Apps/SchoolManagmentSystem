package com.schoolapp.core.model.timetable

data class Period(val index: Int, val startTime: String, val endTime: String, val isBreak: Boolean, val label: String?)
