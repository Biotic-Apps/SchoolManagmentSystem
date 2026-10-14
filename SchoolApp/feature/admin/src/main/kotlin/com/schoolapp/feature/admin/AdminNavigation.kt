package com.schoolapp.feature.admin

import androidx.navigation.NavGraphBuilder
import androidx.navigation.NavHostController
import com.schoolapp.feature.admin.roles.rolesDestinations
import com.schoolapp.feature.admin.schools.schoolsDestinations
import com.schoolapp.feature.admin.schools.setup.schoolSetupDestination
import com.schoolapp.feature.admin.users.usersDestinations

/** Detail screens opened from the admin menu screen(s). */
fun NavGraphBuilder.adminDestinations(navController: NavHostController) {
    rolesDestinations(navController)
    schoolsDestinations(navController)
    schoolSetupDestination(navController)
    usersDestinations(navController)
}
