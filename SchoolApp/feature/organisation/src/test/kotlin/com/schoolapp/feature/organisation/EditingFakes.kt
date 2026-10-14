package com.schoolapp.feature.organisation

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationEditRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.organisation.branches.edit.BranchEditor
import com.schoolapp.feature.organisation.scope.BranchOptionsLoader
import com.schoolapp.feature.organisation.sessions.SessionsCalendarViewModel
import com.schoolapp.feature.organisation.sessions.edit.SessionEditor
import com.schoolapp.feature.organisation.sessions.events.EventEditor
import com.schoolapp.feature.organisation.sessions.terms.TermsEditor
import java.lang.reflect.Proxy

/** Every edit call succeeds with Unit (or an empty list) and is recorded by method name. */
class RecordingEditRepository {
    val calls = mutableListOf<String>()

    val repository: OrganisationEditRepository = Proxy.newProxyInstance(
        OrganisationEditRepository::class.java.classLoader,
        arrayOf(OrganisationEditRepository::class.java),
    ) { _, method, _ ->
        calls += method.name
        when (method.name) {
            "terms", "principalOptions", "schoolOptions" -> AppResult.Success(emptyList<Any>())
            else -> AppResult.Success(Unit)
        }
    } as OrganisationEditRepository
}

private val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "branches.view", "branches.edit", "sessions.view", "sessions.edit"))

fun branchEditor(edit: OrganisationEditRepository = RecordingEditRepository().repository, auth: FakeAuthRepository = principal) =
    BranchEditor(edit, auth)

fun sessionsViewModel(
    loader: BranchOptionsLoader,
    repository: FakeOrganisationRepository,
    edit: OrganisationEditRepository = RecordingEditRepository().repository,
    auth: FakeAuthRepository = principal,
) = SessionsCalendarViewModel(loader, repository, SavedStateHandle(), auth, SessionEditor(edit), TermsEditor(edit), EventEditor(edit))
