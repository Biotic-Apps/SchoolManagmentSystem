-- Update brand defaults from teal to purple
ALTER TABLE "school_settings" ALTER COLUMN "primary_color" SET DEFAULT '#7B68EE';
ALTER TABLE "school_settings" ALTER COLUMN "accent_soft_color" SET DEFAULT '#EDE9FE';

-- Update all existing schools from teal to purple
UPDATE "school_settings" SET "primary_color" = '#7B68EE' WHERE UPPER("primary_color") = '#0B7F74';
UPDATE "school_settings" SET "accent_soft_color" = '#EDE9FE' WHERE UPPER("accent_soft_color") = '#E6F5F2';
