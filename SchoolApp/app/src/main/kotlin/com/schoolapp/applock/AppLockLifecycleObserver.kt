package com.schoolapp.applock

import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.schoolapp.core.data.applock.AppLockController
import dagger.Lazy
import javax.inject.Inject
import javax.inject.Singleton

/** Feeds process foreground / background (ProcessLifecycleOwner) into the app-lock timer. */
@Singleton
class AppLockLifecycleObserver @Inject constructor(
    private val controller: Lazy<AppLockController>,
) : DefaultLifecycleObserver {

    override fun onStart(owner: LifecycleOwner) = controller.get().onForeground()

    override fun onStop(owner: LifecycleOwner) = controller.get().onBackground()
}
