package com.schoolapp.feature.attendance.qr

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.ui.platform.LocalContext
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning

/**
 * Google code scanner (Play services): opens its own camera screen, so the app needs no camera permission.
 * Returns a launcher; [onCode] gets the raw QR text, [onFailure] fires when the scanner cannot start.
 * Backing out of the scanner does nothing.
 */
@Composable
internal fun rememberQrScanner(onCode: (String?) -> Unit, onFailure: () -> Unit): () -> Unit {
    val context = LocalContext.current
    val currentOnCode by rememberUpdatedState(onCode)
    val currentOnFailure by rememberUpdatedState(onFailure)
    return remember(context) {
        {
            client(context).startScan()
                .addOnSuccessListener { barcode -> currentOnCode(barcode.rawValue) }
                .addOnFailureListener { currentOnFailure() }
            Unit
        }
    }
}

private fun client(context: Context) = GmsBarcodeScanning.getClient(
    context,
    GmsBarcodeScannerOptions.Builder()
        .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
        .enableAutoZoom()
        .build(),
)
