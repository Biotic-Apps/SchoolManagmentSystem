package com.schoolapp.core.model.expenses

data class Vendor(
    val id: String,
    val name: String,
    val contactPerson: String?,
    val phone: String?,
    val email: String?,
    val address: String?,
    val ntn: String?,
)

data class ExpenseCategory(val id: String, val name: String, val code: String?)
