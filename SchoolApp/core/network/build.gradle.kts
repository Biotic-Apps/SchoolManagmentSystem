import com.schoolapp.buildlogic.ApiEndpoints
import com.schoolapp.buildlogic.CertificatePins

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
            buildConfigField("String", "CERT_PIN_HOST", "\"\"")
            buildConfigField("String", "CERT_PINS", "\"\"")
        }
        release {
            val pins = CertificatePins.release(providers)
            buildConfigField("String", "API_BASE_URL", "\"${ApiEndpoints.releaseBaseUrl(providers).get()}\"")
            buildConfigField("String", "CERT_PIN_HOST", "\"${pins.host}\"")
            buildConfigField("String", "CERT_PINS", "\"${pins.pins}\"")
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
