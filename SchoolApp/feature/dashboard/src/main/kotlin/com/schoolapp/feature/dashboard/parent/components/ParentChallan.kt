package com.schoolapp.feature.dashboard.parent.components

import androidx.compose.runtime.Stable
import com.schoolapp.feature.dashboard.parent.ChallanState

/** The fee tile's challan download state and its trigger (invoice id). */
@Stable
class ParentChallan(val state: ChallanState, val onDownload: (String) -> Unit)
