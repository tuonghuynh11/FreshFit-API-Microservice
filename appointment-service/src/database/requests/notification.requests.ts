export enum NotificationType {
  Challenge = "Challenge",
  Eating = "Eating",
  Workout = "Workout",
  Water = "Water",
  Admin = "Admin",
  Health = "Health",
  Other = "Other",
}
export interface CreateNotificationReqBody {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  action?: string; // Action to be performed when the notification is clicked
}
