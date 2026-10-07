package com.schoolapp.feature.health

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.files.AttachmentDraft
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.feature.health.report.ReportIncidentViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class ReportIncidentAttachmentsTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val health = FakeHealthRepository()
    private val files = FakeHealthFilesRepository()
    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 11, 30) }

    private fun viewModel() =
        ReportIncidentViewModel(SavedStateHandle(mapOf("studentId" to "s1")), health, FakeStudentsRepository(), clock, files)

    private fun ReportIncidentViewModel.fillRequired() {
        onDescriptionChange("Scraped knee")
        onActionTakenChange("Cleaned and bandaged")
    }

    @Test
    fun uploaded_files_are_sent_with_the_report() {
        val vm = viewModel()
        vm.fillRequired()
        vm.onAttach("content://photo-1")
        vm.onAttach("content://photo-2")
        vm.onRemoveAttachment("f1")
        vm.submit()

        assertEquals(listOf("f2"), health.reported.single().attachmentFileIds)
        assertEquals(listOf(FilePurpose.ATTACHMENT, FilePurpose.ATTACHMENT), files.purposes)
    }

    @Test
    fun report_without_files_sends_no_ids() {
        val vm = viewModel()
        vm.fillRequired()
        vm.submit()
        assertTrue(health.reported.single().attachmentFileIds.isEmpty())
    }

    @Test
    fun upload_failure_surfaces_error_and_clears_progress() {
        files.failWith = AppError.Network
        val vm = viewModel()
        vm.onAttach("content://photo")

        val state = vm.uiState.value
        assertEquals(AppError.Network, state.error)
        assertFalse(state.attachments.isUploading)
        assertTrue(state.attachments.items.isEmpty())
    }

    @Test
    fun attachments_are_capped_like_the_web_form() {
        val vm = viewModel()
        repeat(AttachmentDraft.DEFAULT_MAX + 2) { vm.onAttach("content://$it") }
        assertEquals(AttachmentDraft.DEFAULT_MAX, vm.uiState.value.attachments.items.size)
    }
}
