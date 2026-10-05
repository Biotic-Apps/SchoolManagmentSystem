plugins {
    alias(libs.plugins.schoolapp.android.library)
    alias(libs.plugins.schoolapp.hilt)
}

android {
    namespace = "com.schoolapp.core.sync"
}

dependencies {
    implementation(projects.core.common)
    implementation(projects.core.database)
    implementation(projects.core.network)
    api(libs.androidx.work.runtime.ktx)
    implementation(libs.androidx.hilt.work)
    ksp(libs.androidx.hilt.compiler)
    implementation(libs.timber)
}
