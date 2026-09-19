# Supabase Storage Setup: `contracts` Bucket

## Overview
Document artifacts (.docx and .pdf) generated for each contract generation instance are persisted in a private Supabase Storage bucket named `contracts`.

## Storage Architecture & Bucket Setup
- **Bucket Name**: `contracts`
- **Public Access**: `false` (Private bucket; downloads streamed exclusively via authenticated backend route `/api/contracts/[id]/download`)
- **File Path Structure**: `{userId}/{contractId}/contract.{format}` (e.g. `usr_123/cnt_456/contract.pdf`)
- **MIME Types Supported**:
  - Word: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
  - PDF: `application/pdf`
- **Max File Size**: 10 MB per artifact

## Supabase Storage RLS Policies

```sql
-- Ensure bucket exists and is private
INSERT INTO storage.buckets (id, name, public)
VALUES ('contracts', 'contracts', false)
ON CONFLICT (id) DO NOTHING;

-- Policy: Authenticated users can upload contract documents into their own folder
CREATE POLICY "Users can upload their own contract documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'contracts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can read their own contract documents
CREATE POLICY "Users can view their own contract documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'contracts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can overwrite/update their own contract documents
CREATE POLICY "Users can update their own contract documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'contracts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Authenticated users can delete their own contract documents
CREATE POLICY "Users can delete their own contract documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'contracts' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```
