package com.schoolapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.navigation.AppNavHost
import com.schoolapp.navigation.AppShellContent
import com.schoolapp.ui.LoginFooterContent
import dagger.hilt.android.AndroidEntryPoint
import java.util.Optional
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var loginFooter: Optional<LoginFooterContent>

    private val viewModel: AppViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)
        val footer = loginFooter.orElse(null)
        setContent {
            val state by viewModel.uiState.collectAsStateWithLifecycle()
            SchoolTheme {
                AppNavHost(
                    uiState = state,
                    shellContent = AppShellContent,
                    onSignOut = viewModel::onSignOut,
                    loginFooter = { footer?.Content() },
                )
            }
        }
    }

    override fun onStart() {
        super.onStart()
        viewModel.onForeground()
    }
}
