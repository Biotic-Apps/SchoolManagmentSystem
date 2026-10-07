package com.schoolapp.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.auth.branding.LoginBrandUiState
import com.schoolapp.feature.auth.components.LoginBrandPanel
import com.schoolapp.feature.auth.components.LoginForm
import com.schoolapp.feature.auth.components.LoginHeader
import com.schoolapp.feature.auth.components.TwoFactorForm
import com.schoolapp.feature.auth.phone.PhoneSignInActions
import com.schoolapp.feature.auth.phone.PhoneSignInUiState
import com.schoolapp.feature.auth.phone.components.PhoneSignInForm

private val TwoPaneMinWidth = 840.dp

@Composable
fun LoginScreen(
    state: LoginUiState,
    brand: LoginBrandUiState,
    actions: LoginActions,
    modifier: Modifier = Modifier,
    phone: PhoneSignInUiState = PhoneSignInUiState(),
    phoneActions: PhoneSignInActions = PhoneSignInActions(),
) {
    AppScaffold(modifier = modifier, contentWindowInsets = WindowInsets(0)) { padding ->
        BoxWithConstraints(
            Modifier
                .fillMaxSize()
                .padding(padding)
                .windowInsetsPadding(WindowInsets.safeDrawing)
                .imePadding(),
        ) {
            val twoPane = maxWidth >= TwoPaneMinWidth
            val formColumn: @Composable (Modifier) -> Unit = { columnModifier ->
                Box(columnModifier.verticalScroll(rememberScrollState()), contentAlignment = Alignment.Center) {
                    Column(
                        modifier = Modifier.widthIn(max = 440.dp).fillMaxWidth().padding(24.dp),
                        verticalArrangement = Arrangement.spacedBy(24.dp),
                    ) {
                        if (!twoPane) LoginHeader(brand)
                        when {
                            state.step == LoginStep.TWO_FACTOR -> TwoFactorForm(state, actions)
                            phone.active -> PhoneSignInForm(phone, phoneActions)
                            else -> LoginForm(state, actions)
                        }
                    }
                }
            }
            if (twoPane) {
                Row(Modifier.fillMaxSize()) {
                    LoginBrandPanel(brand, Modifier.weight(1f).fillMaxHeight())
                    formColumn(Modifier.weight(1f).fillMaxHeight())
                }
            } else {
                formColumn(Modifier.fillMaxSize())
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
private fun LoginScreenPreview() = SchoolTheme {
    LoginScreen(LoginUiState(identifier = "teacher@school.pk"), LoginBrandUiState(), LoginActions())
}

@Preview(showBackground = true)
@Composable
private fun LoginScreenTwoFactorPreview() = SchoolTheme {
    LoginScreen(
        LoginUiState(step = LoginStep.TWO_FACTOR, failure = LoginFailure.INVALID_CODE),
        LoginBrandUiState(name = "Green Valley School"),
        LoginActions(),
    )
}

@Preview(showBackground = true)
@Composable
private fun LoginScreenPhonePreview() = SchoolTheme {
    LoginScreen(
        LoginUiState(),
        LoginBrandUiState(),
        LoginActions(),
        phone = PhoneSignInUiState(active = true, phone = "0300 1234567"),
    )
}

@Preview(showBackground = true, widthDp = 1024, heightDp = 640)
@Composable
private fun LoginScreenExpandedPreview() = SchoolTheme {
    LoginScreen(LoginUiState(failure = LoginFailure.INVALID_CREDENTIALS), LoginBrandUiState(), LoginActions())
}
