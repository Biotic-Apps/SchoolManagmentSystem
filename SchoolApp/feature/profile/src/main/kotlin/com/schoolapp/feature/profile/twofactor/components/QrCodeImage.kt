package com.schoolapp.feature.profile.twofactor.components

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.FilterQuality
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.qrcode.QRCodeWriter
import com.google.zxing.qrcode.decoder.ErrorCorrectionLevel
import com.schoolapp.core.designsystem.theme.AppColors
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** QR code for [content]; drawn black on white with a quiet zone so scanners read it in any theme. */
@Composable
internal fun QrCodeImage(
    content: String,
    contentDescription: String,
    modifier: Modifier = Modifier,
    size: Dp = 200.dp,
) {
    val bitmap by produceState<ImageBitmap?>(null, content) {
        value = runCatching { renderQr(content) }.getOrNull()
    }
    Box(
        modifier = modifier
            .size(size)
            .border(1.dp, AppColors.Border, MaterialTheme.shapes.medium)
            .padding(4.dp),
        contentAlignment = Alignment.Center,
    ) {
        val image = bitmap
        if (image == null) {
            CircularProgressIndicator(color = AppColors.Primary)
        } else {
            Image(
                bitmap = image,
                contentDescription = contentDescription,
                filterQuality = FilterQuality.None,
                modifier = Modifier.size(size - 8.dp),
            )
        }
    }
}

private const val QR_PIXELS = 512
private const val QUIET_ZONE_MODULES = 4

// Scanners need dark modules on a light background regardless of the app theme, so these are fixed pixels.
private const val DARK = android.graphics.Color.BLACK
private const val LIGHT = android.graphics.Color.WHITE

private suspend fun renderQr(content: String): ImageBitmap = withContext(Dispatchers.Default) {
    val hints = mapOf(
        EncodeHintType.MARGIN to QUIET_ZONE_MODULES,
        EncodeHintType.ERROR_CORRECTION to ErrorCorrectionLevel.M,
    )
    val matrix = QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, QR_PIXELS, QR_PIXELS, hints)
    val width = matrix.width
    val height = matrix.height
    val pixels = IntArray(width * height) { i -> if (matrix.get(i % width, i / width)) DARK else LIGHT }
    Bitmap.createBitmap(pixels, width, height, Bitmap.Config.ARGB_8888).asImageBitmap()
}
