package com.schoolapp.feature.exams.grading

import com.schoolapp.core.model.exams.grading.GradingScheme
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update

/** Edits of the open grading scheme form; saving lives in [GradingSchemesViewModel.save]. */
internal class GradingFormActions(private val state: MutableStateFlow<GradingUiState>) {

    fun openNew() = state.update { if (it.canAdd) it.copy(form = GradingForm(), message = null) else it }

    fun openEdit(scheme: GradingScheme) = state.update { if (it.canEdit) it.copy(form = GradingForm.from(scheme), message = null) else it }

    fun dismiss() = state.update { if (it.form?.isSaving == true) it else it.copy(form = null) }

    fun onName(value: String) = edit { it.copy(name = value, nameMissing = false) }

    fun onPass(value: String) = edit { it.copy(passPercent = value.filter(Char::isDigit).take(3), passInvalid = false) }

    fun useStandard() = edit { it.copy(bands = GradingForm.STANDARD.map { band -> band.copy(key = java.util.UUID.randomUUID().toString()) }, bandIssues = emptyMap(), coverage = emptyList()) }

    fun addBand() = edit { it.copy(bands = it.bands + BandInput(), coverage = emptyList()) }

    fun removeBand(key: String) = edit { it.copy(bands = it.bands.filterNot { band -> band.key == key }, bandIssues = it.bandIssues - key) }

    fun updateBand(key: String, transform: (BandInput) -> BandInput) = edit { form ->
        form.copy(bands = form.bands.map { if (it.key == key) transform(it) else it }, bandIssues = form.bandIssues - key, coverage = emptyList())
    }

    private fun edit(transform: (GradingForm) -> GradingForm) =
        state.update { current -> current.form?.let { current.copy(form = transform(it)) } ?: current }
}
