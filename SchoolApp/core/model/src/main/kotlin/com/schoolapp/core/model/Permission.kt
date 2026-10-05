package com.schoolapp.core.model

/** A `module.action` key, e.g. `attendance.submit`. */
@JvmInline
value class Permission(val key: String) {
    override fun toString(): String = key
}
