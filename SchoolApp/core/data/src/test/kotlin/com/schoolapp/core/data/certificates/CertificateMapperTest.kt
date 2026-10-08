package com.schoolapp.core.data.certificates

import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.dto.certificates.CertificateDto
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class CertificateMapperTest {

    @Test
    fun issued_certificate_reads_serial_no_and_requested_at_from_live_api() {
        // Captured from GET /certificates (principal, demo school).
        val certificate = NetworkJson.decodeFromString(
            CertificateDto.serializer(),
            """{"id":"01a110a4-95c7-74e8-9907-8cd4e321fa0e","branchId":"b1","serialNo":"CERT-CHARACTER-2026-0001","type":"CHARACTER",
               "status":"ISSUED","student":{"id":"s1","name":"Ayesha Khan","admissionNo":"BRIGHT-2026-0031","className":"Class 5","sectionName":"B"},
               "purpose":"Scholarship application","details":null,"requestedBy":{"id":"u1","name":"Demo Accountant"},
               "requestedAt":"2026-10-06T09:56:24.135Z","approvedBy":{"id":"u2","name":"Demo Principal"},"issuedAt":"2026-10-02",
               "effectiveDate":null,"isDuplicate":false,"duplicateOfId":null,"reissueReason":null,"rejectionReason":null,"fileUrl":null}""",
        ).toModel()
        assertEquals("CERT-CHARACTER-2026-0001", certificate.serial)
        assertEquals("2026-10-06T09:56:24.135Z", certificate.createdAt)
        assertEquals("2026-10-02", certificate.issuedOn)
        assertEquals(CertificateStatus.ISSUED, certificate.status)
        assertFalse(certificate.duplicate)
        assertNull(certificate.reason)
    }

    @Test
    fun rejected_duplicate_reads_rejection_reason_and_is_duplicate() {
        val certificate = NetworkJson.decodeFromString(
            CertificateDto.serializer(),
            """{"id":"c2","serialNo":null,"type":"SCHOOL_LEAVING","status":"REJECTED","student":{"id":"s2","name":"Hamza"},
               "requestedAt":"2026-10-06T09:56:24.139Z","isDuplicate":true,"rejectionReason":"Dues outstanding"}""",
        ).toModel()
        assertEquals("Dues outstanding", certificate.reason)
        assertTrue(certificate.duplicate)
        assertNull(certificate.serial)
    }
}
