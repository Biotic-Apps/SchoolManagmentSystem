package com.schoolapp.core.model.progress

enum class HomeworkStatus { DONE, PARTIAL, NOT_DONE }

data class HomeworkTick(val studentId: String, val status: HomeworkStatus)
