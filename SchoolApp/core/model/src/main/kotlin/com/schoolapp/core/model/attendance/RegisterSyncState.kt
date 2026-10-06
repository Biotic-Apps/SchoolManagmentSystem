package com.schoolapp.core.model.attendance

/** Outbox state of one section/date register on this device. */
enum class RegisterSyncState { NONE, QUEUED, NEEDS_ATTENTION }
