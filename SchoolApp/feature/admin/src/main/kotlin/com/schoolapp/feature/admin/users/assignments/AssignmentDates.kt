package com.schoolapp.feature.admin.users.assignments

import java.time.LocalDate
import java.time.ZoneId

/** School days follow Pakistan time, like the server. */
private val SCHOOL_ZONE: ZoneId = ZoneId.of("Asia/Karachi")

/** "yyyy-MM-dd" of today. */
internal fun today(): String = LocalDate.now(SCHOOL_ZONE).toString()

/** "yyyy-MM-dd" of tomorrow: the earliest end date of an assignment. */
internal fun tomorrow(): String = LocalDate.now(SCHOOL_ZONE).plusDays(1).toString()
