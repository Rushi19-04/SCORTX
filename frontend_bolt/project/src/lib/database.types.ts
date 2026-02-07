export interface Database {
  public: {
    Tables: {
      audit_reports: {
        Row: {
          id: string;
          contract_name: string;
          original_code: string;
          findings_json: Finding[];
          fixed_code: string | null;
          scan_status: 'scanning' | 'completed' | 'failed';
          critical_count: number;
          high_count: number;
          medium_count: number;
          low_count: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          contract_name: string;
          original_code: string;
          findings_json?: Finding[];
          fixed_code?: string | null;
          scan_status?: 'scanning' | 'completed' | 'failed';
          critical_count?: number;
          high_count?: number;
          medium_count?: number;
          low_count?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          contract_name?: string;
          original_code?: string;
          findings_json?: Finding[];
          fixed_code?: string | null;
          scan_status?: 'scanning' | 'completed' | 'failed';
          critical_count?: number;
          high_count?: number;
          medium_count?: number;
          low_count?: number;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
}

export interface Finding {
  type: 'transactional' | 'structural';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  line: number;
  recommendation?: string;
}
