package com.schoolapp.feature.timetable.scope

import androidx.compose.runtime.staticCompositionLocalOf

/** Branch the admin timetable tabs are showing; tab view models are keyed by it so a branch switch reloads them. */
val LocalTimetableBranch = staticCompositionLocalOf<String?> { null }
