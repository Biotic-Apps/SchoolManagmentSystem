package com.schoolapp.core.model.syllabus

/** Body of `POST /syllabus-topics/:id/progress`; [completedOn] is `YYYY-MM-DD`. */
data class TopicProgressUpdate(val status: TopicStatus, val completedOn: String?, val note: String?)
