plugins {
    alias(libs.plugins.schoolapp.android.library.compose)
}

android {
    namespace = "com.schoolapp.core.ui"
}

dependencies {
    api(projects.core.common)
    api(projects.core.model)
    implementation(projects.core.designsystem)
}
