package com.schoolapp.feature.complaints.file

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.complaints.ComplaintsRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.complaint.ComplaintCategory
import com.schoolapp.core.model.complaint.ComplaintInput
import com.schoolapp.core.model.files.Attachment
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** File a complaint: category, subject, description, optional child (parent), anonymity and attachments. */
@HiltViewModel
class FileComplaintViewModel @Inject constructor(
    private val repository: ComplaintsRepository,
    private val filesRepository: FilesRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(FileComplaintUiState())
    val uiState: StateFlow<FileComplaintUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            val parent = session.activeRole == RoleKey.PARENT
            _uiState.update {
                it.copy(
                    isParent = parent,
                    children = if (parent) session.children else emptyList(),
                    childId = if (parent) session.activeChild?.id else null,
                )
            }
        }
    }

    fun onCategorySelected(category: ComplaintCategory) = _uiState.update { it.copy(category = category, categoryMissing = false) }

    fun onChildSelected(childId: String?) = _uiState.update { it.copy(childId = childId) }

    fun onSubjectChange(text: String) = _uiState.update { it.copy(subject = text, subjectMissing = false) }

    fun onDescriptionChange(text: String) = _uiState.update { it.copy(description = text, descriptionMissing = false) }

    fun onAnonymousChange(anonymous: Boolean) = _uiState.update { it.copy(anonymous = anonymous) }

    fun onAttach(uri: String) {
        _uiState.update { it.copy(uploadingCount = it.uploadingCount + 1, error = null) }
        viewModelScope.launch {
            val result = filesRepository.upload(uri)
            _uiState.update { state ->
                when (result) {
                    is AppResult.Success -> state.copy(
                        uploadingCount = state.uploadingCount - 1,
                        attachments = state.attachments + result.data.let { Attachment(it.id, it.url, it.mime, it.name) },
                    )
                    is AppResult.Failure -> state.copy(uploadingCount = state.uploadingCount - 1, error = result.error)
                }
            }
        }
    }

    fun onRemoveAttachment(id: String) = _uiState.update { state -> state.copy(attachments = state.attachments.filterNot { it.id == id }) }

    fun submit() {
        val state = _uiState.value
        if (state.isSubmitting || state.uploadingCount > 0) return
        val category = state.category
        val checked = state.copy(
            categoryMissing = category == null,
            subjectMissing = state.subject.isBlank(),
            descriptionMissing = state.description.isBlank(),
        )
        if (category == null || checked.subjectMissing || checked.descriptionMissing) {
            _uiState.value = checked
            return
        }
        val input = ComplaintInput(
            category = category,
            subject = state.subject.trim(),
            description = state.description.trim(),
            studentId = state.childId.takeIf { state.isParent },
            anonymous = state.anonymous,
            attachmentFileIds = state.attachments.map(Attachment::id),
        )
        _uiState.update { it.copy(isSubmitting = true, error = null) }
        viewModelScope.launch {
            when (val result = repository.file(input)) {
                is AppResult.Success -> _uiState.update { it.copy(isSubmitting = false, filedId = result.data.id) }
                is AppResult.Failure -> _uiState.update { it.copy(isSubmitting = false, error = result.error) }
            }
        }
    }

    fun onNavigated() = _uiState.update { it.copy(filedId = null) }
}
