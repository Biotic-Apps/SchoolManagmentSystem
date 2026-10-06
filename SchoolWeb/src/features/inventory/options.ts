import type { Option } from "@/components/shared/OptionSelect";

export const ITEM_CATEGORY_OPTIONS: Option[] = [
  { id: "FURNITURE", name: "Furniture" },
  { id: "COMPUTER", name: "Computer" },
  { id: "STATIONERY", name: "Stationery" },
  { id: "UNIFORM", name: "Uniform" },
  { id: "BOOK", name: "Book" },
  { id: "SPORTS", name: "Sports" },
  { id: "OTHER", name: "Other" },
];

export const MOVEMENT_TYPE_OPTIONS: Option[] = [
  { id: "IN", name: "Stock in" },
  { id: "ISSUE", name: "Issue" },
  { id: "ADJUST", name: "Adjustment" },
  { id: "TRANSFER_OUT", name: "Transfer out" },
  { id: "TRANSFER_IN", name: "Transfer in" },
];

export const ASSET_CONDITION_OPTIONS: Option[] = [
  { id: "NEW", name: "New" },
  { id: "GOOD", name: "Good" },
  { id: "FAIR", name: "Fair" },
  { id: "POOR", name: "Poor" },
  { id: "DISPOSED", name: "Disposed" },
];

export const PURCHASE_REQUEST_STATUS_OPTIONS: Option[] = [
  { id: "PENDING", name: "Pending approval" },
  { id: "APPROVED", name: "Approved" },
  { id: "REJECTED", name: "Rejected" },
  { id: "ORDERED", name: "Ordered" },
];

function labelFrom(options: Option[], id: string | null | undefined): string {
  if (!id) return "";
  return options.find((option) => option.id === id)?.name ?? id;
}

export const itemCategoryLabel = (id: string | null | undefined) => labelFrom(ITEM_CATEGORY_OPTIONS, id);
export const movementTypeLabel = (id: string | null | undefined) => labelFrom(MOVEMENT_TYPE_OPTIONS, id);
