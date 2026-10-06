package com.schoolapp.feature.certificates

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.certificates.parent.ParentCertificatesRoute
import com.schoolapp.feature.certificates.review.CertificateReviewRoute

/** Menu `certificates`: parents see the active child's requests; principal/office review requests. */
@Composable
@Suppress("UnusedParameter")
fun CertificatesMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    val key = "certificates_${role.key}"
    when (role) {
        RoleKey.PARENT -> ParentCertificatesRoute(modifier, viewModel = hiltViewModel(key = key))
        else -> CertificateReviewRoute(modifier, hiltViewModel(key = key))
    }
}
