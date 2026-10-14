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
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.inventory.InventoryApi
import com.schoolapp.core.network.api.inventory.PurchasingApi
import com.schoolapp.core.network.dto.inventory.CreateVendorBody
import com.schoolapp.core.network.dto.inventory.ReceiveBody
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultPurchasingRepository @Inject constructor(
    private val api: PurchasingApi,
    private val apiCaller: ApiCaller,
) : PurchasingRepository {

    override suspend fun requests(branchId: String, status: PurchaseRequestStatus?, page: Int): AppResult<InventoryPage<PurchaseRequest>> =
        apiCaller.call {
            api.requests(branchId, status?.name, page).toPage(page, InventoryApi.PAGE_SIZE) { it.toModel() }
        }

    override suspend fun request(id: String): AppResult<PurchaseRequest> =
        apiCaller.call { api.request(id).data.toModel() }

    override suspend fun createRequest(input: PurchaseRequestInput): AppResult<PurchaseRequest> =
        apiCaller.call { api.createRequest(input.toBody()).data.toModel() }

    override suspend fun createOrder(requestId: String, input: PurchaseOrderInput): AppResult<PurchaseOrder> =
        apiCaller.call { api.createOrder(requestId, input.toBody()).data.toModel() }

    override suspend fun order(id: String): AppResult<PurchaseOrder> =
        apiCaller.call { api.order(id).data.toModel() }

    override suspend fun receive(orderId: String, input: ReceiveInput): AppResult<PurchaseOrder> =
        apiCaller.call { api.receive(orderId, ReceiveBody(input.receivedOn, input.lines.toBodies())).data.toModel() }

    override suspend fun bill(orderId: String): AppResult<Unit> =
        apiCaller.call { api.bill(orderId); Unit }

    override suspend fun vendors(branchId: String?): AppResult<List<Vendor>> =
        apiCaller.call { api.vendors(branchId).data.map { it.toModel() }.sortedBy { it.name.lowercase() } }

    override suspend fun createVendor(name: String, schoolId: String?): AppResult<Vendor> =
        apiCaller.call { api.createVendor(CreateVendorBody(name.trim(), schoolId)).data.toModel() }
}
