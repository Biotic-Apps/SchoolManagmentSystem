package com.schoolapp.core.network.api.staff

import com.schoolapp.core.network.api.Paging
import com.schoolapp.core.network.dto.staff.hrletters.GenerateHrLetterRequest
import com.schoolapp.core.network.dto.staff.hrletters.HrLetterDownloadDto
import com.schoolapp.core.network.dto.staff.hrletters.HrLetterDto
import com.schoolapp.core.network.dto.staff.hrletters.HrLetterTemplateDto
import com.schoolapp.core.network.model.ApiEnvelope
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/** HR letters for one staff member (`staff.view` to read, `staff.edit` to generate). */
interface HrLettersApi {
    @GET("hr-letter-templates")
    suspend fun templates(
        @Query("schoolId") schoolId: String,
        @Query("status") status: String = "ACTIVE",
        @Query("pageSize") pageSize: Int = Paging.MAX_PAGE_SIZE,
    ): ApiEnvelope<List<HrLetterTemplateDto>>

    @GET("staff/{staffId}/hr-letters")
    suspend fun letters(@Path("staffId") staffId: String): ApiEnvelope<List<HrLetterDto>>

    @POST("staff/{staffId}/hr-letters")
    suspend fun generate(@Path("staffId") staffId: String, @Body body: GenerateHrLetterRequest): ApiEnvelope<HrLetterDto>

    @GET("hr-letters/{id}/download")
    suspend fun download(@Path("id") id: String): ApiEnvelope<HrLetterDownloadDto>
}
