package com.schoolapp.demo

import androidx.lifecycle.ViewModel
import com.schoolapp.core.model.RoleRef
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@HiltViewModel
class DemoViewModel @Inject constructor(
    private val repository: DemoAwareAuthRepository,
) : ViewModel() {
    val roles: List<RoleRef> = DemoSessions.roles

    fun start(role: RoleRef) = repository.startDemo(role)
}
