// Define CrowdProject type based on how it's used
export interface CrowdProject {
  id: string;
  title: string;
  description: string;
  long_description?: string;
  goal_amount: number;
  current_amount?: number;
  expected_participants?: number;
  created_at?: string;
  channel_id?: string;
  joined?: boolean;
} 