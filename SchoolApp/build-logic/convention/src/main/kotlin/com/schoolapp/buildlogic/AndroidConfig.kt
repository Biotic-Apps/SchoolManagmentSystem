package com.schoolapp.buildlogic

import com.android.build.api.dsl.CommonExtension
import org.gradle.api.JavaVersion
import org.gradle.api.Project

internal object AppSdk {
    const val COMPILE = 37
    const val TARGET = 37
    const val MIN = 24
    val JAVA = JavaVersion.VERSION_17
}

internal fun Project.configureAndroidCommon(extension: CommonExtension) {
    extension.apply {
        compileSdk = AppSdk.COMPILE
        defaultConfig.minSdk = AppSdk.MIN
        compileOptions.sourceCompatibility = AppSdk.JAVA
        compileOptions.targetCompatibility = AppSdk.JAVA
        // java.time on minSdk 24 (shared 12-hour time formatting).
        compileOptions.isCoreLibraryDesugaringEnabled = true
    }
    dependencies.add("coreLibraryDesugaring", libs.lib("desugar-jdk-libs"))
    configureKotlinCompiler()
    testImplementation("junit")
    testImplementation("kotlinx-coroutines-test")
    testImplementation("turbine")
}

internal fun Project.configureCompose(extension: CommonExtension) {
    pluginManager.apply("org.jetbrains.kotlin.plugin.compose")
    extension.buildFeatures.compose = true
    val bom = libs.lib("androidx-compose-bom")
    dependencies.apply {
        add("implementation", platform(bom))
        add("androidTestImplementation", platform(bom))
        add("implementation", libs.lib("androidx-compose-ui"))
        add("implementation", libs.lib("androidx-compose-ui-graphics"))
        add("implementation", libs.lib("androidx-compose-foundation"))
        add("implementation", libs.lib("androidx-compose-material3"))
        add("implementation", libs.lib("androidx-compose-ui-tooling-preview"))
        add("debugImplementation", libs.lib("androidx-compose-ui-tooling"))
    }
}
