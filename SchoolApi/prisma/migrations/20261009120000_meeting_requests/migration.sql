-- Parents can ask a teacher for a meeting when no slot is open; staff then
-- accept (SCHEDULED, with the final time) or decline (CANCELLED).
ALTER TYPE "meeting_status" ADD VALUE IF NOT EXISTS 'REQUESTED' BEFORE 'SCHEDULED';
