import type { AssetType, DocCategory, RecordKind } from "./categories";

export type Member = {
  id: string;
  household_id: string;
  full_name: string;
  birth_date: string | null;
  relation: string | null;
  photo_url: string | null;
  created_at: string;
};

export type Asset = {
  id: string;
  household_id: string;
  type: AssetType;
  title: string;
  details: string | null;
  created_at: string;
};

export type CustomCategory = {
  id: string;
  household_id: string;
  label: string;
  emoji: string | null;
  created_at: string;
};

export type DocumentRow = {
  id: string;
  household_id: string;
  member_id: string | null;
  asset_id: string | null;
  category: DocCategory;
  custom_category_id: string | null;
  subtype: string | null;
  title: string;
  issuer: string | null;
  doc_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
  notes: string | null;
  tags: string[];
  status: "active" | "archived";
  current_version_id: string | null;
  holder_name: string | null;
  created_at: string;
};

export type DocumentFile = {
  id: string;
  document_id: string;
  household_id: string;
  storage_path: string;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  created_at: string;
};

export type DocumentVersion = {
  id: string;
  document_id: string;
  household_id: string;
  storage_path: string;
  file_hash: string;
  mime: string;
  size_bytes: number;
  note: string | null;
  uploaded_by: string | null;
  created_at: string;
};

export type DocumentCheck = {
  id: string;
  document_version_id: string;
  household_id: string;
  check_type: "expiry" | "name_match" | "date_consistency" | "file_integrity";
  result: "pass" | "mismatch" | "unreadable";
  details: Record<string, unknown>;
  checked_at: string;
};

export type RecordRow = {
  id: string;
  household_id: string;
  member_id: string;
  kind: RecordKind;
  title: string;
  data: Record<string, unknown>;
  recorded_at: string | null;
  created_at: string;
};

export type LoginEvent = {
  id: string;
  user_id: string;
  ip: string | null;
  user_agent: string | null;
  is_new_device: boolean;
  created_at: string;
};

export type Reminder = {
  id: string;
  household_id: string;
  document_id: string | null;
  member_id: string | null;
  due_at: string;
  title: string | null;
  message: string | null;
  offsets: number[];
  channel: string;
  done: boolean;
  created_at: string;
};

export type Share = {
  id: string;
  household_id: string;
  document_id: string;
  token: string;
  expires_at: string;
  revoked_at: string | null;
  max_views: number | null;
  view_count: number;
  watermark: boolean;
  allow_download: boolean;
  created_at: string;
};
