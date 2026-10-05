package com.schoolapp.demo

import androidx.compose.runtime.Composable
import com.schoolapp.ui.LoginFooterContent
import javax.inject.Inject

class DemoLoginFooter @Inject constructor() : LoginFooterContent {
    @Composable
    override fun Content() = DemoRolePicker()
}
