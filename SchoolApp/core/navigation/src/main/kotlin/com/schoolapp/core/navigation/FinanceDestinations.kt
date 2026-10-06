package com.schoolapp.core.navigation

import kotlinx.serialization.Serializable

/*
 * Phase 4 screens opened from other modules (parent shortcuts, dashboard tiles). Each is registered by the
 * owning feature's `xxxDestinations(navController)`.
 */

/** :feature:certificates — parent: certificate requests for the active child. */
@Serializable
data object CertificatesDestination
