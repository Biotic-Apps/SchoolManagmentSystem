import com.schoolapp.buildlogic.ApiEndpoints
import com.schoolapp.buildlogic.DebugNetworkSecurityConfigTask

plugins {
    alias(libs.plugins.schoolapp.android.application.compose)
    alias(libs.plugins.schoolapp.hilt)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.schoolapp"

    defaultConfig {
        applicationId = "com.schoolapp"
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            optimization {
                enable = true
            }
        }
    }
}

val debugNetworkSecurityConfig = tasks.register<DebugNetworkSecurityConfigTask>("generateDebugNetworkSecurityConfig") {
    val apiHost = ApiEndpoints.debugBaseUrl(providers).map(ApiEndpoints::hostOf)
    cleartextHosts.set(apiHost.map { listOf("10.0.2.2", "localhost", "127.0.0.1", it) })
}

androidComponents {
    onVariants(selector().withBuildType("debug")) { variant ->
        variant.sources.res?.addGeneratedSourceDirectory(
            debugNetworkSecurityConfig,
            DebugNetworkSecurityConfigTask::outputDir,
        )
    }
}

dependencies {
    implementation(projects.core.common)
    implementation(projects.core.model)
    implementation(projects.core.designsystem)
    implementation(projects.core.navigation)
    implementation(projects.core.data)
    implementation(projects.core.sync)
    implementation(projects.feature.auth)
    implementation(projects.feature.home)
    implementation(projects.feature.profile)
    implementation(projects.feature.dashboard)
    implementation(projects.feature.approvals)
    implementation(projects.feature.notifications)
    implementation(projects.feature.organisation)
    implementation(projects.feature.students)
    implementation(projects.feature.timetable)
    implementation(projects.feature.syllabus)
    implementation(projects.feature.admissions)
    implementation(projects.feature.staff)
    implementation(projects.feature.attendance)
    implementation(projects.feature.diary)
    implementation(projects.feature.activities)
    implementation(projects.feature.notices)
    implementation(projects.feature.messages)
    implementation(projects.feature.complaints)
    implementation(projects.feature.meetings)
    implementation(projects.feature.health)
    implementation(projects.feature.pickup)

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.runtime.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.hilt.navigation.compose)
    implementation(libs.androidx.hilt.work)
    ksp(libs.androidx.hilt.compiler)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)
    implementation(libs.timber)

    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(libs.androidx.junit)
    debugImplementation(libs.androidx.compose.ui.test.manifest)
}
