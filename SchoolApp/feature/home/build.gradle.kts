plugins {
    alias(libs.plugins.schoolapp.android.feature)
}

android {
    namespace = "com.schoolapp.feature.home"
}

dependencies {
    implementation(libs.androidx.compose.material3.adaptive)
}
