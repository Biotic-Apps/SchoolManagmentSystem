package com.schoolapp.feature.admin.roles

import androidx.annotation.StringRes
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import javax.inject.Inject
import javax.inject.Singleton

/** Carries the editor's success message ("Role created") back to the list, which shows it as a snackbar. */
@Singleton
class RoleEvents @Inject constructor() {
    private val _messages = MutableSharedFlow<Int>(extraBufferCapacity = 1)
    val messages: SharedFlow<Int> = _messages.asSharedFlow()

    fun post(@StringRes message: Int) {
        _messages.tryEmit(message)
    }
}
