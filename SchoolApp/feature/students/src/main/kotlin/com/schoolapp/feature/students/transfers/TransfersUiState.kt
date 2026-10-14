package com.schoolapp.feature.students.transfers

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.model.transfers.Transfer
import com.schoolapp.core.model.transfers.TransferFilter
import com.schoolapp.feature.students.add.SectionOption

enum class CloseAction { REJECT, CANCEL }

/** Open sheet on the Transfers tab. */
sealed interface TransferSheet {
    val transfer: Transfer
    val saving: Boolean
    val error: ActionError?

    /** Place an incoming transfer into a section of this branch's active session. */
    @Immutable
    data class Accept(
        override val transfer: Transfer,
        val sectionId: String? = null,
        val sectionMissing: Boolean = false,
        override val saving: Boolean = false,
        override val error: ActionError? = null,
    ) : TransferSheet

    /** Reject (incoming) or cancel (outgoing) with a reason of 3+ characters. */
    @Immutable
    data class Close(
        override val transfer: Transfer,
        val action: CloseAction,
        val reason: String = "",
        val reasonError: Boolean = false,
        override val saving: Boolean = false,
        override val error: ActionError? = null,
    ) : TransferSheet
}

enum class TransferNotice { ACCEPTED, REJECTED, CANCELLED }

@Immutable
data class TransfersUiState(
    val scopeLoading: Boolean = true,
    val scopeError: AppError? = null,
    val branchId: String? = null,
    val sections: List<SectionOption> = emptyList(),
    val filter: TransferFilter = TransferFilter(),
    /** `students.edit`: accept, reject, cancel. */
    val canDecide: Boolean = false,
    val sheet: TransferSheet? = null,
    val notice: TransferNotice? = null,
)
