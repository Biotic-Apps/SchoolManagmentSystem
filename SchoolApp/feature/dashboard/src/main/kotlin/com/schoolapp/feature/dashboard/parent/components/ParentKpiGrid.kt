package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.navigation.MenuIds
import com.schoolapp.feature.dashboard.DashboardLink
import com.schoolapp.feature.dashboard.action
import com.schoolapp.feature.dashboard.parent.ParentHome
import com.schoolapp.feature.dashboard.parent.feeLink

private enum class Kpi { ATTENDANCE, FEES, RESULT, HOMEWORK }

/** Attendance, fees (when visible to the parent), latest result and homework: 2 x 2 on phones, one row when wide. */
@Composable
internal fun ParentKpiGrid(
    home: ParentHome,
    onOpenMenu: (String) -> Unit,
    onOpen: (Any) -> Unit,
    canOpenMenu: (String) -> Boolean,
    challan: ParentChallan,
    modifier: Modifier = Modifier,
) {
    val tiles = Kpi.entries.filter { it != Kpi.FEES || home.fees != null }
    val menu = { id: String -> DashboardLink.Menu(id).action(onOpenMenu, onOpen, canOpenMenu) }
    AdaptiveCells(count = tiles.size, modifier = modifier) { index, cellModifier ->
        val tileModifier = cellModifier.fillMaxHeight()
        when (tiles[index]) {
            Kpi.ATTENDANCE -> AttendanceTile(home.month, home.attendance, menu(MenuIds.ATTENDANCE), tileModifier)
            Kpi.FEES -> home.fees?.let { fees ->
                FeeTile(fees, feeLink(fees, canOpenMenu).action(onOpenMenu, onOpen, canOpenMenu), challan, tileModifier)
            }
            Kpi.RESULT -> ResultTile(home.latestResult, menu(MenuIds.PROGRESS), tileModifier)
            Kpi.HOMEWORK -> HomeworkTile(home.homework, menu(MenuIds.DIARY), tileModifier)
        }
    }
}
