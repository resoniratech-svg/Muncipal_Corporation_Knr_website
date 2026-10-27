export type NotificationType = 'Emergency' | 'Initiative' | 'Budget' | 'WardUpdate' | 'Scheme';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  wardId?: number; // optional, if specific to a ward
  timestamp: string;
  channel: ('app' | 'sms' | 'portal')[];
  smsText?: string;
  urgency: 'high' | 'medium' | 'info';
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "NOTIF-01",
    type: "Emergency",
    title: "Emergency Alert: Heavy Rainfall",
    message: "Heavy rainfall alert in your area. Stay safe and avoid low-lying areas.",
    timestamp: "2 minutes ago (Today 10:30 AM)",
    channel: ['app', 'sms', 'portal'],
    smsText: "Municipal Corporation, Karimnagar: Heavy rainfall alert in the next 24 hours. Please stay safe. Avoid waterlogged areas. – MCKNRG",
    urgency: "high",
  },
  {
    id: "NOTIF-02",
    type: "Scheme",
    title: "New Scheme: Property Tax Rebate Scheme 2024-25",
    message: "Applications invited for “Property Tax Rebate Scheme 2024-25”.",
    timestamp: "1 hour ago (Today 09:15 AM)",
    channel: ['app', 'portal'],
    smsText: "Municipal Corporation, Karimnagar: Property Tax Rebate Scheme 2024-25 launched. – MCKNRG",
    urgency: "info",
  },
  {
    id: "NOTIF-03",
    type: "Initiative",
    title: "New Initiative: Smart Drainage Project",
    message: "Smart Drainage Project launched in Ward 12.",
    wardId: 12,
    timestamp: "1 hour ago (Today 08:45 AM)",
    channel: ['app', 'portal'],
    smsText: "Municipal Corporation, Karimnagar: Smart Drainage Project launched in Ward 12. – MCKNRG",
    urgency: "info",
  },
  {
    id: "NOTIF-04",
    type: "Budget",
    title: "Funds Allocated: Road Development",
    message: "₹2.5 Cr allocated for Road Development in Ward 8.",
    wardId: 8,
    timestamp: "3 hours ago",
    channel: ['app', 'portal'],
    urgency: "info",
  },
  {
    id: "NOTIF-05",
    type: "WardUpdate",
    title: "Ward Update: Drainage Work Initiated",
    message: "Drainage work initiated in Ward 12 from 22 May 2024. Thank you for your cooperation.",
    wardId: 12,
    timestamp: "5 hours ago",
    channel: ['app', 'sms', 'portal'],
    smsText: "Municipal Corporation, Karimnagar: Drainage work initiated in Ward 12 from 22 May 2024. Thank you for your cooperation. – MCKNRG",
    urgency: "info",
  },
  {
    id: "NOTIF-06",
    type: "WardUpdate",
    title: "Ward Update: Road Repair Completed",
    message: "Road repair completed in your area. We appreciate your support.",
    wardId: 27,
    timestamp: "Yesterday 06:30 PM",
    channel: ['app', 'sms', 'portal'],
    smsText: "Municipal Corporation, Karimnagar: Road repair completed in your area. We appreciate your support. – MCKNRG",
    urgency: "info",
  },
  {
    id: "NOTIF-07",
    type: "WardUpdate",
    title: "Ward Update: Street Light Maintenance",
    message: "Street light maintenance scheduled in Ward 8.",
    wardId: 8,
    timestamp: "Yesterday 06:45 PM",
    channel: ['app'],
    urgency: "info",
  }
];
