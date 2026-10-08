package com.schoolapp.core.data.setup

import com.schoolapp.core.model.setup.SetupChecklist
import com.schoolapp.core.model.setup.SetupItem
import com.schoolapp.core.model.setup.SetupStep
import com.schoolapp.core.network.dto.setup.SetupChecklistDto

/**
 * Known steps in a fixed order; unknown keys (a later API version) are dropped, duplicates keep the first.
 * `done` is also true when the count is positive, so a stale flag never leaves a finished step open — except for
 * steps whose count is what is still left (allocation), where only the server's flag counts.
 */
internal fun SetupChecklistDto.toModel(): SetupChecklist {
    val mapped = items
        .mapNotNull { dto -> SetupStep.fromKey(dto.key)?.let { SetupItem(it, dto.done || (dto.count > 0 && !it.countsRemaining), dto.count.coerceAtLeast(0)) } }
        .distinctBy { it.step }
        .sortedBy { it.step.ordinal }
    return SetupChecklist(
        branchId = branchId?.takeIf { it.isNotBlank() },
        complete = complete || (mapped.isNotEmpty() && mapped.all { it.done }),
        items = mapped,
    )
}
