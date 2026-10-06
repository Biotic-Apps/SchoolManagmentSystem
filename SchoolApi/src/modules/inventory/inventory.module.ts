import { Module } from '@nestjs/common';
import { ExpensesModule } from '../expenses/expenses.module';
import { AssetsController } from './assets/assets.controller';
import { AssetsService } from './assets/assets.service';
import { ItemLookup } from './items/item-lookup';
import { ItemsController } from './items/items.controller';
import { ItemsService } from './items/items.service';
import { LowStockProcessor } from './jobs/low-stock.processor';
import { PoBillingService } from './purchasing/po-billing.service';
import { PurchaseOrderingService } from './purchasing/purchase-ordering.service';
import { PurchaseOrdersController } from './purchasing/purchase-orders.controller';
import { PurchaseOrdersService } from './purchasing/purchase-orders.service';
import { PurchaseRequestApprovalHandler } from './purchasing/purchase-request-approval.handler';
import { PurchaseRequestsController } from './purchasing/purchase-requests.controller';
import { PurchaseRequestsService } from './purchasing/purchase-requests.service';
import { PurchasingViews } from './purchasing/purchasing-views';
import { SalesController } from './sales/sales.controller';
import { SalesService } from './sales/sales.service';
import { MovementsService } from './stock/movements.service';
import { StockController } from './stock/stock.controller';
import { StockLedger } from './stock/stock-ledger';
import { StockService } from './stock/stock.service';

/** Phase 4 §E: items, stock movements, assets, purchasing and store sales. */
@Module({
  imports: [ExpensesModule],
  controllers: [
    ItemsController,
    StockController,
    AssetsController,
    PurchaseRequestsController,
    PurchaseOrdersController,
    SalesController,
  ],
  providers: [
    ItemLookup,
    ItemsService,
    StockLedger,
    StockService,
    MovementsService,
    AssetsService,
    PurchasingViews,
    PurchaseRequestsService,
    PurchaseRequestApprovalHandler,
    PurchaseOrderingService,
    PurchaseOrdersService,
    PoBillingService,
    SalesService,
    LowStockProcessor,
  ],
  exports: [StockLedger],
})
export class InventoryModule {}
