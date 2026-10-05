package com.schoolapp.buildlogic

import org.gradle.api.Plugin
import org.gradle.api.Project

class AndroidFeatureConventionPlugin : Plugin<Project> {
    override fun apply(target: Project) = with(target) {
        pluginManager.apply("schoolapp.android.library.compose")
        pluginManager.apply("schoolapp.hilt")
        pluginManager.apply("org.jetbrains.kotlin.plugin.serialization")

        listOf(":core:common", ":core:model", ":core:designsystem", ":core:ui", ":core:navigation", ":core:data")
            .forEach { dependencies.add("implementation", project(it)) }
        dependencies.add("testImplementation", project(":core:testing"))

        listOf(
            "androidx-lifecycle-runtime-compose",
            "androidx-lifecycle-viewmodel-compose",
            "androidx-navigation-compose",
            "androidx-hilt-navigation-compose",
            "androidx-compose-material-icons-extended",
            "kotlinx-serialization-json",
        ).forEach(::implementation)
    }
}
