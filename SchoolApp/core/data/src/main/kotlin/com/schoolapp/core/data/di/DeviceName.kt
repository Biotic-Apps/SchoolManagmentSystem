package com.schoolapp.core.data.di

import javax.inject.Qualifier

/** Human-readable device model sent on login so users recognise their sessions. */
@Qualifier
@Retention(AnnotationRetention.BINARY)
annotation class DeviceName
