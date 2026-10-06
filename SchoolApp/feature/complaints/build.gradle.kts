plugins {
    alias(libs.plugins.schoolapp.android.feature)
}

android {
    namespace = "com.schoolapp.feature.complaints"
}

dependencies {
    implementation(libs.androidx.activity.compose)
}
