package com.schoolapp.feature.expenses.vendors

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Call
import androidx.compose.material.icons.outlined.Email
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.expenses.Vendor
import com.schoolapp.feature.expenses.R

/** Vendor with contact person, phone, email, NTN and address; phone opens the dialer. */
@Composable
internal fun VendorCard(
    vendor: Vendor,
    onCall: (String) -> Unit,
    onEmail: (String) -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier = modifier.fillMaxWidth(), verticalSpacing = 4.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                vendor.name,
                style = MaterialTheme.typography.titleMedium,
                color = AppColors.TextPrimary,
                modifier = Modifier.weight(1f),
            )
            vendor.phone?.let { phone ->
                IconButton(onClick = { onCall(phone) }) {
                    Icon(Icons.Outlined.Call, contentDescription = stringResource(R.string.expenses_call_vendor, vendor.name), tint = AppColors.Primary)
                }
            }
            vendor.email?.let { email ->
                IconButton(onClick = { onEmail(email) }) {
                    Icon(Icons.Outlined.Email, contentDescription = stringResource(R.string.expenses_email_vendor, vendor.name), tint = AppColors.Primary)
                }
            }
        }
        Detail(R.string.expenses_vendor_contact, vendor.contactPerson)
        Detail(R.string.expenses_vendor_phone, vendor.phone)
        Detail(R.string.expenses_vendor_email, vendor.email)
        Detail(R.string.expenses_vendor_ntn, vendor.ntn)
        Detail(R.string.expenses_vendor_address, vendor.address)
    }
}

@Composable
private fun Detail(label: Int, value: String?) {
    if (value.isNullOrBlank()) return
    Text(
        stringResource(R.string.expenses_label_value, stringResource(label), value),
        style = MaterialTheme.typography.bodySmall,
        color = AppColors.TextSecondary,
    )
}
