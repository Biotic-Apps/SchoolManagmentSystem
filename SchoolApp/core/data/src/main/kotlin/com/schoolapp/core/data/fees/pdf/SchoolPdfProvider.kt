package com.schoolapp.core.data.fees.pdf

import androidx.core.content.FileProvider

/** Shares downloaded PDFs (cache/pdfs) with a viewer app; its own class so it never clashes with another FileProvider. */
class SchoolPdfProvider : FileProvider()
