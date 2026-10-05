package com.schoolapp.ui

import androidx.compose.runtime.Composable

/** Optional extra content under the login form (provided only by debug builds). */
fun interface LoginFooterContent {
    @Composable
    fun Content()
}
