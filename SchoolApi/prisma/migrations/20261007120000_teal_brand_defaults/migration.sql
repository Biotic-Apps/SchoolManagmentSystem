-- New light teal brand: column defaults, and schools still on the old burgundy defaults move to teal.
ALTER TABLE "school_settings" ALTER COLUMN "primary_color" SET DEFAULT '#0B7F74';
ALTER TABLE "school_settings" ALTER COLUMN "accent_soft_color" SET DEFAULT '#E6F5F2';

UPDATE "school_settings" SET "primary_color" = '#0B7F74' WHERE UPPER("primary_color") = '#7A2944';
UPDATE "school_settings" SET "accent_soft_color" = '#E6F5F2' WHERE UPPER("accent_soft_color") = '#F6EAF0';
