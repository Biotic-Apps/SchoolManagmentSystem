export class NotificationDto {
  id!: string;
  category!: string;
  title!: string;
  body!: string;
  data!: unknown;
  readAt!: string | null;
  createdAt!: string;
}
