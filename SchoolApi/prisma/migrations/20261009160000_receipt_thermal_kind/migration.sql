-- 80 mm thermal receipts are versioned generated documents of their own.
ALTER TYPE "generated_document_kind" ADD VALUE IF NOT EXISTS 'RECEIPT_THERMAL';
