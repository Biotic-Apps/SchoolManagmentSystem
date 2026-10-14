package com.schoolapp.core.data.inventory

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.inventory.InventoryPage
import com.schoolapp.core.model.inventory.PurchaseOrder
import com.schoolapp.core.model.inventory.PurchaseOrderInput
import com.schoolapp.core.model.inventory.PurchaseRequest
import com.schoolapp.core.model.inventory.PurchaseRequestInput
import com.schoolapp.core.model.inventory.PurchaseRequestStatus
import com.schoolapp.core.model.inventory.ReceiveInput
import com.schoolapp.core.model.inventory.Vendor

/** Purchase request → approval (in Approvals) → purchase order → goods receipt → vendor bill. */
interface PurchasingRepository {
    suspend fun requests(branchId: String, status: PurchaseRequestStatus?, page: Int): AppResult<InventoryPage<PurchaseRequest>>

    suspend fun request(id: String): AppResult<PurchaseRequest>

    suspend fun createRequest(input: PurchaseRequestInput): AppResult<PurchaseRequest>

    suspend fun createOrder(requestId: String, input: PurchaseOrderInput): AppResult<PurchaseOrder>

    suspend fun order(id: String): AppResult<PurchaseOrder>

    suspend fun receive(orderId: String, input: ReceiveInput): AppResult<PurchaseOrder>

    /** Creates the vendor bill (an expense paid from Expenses & Vendors). */
    suspend fun bill(orderId: String): AppResult<Unit>

    suspend fun vendors(branchId: String?): AppResult<List<Vendor>>

    suspend fun createVendor(name: String, schoolId: String?): AppResult<Vendor>
}
