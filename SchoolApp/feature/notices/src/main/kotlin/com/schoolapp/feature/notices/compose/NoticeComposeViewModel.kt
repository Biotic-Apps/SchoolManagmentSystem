package com.schoolapp.feature.notices.compose

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.model.notice.NoticeInput
import com.schoolapp.core.model.notice.NoticeStatus
import com.schoolapp.feature.notices.NoticeComposeResult
import com.schoolapp.feature.notices.NoticeEvents
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** New notice for the active branch: whole branch, or chosen classes / sections; teachers' notices may go to approval. */
@HiltViewModel
class NoticeComposeViewModel @Inject constructor(
    private val noticesRepository: NoticesRepository,
    private val organisationRepository: OrganisationRepository,
    private val authRepository: AuthRepository,
    private val events: NoticeEvents,
    clock: AppClock,
) : ViewModel() {

    private val _uiState = MutableStateFlow(NoticeComposeUiState(today = clock.now().toLocalDate().toString()))
    val uiState: StateFlow<NoticeComposeUiState> = _uiState.asStateFlow()

    private var branchId: String? = null

    init {
        loadOptions()
    }

    fun loadOptions() {
        _uiState.update { it.copy(optionsLoading = true, optionsError = null) }
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val branch = session.activeBranchId
            branchId = branch
            val schoolId = session.activeAssignments.firstNotNullOfOrNull { it.schoolId }
            val classesCall = async { organisationRepository.classes(schoolId) }
            val sectionsCall = async {
                if (branch == null) {
                    AppResult.Success(emptyList())
                } else {
                    val activeSession = (organisationRepository.sessions(branch) as? AppResult.Success)?.data?.firstOrNull { it.isActive }
                    organisationRepository.sections(branch, activeSession?.id)
                }
            }
            val classes = classesCall.await()
            val sections = sectionsCall.await()
            val error = (classes as? AppResult.Failure)?.error ?: (sections as? AppResult.Failure)?.error
            if (error != null) return@launch _uiState.update { it.copy(optionsLoading = false, optionsError = error) }
            val sectionList = (sections as AppResult.Success).data.sortedWith(compareBy({ it.className }, { it.name }))
            val classList = (classes as AppResult.Success).data
                .let { all -> all.filter { c -> sectionList.any { it.classId == c.id } }.ifEmpty { all } }
                .sortedWith(compareBy({ it.levelOrder ?: Int.MAX_VALUE }, { it.name }))
            _uiState.update {
                it.copy(
                    optionsLoading = false,
                    classes = classList.map { c -> SwitcherOption(c.id, c.name) },
                    sections = sectionList.map { s -> SwitcherOption(s.id, listOfNotNull(s.className, s.name).joinToString(" - ")) },
                )
            }
        }
    }

    fun onTitleChange(value: String) = _uiState.update { it.copy(title = value, titleMissing = false) }

    fun onBodyChange(value: String) = _uiState.update { it.copy(body = value, bodyMissing = false) }

    fun onAudienceChange(mode: AudienceMode) = _uiState.update { it.copy(audience = mode, audienceMissing = false) }

    fun onToggleClass(id: String) = _uiState.update { it.copy(selectedClassIds = it.selectedClassIds.toggle(id), audienceMissing = false) }

    fun onToggleSection(id: String) = _uiState.update { it.copy(selectedSectionIds = it.selectedSectionIds.toggle(id), audienceMissing = false) }

    fun onExpiresOnChange(date: String?) = _uiState.update { it.copy(expiresOn = date, expiryInvalid = false) }

    fun onPinnedChange(pinned: Boolean) = _uiState.update { it.copy(pinned = pinned) }

    fun publish() {
        val state = _uiState.value
        if (state.isPublishing) return
        val titleMissing = state.title.isBlank()
        val bodyMissing = state.body.isBlank()
        val audienceMissing = when (state.audience) {
            AudienceMode.BRANCH -> false
            AudienceMode.CLASSES -> state.selectedClassIds.isEmpty()
            AudienceMode.SECTIONS -> state.selectedSectionIds.isEmpty()
        }
        val expiryInvalid = state.expiresOn != null && state.expiresOn < state.today
        if (titleMissing || bodyMissing || audienceMissing || expiryInvalid) {
            _uiState.update {
                it.copy(titleMissing = titleMissing, bodyMissing = bodyMissing, audienceMissing = audienceMissing, expiryInvalid = expiryInvalid)
            }
            return
        }
        val input = NoticeInput(
            title = state.title.trim(),
            body = state.body.trim(),
            branchId = branchId,
            wholeBranch = state.audience == AudienceMode.BRANCH,
            classIds = if (state.audience == AudienceMode.CLASSES) state.selectedClassIds.toList() else emptyList(),
            sectionIds = if (state.audience == AudienceMode.SECTIONS) state.selectedSectionIds.toList() else emptyList(),
            expiresOn = state.expiresOn,
            pinned = state.pinned,
        )
        _uiState.update { it.copy(isPublishing = true, error = null) }
        viewModelScope.launch {
            when (val result = noticesRepository.createAndPublish(input)) {
                is AppResult.Failure -> _uiState.update { it.copy(isPublishing = false, error = result.error) }
                is AppResult.Success -> {
                    val outcome = if (result.data.status == NoticeStatus.PENDING_REVIEW) {
                        NoticeComposeResult.SENT_FOR_APPROVAL
                    } else {
                        NoticeComposeResult.PUBLISHED
                    }
                    events.postComposeResult(outcome)
                    _uiState.update { it.copy(isPublishing = false, result = outcome) }
                }
            }
        }
    }

    private fun Set<String>.toggle(id: String): Set<String> = if (id in this) this - id else this + id
}
