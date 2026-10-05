package com.schoolapp.core.designsystem.component

import androidx.compose.runtime.Immutable

@Immutable
data class SwitcherOption(
    val id: String,
    val label: String,
    val supporting: String? = null,
)
