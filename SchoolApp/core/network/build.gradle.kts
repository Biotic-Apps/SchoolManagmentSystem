import com.schoolapp.buildlogic.ApiEndpoints

plugins {
    alias(libs.plugins.schoolapp.android.library)
    alias(libs.plugins.schoolapp.hilt)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.schoolapp.core.network"
    buildFeatures.buildConfig = true
    buildTypes {
        debug {
            buildConfigField("String", "API_BASE_URL", "\"${ApiEndpoints.debugBaseUrl(providers).get()}\"")
        }
        release {
            buildConfigField("String", "API_BASE_URL", "\"${ApiEndpoints.releaseBaseUrl(providers).get()}\"")
        }
    }
}

dependencies {
    implementation(projects.core.common)
    implementation(projects.core.datastore)
    api(projects.core.model)
    api(libs.retrofit)
    api(libs.okhttp)
    api(libs.kotlinx.serialization.json)
    implementation(libs.retrofit.kotlinx.serialization)
    implementation(libs.okhttp.logging)
    implementation(libs.timber)
    testImplementation(libs.okhttp.mockwebserver)
}
