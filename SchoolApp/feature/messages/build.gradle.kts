plugins {
    alias(libs.plugins.schoolapp.android.feature)
}

android {
    namespace = "com.schoolapp.feature.messages"
}

dependencies {
    implementation(libs.androidx.activity.compose)
}
