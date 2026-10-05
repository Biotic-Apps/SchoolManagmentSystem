plugins {
    alias(libs.plugins.schoolapp.android.library)
    alias(libs.plugins.schoolapp.hilt)
}

android {
    namespace = "com.schoolapp.core.datastore"
}

dependencies {
    implementation(projects.core.common)
    api(projects.core.model)
    implementation(libs.androidx.datastore.preferences)
    implementation(libs.timber)
}
