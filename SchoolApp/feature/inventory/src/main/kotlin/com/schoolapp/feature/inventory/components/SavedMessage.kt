package com.schoolapp.feature.inventory.components

import androidx.annotation.StringRes
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.serverCode

/** Success text a form emits once it saved; the route shows it in a snackbar and reloads the tabs. */
data class SavedMessage(@StringRes val res: Int, val arg: String? = null)

/** 409 "already exists" (duplicate SKU or tag). */
internal val AppError.isConflict: Boolean
    get() = serverCode == "CONFLICT" || (this is AppError.Server && httpCode == HTTP_CONFLICT && code != NEGATIVE_STOCK)

/** Movement or sale would take stock below zero; the server message names the item. */
internal val AppError.isNegativeStock: Boolean get() = serverCode == NEGATIVE_STOCK

/** The server's own message for rule errors, when it sent one. */
internal val AppError.serverMessage: String? get() = (this as? AppError.Server)?.message?.takeIf { it.isNotBlank() }

private const val HTTP_CONFLICT = 409
private const val NEGATIVE_STOCK = "NEGATIVE_STOCK"
