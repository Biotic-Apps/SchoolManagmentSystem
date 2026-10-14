package com.schoolapp.core.model.inventory

enum class ItemCategory { FURNITURE, COMPUTER, STATIONERY, UNIFORM, BOOK, SPORTS, OTHER }

/** Stock movement kinds; only ADJUST may carry a negative quantity. */
enum class MovementType { IN, ISSUE, ADJUST, TRANSFER_OUT, TRANSFER_IN }

enum class AssetCondition { NEW, GOOD, FAIR, POOR, DISPOSED }

/** PENDING (awaiting approval in Approvals) → APPROVED | REJECTED → ORDERED once a purchase order exists. */
enum class PurchaseRequestStatus { PENDING, APPROVED, REJECTED, ORDERED, UNKNOWN }

enum class PurchaseOrderStatus { ORDERED, PARTIALLY_RECEIVED, RECEIVED, BILLED, UNKNOWN }
