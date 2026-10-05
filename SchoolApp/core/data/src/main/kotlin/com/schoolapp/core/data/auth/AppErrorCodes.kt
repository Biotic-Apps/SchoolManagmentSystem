package com.schoolapp.core.data.auth

import com.schoolapp.core.common.result.AppError

/** Server error code carried by [this], if any. */
val AppError.code: String?
    get() = when (this) {
        is AppError.Forbidden -> code
        is AppError.Server -> code
        else -> null
    }
