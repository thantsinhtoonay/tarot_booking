export type UserRole = "customer" | "admin";
export type AuthProvider = "email" | "google";
export type WalletId = "kpay" | "wavepay" | "aya" | "cbpay";
export type BookingStatus = "pending_payment" | "confirmed" | "completed" | "rejected";
export type ReadingTypeId = string;
export type SessionFormatId = "written" | "voice" | "video";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  provider: AuthProvider;
  phone?: string;
  avatarUrl?: string;
  role: UserRole;
  dob?: string;
  tob?: string;
  createdAt: string;
}

export interface ReadingType {
  id: ReadingTypeId;
  title: string;
  description: string;
  price: number;
  isActive?: boolean;
}

export interface SessionFormat {
  id: SessionFormatId;
  title: string;
  priceDelta: number;
  durationMin: number;
}

export interface TimeSlot {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
  isBlocked?: boolean;
}

export type DateRuleStatus = "open" | "closed";

export interface AvailabilitySettings {
  startTime: string;
  endTime: string;
  slotDurationMin: number;
  defaultOpen: boolean;
}

export interface DateRule {
  date: string;
  status: DateRuleStatus;
  note?: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  readingTypeId: ReadingTypeId;
  sessionFormatId: SessionFormatId;
  slotId: string;
  fullName: string;
  dob: string;
  tob: string;
  questions?: string;
  viberNumber: string;
  telegramId?: string;
  facebookLink?: string;
  amount: number;
  wallet?: WalletId;
  merchantAccountSnapshot?: string;
  transactionId?: string;
  receiptUrl?: string;
  status: BookingStatus;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentVerification {
  bookingId: string;
  transactionId?: string;
  receiptUrl?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  decision: "pending" | "approved" | "rejected";
}

export interface DailyTarotMessage {
  id: string;
  date: string;
  cardName?: string;
  cardImage?: string;
  keywords?: string[];
  adviceText: string;
  publishedBy: string;
  updatedAt: string;
}

export interface UploadRecord {
  filename: string;
  userId: string;
  createdAt: string;
}

export interface Profile {
  userId: string;
  bio?: string;
  photoUrl?: string;
  story?: string;
}

export interface Database {
  users: User[];
  readingTypes: ReadingType[];
  sessionFormats: SessionFormat[];
  slots: TimeSlot[];
  availabilitySettings: AvailabilitySettings;
  dateRules: DateRule[];
  bookings: Booking[];
  paymentVerifications: PaymentVerification[];
  uploads: UploadRecord[];
  dailyMessages: DailyTarotMessage[];
  profiles: Profile[];
}
