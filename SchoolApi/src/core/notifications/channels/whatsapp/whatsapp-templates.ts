/** Named WhatsApp message templates for common school notifications. */
export type WhatsAppTemplateName =
  | 'fee_due_reminder'
  | 'attendance_absent'
  | 'exam_result_published'
  | 'general_notice';

export interface WhatsAppTemplateData {
  studentName?: string;
  amount?: string;
  dueDate?: string;
  date?: string;
  examName?: string;
  schoolName?: string;
  [key: string]: string | undefined;
}

const TEMPLATES: Record<
  WhatsAppTemplateName,
  (data: WhatsAppTemplateData) => string
> = {
  fee_due_reminder: (d) =>
    `Fee Reminder: ${d.studentName ?? 'Your child'} has a fee of ${d.amount ?? 'an outstanding amount'} due by ${d.dueDate ?? 'the due date'}. Please pay on time to avoid late charges. - ${d.schoolName ?? 'School'}`,

  attendance_absent: (d) =>
    `Attendance Alert: ${d.studentName ?? 'Your child'} was marked absent on ${d.date ?? 'today'}. If this is incorrect, please contact the school. - ${d.schoolName ?? 'School'}`,

  exam_result_published: (d) =>
    `Results Published: ${d.examName ?? 'Exam'} results for ${d.studentName ?? 'your child'} are now available. Log in to the parent portal to view the report card. - ${d.schoolName ?? 'School'}`,

  general_notice: (d) =>
    `School Notice: ${d.schoolName ?? 'School'} has posted a new notice. Please check the parent portal for details.`,
};

/** Render a named template with the given data, or fall back to the raw message. */
export function renderWhatsAppTemplate(
  templateName: string,
  data: WhatsAppTemplateData,
): string {
  const fn = TEMPLATES[templateName as WhatsAppTemplateName];
  return fn ? fn(data) : `${templateName}: ${JSON.stringify(data)}`;
}

/** Check whether a template name is a known WhatsApp template. */
export function isKnownTemplate(name: string): name is WhatsAppTemplateName {
  return name in TEMPLATES;
}
