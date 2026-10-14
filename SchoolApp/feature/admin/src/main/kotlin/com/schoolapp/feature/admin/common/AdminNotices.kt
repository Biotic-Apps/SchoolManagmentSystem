package com.schoolapp.feature.admin.common

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

/** A success message raised on one screen and shown as a snackbar on the screen the user returns to. */
data class AdminNotice(val kind: Kind, val name: String = "") {
    enum class Kind {
        SCHOOL_UPDATED,
        SCHOOL_ARCHIVED,
        SCHOOL_RESTORED,
        SCHOOL_DELETED,
        SCHOOL_CREATED,
        USER_CREATED,
        USER_UPDATED,
        USER_DISABLED,
        USER_ENABLED,
        USER_UNLOCKED,
        ROLE_ASSIGNED,
        ASSIGNMENT_ENDED,
    }
}

/** One pending notice at a time; the first screen that shows it consumes it. */
@Singleton
class AdminNotices @Inject constructor() {
    private val _notice = MutableStateFlow<AdminNotice?>(null)
    val notice: StateFlow<AdminNotice?> = _notice.asStateFlow()

    fun post(notice: AdminNotice) {
        _notice.value = notice
    }

    fun consume(notice: AdminNotice) {
        _notice.compareAndSet(notice, null)
    }
}
