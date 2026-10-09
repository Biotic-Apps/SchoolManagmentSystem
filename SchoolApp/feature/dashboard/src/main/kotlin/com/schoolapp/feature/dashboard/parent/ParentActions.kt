package com.schoolapp.feature.dashboard.parent

import com.schoolapp.core.model.fees.FeeSummary
import com.schoolapp.core.navigation.BookMeetingDestination
import com.schoolapp.core.navigation.HealthCardDestination
import com.schoolapp.core.navigation.InvoiceDetailDestination
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.core.navigation.NewThreadDestination
import com.schoolapp.core.navigation.PickupDestination
import com.schoolapp.feature.dashboard.DashboardLink

/** Parent home shortcuts, in display order. */
internal enum class ParentActionKind { PAY_FEES, MESSAGE_TEACHER, APPLY_LEAVE, BOOK_MEETING, HEALTH, PICKUP }

internal data class ParentAction(val kind: ParentActionKind, val link: DashboardLink)

/**
 * Shortcuts whose destination the role can reach: fee, message, leave and meeting actions follow the role's
 * menus (a parent without the fees menu, or with fees hidden, gets no pay action); health and pickup always show.
 */
internal fun parentActions(fees: FeeSummary?, canOpenMenu: (String) -> Boolean): List<ParentAction> = buildList {
    feeLink(fees, canOpenMenu)?.let { add(ParentAction(ParentActionKind.PAY_FEES, it)) }
    if (canOpenMenu(MenuIds.MESSAGES)) add(ParentAction(ParentActionKind.MESSAGE_TEACHER, DashboardLink.Screen(NewThreadDestination)))
    if (canOpenMenu(MenuIds.ATTENDANCE)) add(ParentAction(ParentActionKind.APPLY_LEAVE, DashboardLink.Menu(MenuIds.ATTENDANCE)))
    if (canOpenMenu(MenuIds.MEETINGS)) add(ParentAction(ParentActionKind.BOOK_MEETING, DashboardLink.Screen(BookMeetingDestination)))
    add(ParentAction(ParentActionKind.HEALTH, DashboardLink.Screen(HealthCardDestination())))
    add(ParentAction(ParentActionKind.PICKUP, DashboardLink.Screen(PickupDestination)))
}

/** The next-due invoice (challan, pay online, upload proof) when known, else the fees screen; null without fees access. */
internal fun feeLink(fees: FeeSummary?, canOpenMenu: (String) -> Boolean): DashboardLink? {
    if (fees == null || !canOpenMenu(MenuIds.FEES)) return null
    return fees.nextDue?.invoiceId?.let { DashboardLink.Screen(InvoiceDetailDestination(it)) } ?: DashboardLink.Menu(MenuIds.FEES)
}
