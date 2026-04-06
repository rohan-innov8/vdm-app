export interface Profile {
  id: string;
  full_name: string | null;
  role: 'admin' | 'maker' | 'viewer' | string;
  created_at: string;
  email?: string | null;
}

export interface Project {
  id: string;
  name: string;
  client_name: string | null;
  job_type: string;
  status: string;
  deadline: string | null;
  created_at: string;
  delivery_gauteng: boolean;
  description?: string | null;
  deposit_received_at?: string | null;
  drawings_received_at?: string | null;
  installation_date?: string | null;
}

export interface Task {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: 'Pending' | 'In Progress' | 'Done' | string;
  assigned_to: string | null;
  accountable_name?: string | null;
  deadline?: string | null;
  created_at: string;
  completed_at?: string | null;
  completed_by_name?: string | null;
}

export interface ExtendedTask extends Task {
  profiles?: { id: string; full_name: string | null; role: string };
}

export interface ProjectFile {
  id: string;
  project_id: string;
  file_name: string;
  file_size: number;
  file_url: string;
  uploaded_by: string;
  created_at: string;
  profiles?: { full_name: string | null };
}

export interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: unknown;
  };
  app_metadata?: {
    provider?: string;
    [key: string]: unknown;
  };
  aud: string;
  created_at: string;
}
