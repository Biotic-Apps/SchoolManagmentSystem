import { branchName, str, type ReportQuery } from './report-query';

/** Branch stock per active item (sum of signed movements) vs reorder level. */
export const inventoryStock: ReportQuery = async ({ prisma, params }) => {
  const branchId = str(params, 'branchId');
  const branch = await prisma.branch.findUniqueOrThrow({
    where: { id: branchId },
    select: { schoolId: true },
  });
  const [items, stock] = await Promise.all([
    prisma.inventoryItem.findMany({
      where: { schoolId: branch.schoolId, status: 'ACTIVE' },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    }),
    prisma.stockMovement.groupBy({
      by: ['itemId'],
      where: { branchId },
      _sum: { quantity: true },
    }),
  ]);
  const onHand = new Map(stock.map((s) => [s.itemId, s._sum.quantity ?? 0]));
  return {
    title: `Inventory stock — ${await branchName(prisma, branchId)}`,
    columns: [
      { key: 'sku', header: 'SKU' },
      { key: 'name', header: 'Item' },
      { key: 'category', header: 'Category' },
      { key: 'unit', header: 'Unit' },
      { key: 'inStock', header: 'In stock', kind: 'int' },
      { key: 'reorderLevel', header: 'Reorder level', kind: 'int' },
      { key: 'state', header: 'State' },
    ],
    rows: items.map((item) => {
      const qty = onHand.get(item.id) ?? 0;
      return {
        sku: item.sku,
        name: item.name,
        category: item.category,
        unit: item.unit,
        inStock: qty,
        reorderLevel: item.reorderLevel,
        state: qty <= 0 ? 'OUT' : qty <= item.reorderLevel ? 'LOW' : 'OK',
      };
    }),
  };
};
