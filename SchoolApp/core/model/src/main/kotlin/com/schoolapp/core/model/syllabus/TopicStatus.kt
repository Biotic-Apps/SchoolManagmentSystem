package com.schoolapp.core.model.syllabus

enum class TopicStatus {
    NOT_STARTED,
    IN_PROGRESS,
    COMPLETED,
    ;

    companion object {
        fun fromKey(key: String?): TopicStatus = entries.firstOrNull { it.name == key } ?: NOT_STARTED
    }
}
