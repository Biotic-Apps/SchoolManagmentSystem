plugins {
    alias(libs.plugins.schoolapp.android.library)
    alias(libs.plugins.schoolapp.hilt)
    alias(libs.plugins.schoolapp.android.room)
}

android {
    namespace = "com.schoolapp.core.database"
}

dependencies {
    implementation(projects.core.common)
}
