package com.schoolapp.feature.settings.imports

import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.model.settings.ImportDetail
import com.schoolapp.core.model.settings.ImportKind
import com.schoolapp.core.model.settings.ImportValue
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.settings.R
import java.text.NumberFormat
import java.util.Locale

@get:StringRes
internal val ImportKind.label: Int
    get() = when (this) {
        ImportKind.STUDENTS -> R.string.settings_imports_kind_students
        ImportKind.GUARDIANS -> R.string.settings_imports_kind_guardians
        ImportKind.STAFF -> R.string.settings_imports_kind_staff
        ImportKind.OPENING_BALANCES -> R.string.settings_imports_kind_opening
        ImportKind.FEE_PLANS -> R.string.settings_imports_kind_fee_plans
    }

@get:StringRes
internal val ImportKind.description: Int
    get() = when (this) {
        ImportKind.STUDENTS -> R.string.settings_imports_kind_students_hint
        ImportKind.GUARDIANS -> R.string.settings_imports_kind_guardians_hint
        ImportKind.STAFF -> R.string.settings_imports_kind_staff_hint
        ImportKind.OPENING_BALANCES -> R.string.settings_imports_kind_opening_hint
        ImportKind.FEE_PLANS -> R.string.settings_imports_kind_fee_plans_hint
    }

/** Kind label from the API key; unknown keys are humanized. */
@Composable
internal fun importKindLabel(key: String?): String =
    ImportKind.fromKey(key)?.let { stringResource(it.label) } ?: humanizeKey(key.orEmpty())

internal fun importStatusTone(status: String): StatusTone = when (status) {
    ImportDetail.COMMITTED, ImportDetail.READY -> StatusTone.Success
    ImportDetail.INVALID, ImportDetail.REVERTED -> StatusTone.Warning
    ImportDetail.FAILED -> StatusTone.Error
    ImportDetail.VALIDATING, ImportDetail.COMMITTING -> StatusTone.Info
    else -> StatusTone.Neutral
}

/** "admissionNo" / "admission_no" → "Admission no". */
internal fun humanizeColumn(key: String): String = humanizeKey(key.replace(Regex("([a-z0-9])([A-Z])"), "$1_$2"))

internal fun isMoneyKey(key: String): Boolean = key.endsWith("Minor") || key.lowercase(Locale.ROOT).endsWith("_minor")

/** Display text of a preview / reconciliation value; null for empty. */
internal fun formatImportValue(key: String, value: ImportValue, yes: String, no: String): String? = when (value) {
    ImportValue.Empty -> null
    is ImportValue.Text -> value.value
    is ImportValue.Bool -> if (value.value) yes else no
    is ImportValue.Json -> value.raw
    is ImportValue.Number -> if (isMoneyKey(key)) MoneyFormat.format(value.value.toLong()) else formatNumber(value.value)
}

internal fun formatNumber(value: Double): String = NumberFormat.getNumberInstance(Locale.ENGLISH).format(value)

internal fun formatCount(value: Int): String = NumberFormat.getIntegerInstance(Locale.ENGLISH).format(value)
