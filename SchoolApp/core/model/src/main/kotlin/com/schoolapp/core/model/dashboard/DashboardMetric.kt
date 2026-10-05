package com.schoolapp.core.model.dashboard

/** One count from `/dashboard/summary`; later phases add keys, so [key] is open-ended. */
data class DashboardMetric(val key: String, val count: Long)
