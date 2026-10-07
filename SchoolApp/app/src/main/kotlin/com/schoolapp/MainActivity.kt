package com.schoolapp

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.runtime.getValue
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.applock.AppLockGate
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.navigation.AppNavHost
import com.schoolapp.navigation.AppShellContent
import com.schoolapp.startup.SplashGate
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : FragmentActivity() {

    private val viewModel: AppViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen().setKeepOnScreenCondition { SplashGate.keepOnScreen(viewModel.uiState.value) }
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        setContent {
            val state by viewModel.uiState.collectAsStateWithLifecycle()
            SchoolTheme {
                AppLockGate(onSignOut = viewModel::onSignOut) {
                    AppNavHost(
                        uiState = state,
                        shellContent = AppShellContent,
                        onSignOut = viewModel::onSignOut,
                    )
                }
            }
        }
    }

    override fun onStart() {
        super.onStart()
        viewModel.onForeground()
    }
}
