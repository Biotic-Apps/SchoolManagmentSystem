package com.schoolapp.feature.payroll.setup

import androidx.annotation.StringRes
import com.schoolapp.feature.payroll.R

/** Staff types (designation codes) used to filter payroll lists, as on the payroll staff API. */
internal enum class StaffType(@StringRes val label: Int) {
    PRINCIPAL(R.string.payroll_setup_type_principal),
    HEAD_TEACHER(R.string.payroll_setup_type_head_teacher),
    COORDINATOR(R.string.payroll_setup_type_coordinator),
    TEACHER(R.string.payroll_setup_type_teacher),
    ACCOUNTANT(R.string.payroll_setup_type_accountant),
    OFFICE_STAFF(R.string.payroll_setup_type_office_staff),
    HELPER(R.string.payroll_setup_type_helper),
    OTHER(R.string.payroll_setup_type_other),
}

/** Chip id for "all staff types". */
internal const val ALL_TYPES = "ALL"
