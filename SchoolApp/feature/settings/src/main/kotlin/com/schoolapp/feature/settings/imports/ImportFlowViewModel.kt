package com.schoolapp.feature.settings.imports

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.settings.ImportsRepository
import com.schoolapp.core.data.settings.SettingsRepository
import com.schoolapp.core.model.settings.ImportKind
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Choose branch / session / kind → template → upload → validate (polled) → review → commit (polled) → done. */
@HiltViewModel
internal class ImportFlowViewModel @Inject constructor(
    private val settings: SettingsRepository,
    private val organisation: OrganisationRepository,
    private val imports: ImportsRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(ImportFlowUiState())
    val uiState: StateFlow<ImportFlowUiState> = _uiState.asStateFlow()

    private var schoolId: String? = null
    private var sessionsJob: Job? = null
    private var detailJob: Job? = null

    fun bind(id: String) {
        if (schoolId == id) return
        schoolId = id
        loadBranches()
    }

    fun retryBranches() = loadBranches()

    fun selectBranch(id: String) {
        if (_uiState.value.branchId == id) return
        _uiState.update { it.copy(branchId = id, sessionId = null) }
        loadSessions(id)
    }

    fun selectSession(id: String) = _uiState.update { it.copy(sessionId = id) }

    fun selectKind(kind: ImportKind) = _uiState.update { it.copy(kind = kind, templateResult = null, templateError = null) }

    fun saveTemplate(destinationUri: String) {
        val kind = _uiState.value.kind
        _uiState.update { it.copy(templateSaving = true, templateResult = null, templateError = null) }
        viewModelScope.launch {
            val result = imports.saveTemplate(kind, destinationUri)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(templateSaving = false, templateResult = TemplateResult.SAVED)
                    is AppResult.Failure -> state.copy(templateSaving = false, templateError = result.error)
                }
            }
        }
    }

    fun upload(uri: String) {
        val state = _uiState.value
        val branchId = state.branchId ?: return
        val sessionId = state.sessionId ?: return
        if (state.uploading) return
        _uiState.update { it.copy(uploading = true, uploadError = null) }
        viewModelScope.launch {
            when (val result = imports.upload(uri, state.kind, branchId, sessionId)) {
                is AppResult.Success -> {
                    _uiState.update { it.copy(uploading = false, historyVersion = it.historyVersion + 1) }
                    open(result.data)
                }
                is AppResult.Failure -> _uiState.update { it.copy(uploading = false, uploadError = result.error) }
            }
        }
    }

    /** Shows an import (fresh upload or picked from history) in the result card. */
    fun open(id: String) {
        _uiState.update {
            it.copy(importId = id, fileName = null, detail = null, detailError = null, committed = false, commitError = null)
        }
        watchDetail(id)
    }

    fun retryDetail() = _uiState.value.importId?.let(::watchDetail)

    fun askCommit(mode: CommitMode) = _uiState.update { it.copy(commitDialog = mode, commitError = null) }

    fun dismissCommit() = _uiState.update { it.copy(commitDialog = null) }

    fun confirmCommit() {
        val state = _uiState.value
        val id = state.importId ?: return
        val mode = state.commitDialog ?: return
        if (state.committing) return
        _uiState.update { it.copy(committing = true, commitError = null) }
        viewModelScope.launch {
            val result = imports.commit(id, skipInvalid = mode == CommitMode.SKIP)
            _uiState.update { now ->
                when (result) {
                    is AppResult.Success -> now.copy(committing = false, commitDialog = null, committed = true)
                    is AppResult.Failure -> now.copy(committing = false, commitDialog = null, commitError = result.error)
                }
            }
            if (result is AppResult.Success) watchDetail(id)
        }
    }

    fun reset() {
        detailJob?.cancel()
        _uiState.update {
            it.copy(importId = null, fileName = null, detail = null, detailError = null, uploadError = null, committed = false)
        }
    }

    /** Loads the detail and keeps polling while the server is working on it. */
    private fun watchDetail(id: String) {
        detailJob?.cancel()
        detailJob = viewModelScope.launch {
            _uiState.update { it.copy(detailLoading = it.detail == null, detailError = null) }
            while (true) {
                val result = imports.detail(id)
                val wasBusy = _uiState.value.shouldPoll
                _uiState.update { state ->
                    when (result) {
                        is AppResult.Success -> state.copy(detailLoading = false, detail = result.data)
                        is AppResult.Failure -> state.copy(detailLoading = false, detailError = result.error)
                    }
                }
                if (result is AppResult.Failure) return@launch
                if (!_uiState.value.shouldPoll) {
                    if (wasBusy) _uiState.update { it.copy(historyVersion = it.historyVersion + 1) }
                    return@launch
                }
                delay(POLL_MS)
            }
        }
    }

    private fun loadBranches() {
        val id = schoolId ?: return
        viewModelScope.launch {
            _uiState.update { it.copy(branchesLoading = true, branchesError = null) }
            when (val result = settings.branches(id)) {
                is AppResult.Success -> {
                    val branchId = result.data.firstOrNull { it.id == _uiState.value.branchId }?.id ?: result.data.firstOrNull()?.id
                    _uiState.update { it.copy(branchesLoading = false, branches = result.data, branchId = branchId) }
                    branchId?.let(::loadSessions)
                }
                is AppResult.Failure -> _uiState.update { it.copy(branchesLoading = false, branchesError = result.error) }
            }
        }
    }

    private fun loadSessions(branchId: String) {
        sessionsJob?.cancel()
        sessionsJob = viewModelScope.launch {
            _uiState.update { it.copy(sessionsLoading = true, sessions = emptyList()) }
            val sessions = (organisation.sessions(branchId) as? AppResult.Success)?.data.orEmpty()
            val chosen = sessions.firstOrNull { it.isActive } ?: sessions.firstOrNull()
            _uiState.update { it.copy(sessionsLoading = false, sessions = sessions, sessionId = chosen?.id) }
        }
    }

    private companion object {
        const val POLL_MS = 2_000L
    }
}
