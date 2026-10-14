package com.schoolapp.core.network.api.idcards

import com.schoolapp.core.network.dto.idcards.IdCardPrintBodyDto
import com.schoolapp.core.network.dto.idcards.IdCardPrintJobDto
import com.schoolapp.core.network.dto.idcards.StudentIdCardDto
import com.schoolapp.core.network.dto.idcards.StudentIdCardJobDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

/** Student ID cards: `students.view` to read (parents: own children), `students.edit` to generate or bulk print. */
interface StudentIdCardApi {
    @GET("students/{id}/id-card")
    suspend fun status(@Path("id") studentId: String): ApiEnvelope<StudentIdCardDto>

    @POST("students/{id}/id-card")
    suspend fun generate(@Path("id") studentId: String): ApiEnvelope<StudentIdCardJobDto>

    /** A4 sheets, 10 cards each with cut marks. */
    @POST("students/id-cards/print")
    suspend fun print(@Body body: IdCardPrintBodyDto): ApiEnvelope<IdCardPrintJobDto>
}
