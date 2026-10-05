plugins {
    alias(libs.plugins.schoolapp.android.library.compose)
}

android {
    namespace = "com.schoolapp.core.designsystem"
}

dependencies {
    api(libs.androidx.compose.material3)
    api(libs.androidx.compose.material.icons.extended)
}
