plugins {
    alias(libs.plugins.schoolapp.android.library.compose)
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.schoolapp.core.navigation"
}

dependencies {
    api(projects.core.model)
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.kotlinx.serialization.json)
}
