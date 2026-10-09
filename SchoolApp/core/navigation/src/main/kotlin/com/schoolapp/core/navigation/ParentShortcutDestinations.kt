package com.schoolapp.core.navigation

import kotlinx.serialization.Serializable

/*
 * Screens the parent home opens directly (quick actions, fee tile). Each is registered by the owning
 * feature's `xxxDestinations(navController)`.
 */

/** :feature:fees — one invoice with its lines, payments, receipts, proof upload and online payment. */
@Serializable
data class InvoiceDetailDestination(val invoiceId: String)

/** :feature:meetings — parent: pick an open slot for the active child. */
@Serializable
data object BookMeetingDestination

/** :feature:messages — start a conversation (parent: about a child, the server picks the class teacher). */
@Serializable
data object NewThreadDestination
