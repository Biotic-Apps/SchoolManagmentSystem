package com.schoolapp.feature.students

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.people.GuardianRelation
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.feature.students.link.LinkChildViewModel
import com.schoolapp.feature.students.link.LinkFieldError
import com.schoolapp.feature.students.link.LinkStep
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class LinkChildViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeGuardiansRepository()
    private val vm = LinkChildViewModel(repository, AppClock { LocalDateTime.of(2026, 10, 5, 9, 0) })

    @Test
    fun empty_details_report_every_missing_field_and_send_nothing() {
        vm.sendCode()
        assertEquals(
            setOf(LinkFieldError.ADMISSION_REQUIRED, LinkFieldError.DOB_REQUIRED, LinkFieldError.RELATION_REQUIRED),
            vm.uiState.value.errors,
        )
        assertTrue(repository.starts.isEmpty())
    }

    @Test
    fun future_date_of_birth_is_rejected() {
        vm.onAdmissionNoChange("BS-2026-0010")
        vm.onDobChange("2026-10-06")
        vm.onRelationChange(GuardianRelation.FATHER)
        vm.sendCode()
        assertEquals(setOf(LinkFieldError.DOB_IN_FUTURE), vm.uiState.value.errors)
    }

    @Test
    fun valid_details_send_otp_then_code_is_verified() {
        vm.onAdmissionNoChange(" BS-2026-0010 ")
        vm.onDobChange("2016-03-14")
        vm.onRelationChange(GuardianRelation.MOTHER)
        vm.sendCode()
        val codeStep = vm.uiState.value
        assertEquals(LinkStep.CODE, codeStep.step)
        assertEquals("0300*****12", codeStep.maskedPhone)
        assertEquals(Triple(" BS-2026-0010 ", "2016-03-14", GuardianRelation.MOTHER), repository.starts.single())

        vm.onCodeChange("12a3")
        assertEquals("123", vm.uiState.value.code)
        vm.verify()
        assertEquals(setOf(LinkFieldError.CODE_INVALID), vm.uiState.value.errors)
        assertTrue(repository.confirms.isEmpty())

        vm.onCodeChange("123456")
        vm.verify()
        assertEquals(LinkStep.DONE, vm.uiState.value.step)
        assertEquals("req-1" to "123456", repository.confirms.single())
    }

    @Test
    fun wrong_code_stays_on_code_step_with_error() {
        repository.confirmError = AppError.Validation("Code expired")
        vm.onAdmissionNoChange("BS-1")
        vm.onDobChange("2016-03-14")
        vm.onRelationChange(GuardianRelation.FATHER)
        vm.sendCode()
        vm.onCodeChange("654321")
        vm.verify()
        assertEquals(LinkStep.CODE, vm.uiState.value.step)
        assertEquals(AppError.Validation("Code expired"), vm.uiState.value.submitError)
        vm.backToDetails()
        assertEquals(LinkStep.DETAILS, vm.uiState.value.step)
        assertEquals("BS-1", vm.uiState.value.admissionNo)
    }
}
