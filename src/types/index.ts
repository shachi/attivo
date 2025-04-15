// src/types/index.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetType {
  id: string;
  name: string;
  description?: string;
  defaultDepreciationPeriod?: number;
  requiredFields?: string;
  optionalFields?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Asset {
  id: string;
  name: string;
  description?: string;
  serialNumber?: string;
  assetTypeId: string;
  assetType: AssetType;
  purchaseDate: Date;
  purchasePrice?: number;
  currency: string;
  purchasedById: string;
  purchasedBy: User;
  currentUserId: string;
  currentUser: User;
  status: string;
  location?: string;
  notes?: string;
  warrantyExpiryDate?: Date;
  depreciationPeriod?: number;
  renewalDate?: Date;
  licenseKey?: string;
  tags?: string;
  createdAt: Date;
  updatedAt: Date;
  documents?: Document[];
  daysUntilExpiry?: number;
}

export interface Document {
  id: string;
  assetId: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  uploadedById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationRule {
  id: string;
  assetType: string;
  eventType: string;
  daysInAdvance: number;
  notifyUsers: string;
  emailEnabled: boolean;
  appEnabled: boolean;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  notifyUserIds?: string[]; // 編集中の一時フィールド
}

export interface AssetTypeOption {
  value: string;
  label: string;
}

export interface EventTypeOption {
  value: string;
  label: string;
}
