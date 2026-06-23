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

export type DocumentRow = {
  id: string;
  household_id: string;
  member_id: string | null;
  asset_id: string | null;
  category: DocCategory;
  subtype: string | null;
  title: string;
  issuer: string | null;
  doc_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
  notes: string | null;
  tags: string[];
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
