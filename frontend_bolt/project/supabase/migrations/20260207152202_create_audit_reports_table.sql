/*
  # SCORTX Audit Reports Schema

  1. New Tables
    - `audit_reports`
      - `id` (uuid, primary key) - Unique identifier for each audit
      - `contract_name` (text) - Name of the smart contract file
      - `original_code` (text) - The original Solidity code submitted
      - `findings_json` (jsonb) - JSON object containing all vulnerability findings
      - `fixed_code` (text, nullable) - AI-remediated code if fixes were applied
      - `scan_status` (text) - Status: 'scanning', 'completed', 'failed'
      - `critical_count` (integer) - Number of critical vulnerabilities
      - `high_count` (integer) - Number of high severity vulnerabilities
      - `medium_count` (integer) - Number of medium severity vulnerabilities
      - `low_count` (integer) - Number of low severity vulnerabilities
      - `created_at` (timestamptz) - Timestamp of scan creation
      - `completed_at` (timestamptz, nullable) - Timestamp when scan completed

  2. Security
    - Enable RLS on `audit_reports` table
    - Add policy for public read access (since this is a demo/dev environment)
*/

CREATE TABLE IF NOT EXISTS audit_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_name text NOT NULL,
  original_code text NOT NULL,
  findings_json jsonb DEFAULT '[]'::jsonb,
  fixed_code text,
  scan_status text DEFAULT 'scanning',
  critical_count integer DEFAULT 0,
  high_count integer DEFAULT 0,
  medium_count integer DEFAULT 0,
  low_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

ALTER TABLE audit_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to audit reports"
  ON audit_reports
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert of audit reports"
  ON audit_reports
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update of audit reports"
  ON audit_reports
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);