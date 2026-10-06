package com.schoolapp.feature.certificates

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import androidx.navigation.compose.composable
import com.schoolapp.core.navigation.CertificatesDestination
import com.schoolapp.feature.certificates.parent.ParentCertificatesRoute

fun NavGraphBuilder.certificatesDestinations(navController: NavHostController) {
    composable<CertificatesDestination> { ParentCertificatesRoute(onBack = navController::popBackStack) }
}
