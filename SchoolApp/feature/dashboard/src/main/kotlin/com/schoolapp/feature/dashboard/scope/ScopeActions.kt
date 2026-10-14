package com.schoolapp.feature.dashboard.scope

import androidx.compose.runtime.Immutable

/** Callbacks of the dashboard scope bar. */
@Immutable
class ScopeActions(
    val onSchool: (String?) -> Unit = {},
    val onBranch: (String?) -> Unit = {},
    val onSession: (String?) -> Unit = {},
    val onReset: () -> Unit = {},
)
