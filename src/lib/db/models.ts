import type { Collection, ObjectId } from "mongodb";
import type { MembershipApplication, MembershipSelection } from "@/types/membership";
import type { ListingInput } from "@/types/listing";

export interface ListingRecord extends ListingInput {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ApplicationStatus = "submitted" | "approved" | "rejected";
export type UserStatus = "invited" | "active" | "disabled";

export interface StoredDocument {
  kind: string;
  fileId: ObjectId;
  name: string;
  size: number;
  type: string;
}

export interface ApplicationRecord {
  _id?: ObjectId;
  reference: string;
  status: ApplicationStatus;
  applicant: { name: string; email: string; company: string; country: string };
  membership: MembershipSelection;
  /** Everything the applicant entered except documents, declarations and plan, which are stored separately. */
  details: Omit<MembershipApplication, "documents" | "consent" | "membership">;
  consent: MembershipApplication["consent"] & { acceptedAt: Date };
  documents: StoredDocument[];
  userId?: ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRecord {
  _id?: ObjectId;
  email: string;
  name: string;
  company: string;
  role: "member" | "admin";
  status: UserStatus;
  passwordHash?: string;
  applicationId?: ObjectId;
  failedLogins: number;
  lockedUntil?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionRecord {
  _id?: ObjectId;
  tokenHash: string;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
  userAgent?: string;
}

export interface PasswordTokenRecord {
  _id?: ObjectId;
  tokenHash: string;
  userId: ObjectId;
  purpose: "setup" | "reset";
  createdAt: Date;
  expiresAt: Date;
  usedAt?: Date;
}

export interface ContactEnquiryRecord {
  _id?: ObjectId;
  name: string;
  email: string;
  company?: string;
  country: string;
  topic: string;
  message: string;
  status: "new" | "handled";
  createdAt: Date;
}

export interface NewsletterSubscriberRecord {
  _id?: ObjectId;
  email: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Collections {
  listings: Collection<ListingRecord>;
  users: Collection<UserRecord>;
  sessions: Collection<SessionRecord>;
  passwordTokens: Collection<PasswordTokenRecord>;
  applications: Collection<ApplicationRecord>;
  contactEnquiries: Collection<ContactEnquiryRecord>;
  newsletterSubscribers: Collection<NewsletterSubscriberRecord>;
}
