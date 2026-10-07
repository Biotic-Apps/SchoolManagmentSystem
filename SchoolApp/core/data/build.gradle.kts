plugins {
    alias(libs.plugins.schoolapp.android.library)
    alias(libs.plugins.schoolapp.hilt)
}

android {
    namespace = "com.schoolapp.core.data"
}

dependencies {
    api(projects.core.common)
    api(projects.core.model)
    implementation(projects.core.network)
    implementation(projects.core.datastore)
    implementation(projects.core.database)
    implementation(projects.core.sync)
    implementation(libs.timber)
    implementation(libs.androidx.biometric)

    testImplementation(projects.core.testing)
}
