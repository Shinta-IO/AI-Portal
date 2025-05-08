export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          created_at: string;
          first_name: string;
          last_name: string;
          role: string;
          enzo: any | null;
          email: string | null;
          avatar_url: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          first_name?: string;
          last_name?: string;
          role?: string;
          enzo?: any | null;
          email?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          first_name?: string;
          last_name?: string;
          role?: string;
          enzo?: any | null;
          email?: string | null;
          avatar_url?: string | null;
        };
      };
      projects: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          client_id: string;
          crowd_project_id: string | null;
          status: string;
          estimate_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          client_id: string;
          crowd_project_id?: string | null;
          status?: string;
          estimate_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          client_id?: string;
          crowd_project_id?: string | null;
          status?: string;
          estimate_id?: string | null;
        };
      };
      project_members: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          role: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          role?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          role?: string;
        };
      };
      estimates: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          title: string;
          description: string;
          timeline: string;
          budget: number;
          status: string;
          enzo: any | null;
          total: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          title?: string;
          description?: string;
          timeline?: string;
          budget: number;
          status?: string;
          enzo?: any | null;
          total?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          title?: string;
          description?: string;
          timeline?: string;
          budget?: number;
          status?: string;
          enzo?: any | null;
          total?: number;
        };
      };
      invoices: {
        Row: {
          id: string;
          created_at: string;
          user_id: string | null;
          estimate_id: string | null;
          amount: number;
          status: string;
          sent_at: string | null;
          last_reminder_at: string | null;
          profile_id: string | null;
          total: number;
          stripe_session_id?: string;
          crowd_project_id?: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          estimate_id?: string | null;
          amount: number;
          status?: string;
          sent_at?: string | null;
          last_reminder_at?: string | null;
          profile_id?: string | null;
          total?: number;
          stripe_session_id?: string;
          crowd_project_id?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string | null;
          estimate_id?: string | null;
          amount?: number;
          status?: string;
          sent_at?: string | null;
          last_reminder_at?: string | null;
          profile_id?: string | null;
          total?: number;
          stripe_session_id?: string;
          crowd_project_id?: string;
        };
      };
      channels: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          project_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          project_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          project_id?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          created_at: string;
          sender_id: string;
          content: string;
          channel_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          sender_id: string;
          content?: string;
          channel_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          sender_id?: string;
          content?: string;
          channel_id?: string | null;
        };
      };
      project_tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string;
          status: string;
          assigned_to: string | null;
          created_at: string;
          due_date: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string;
          status?: string;
          assigned_to?: string | null;
          created_at?: string;
          due_date?: string | null;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string;
          status?: string;
          assigned_to?: string | null;
          created_at?: string;
          due_date?: string | null;
        };
      };
      crowd_projects: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string;
          status: string;
          estimate_id: string | null;
          project_id: string | null;
          expected_participants: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description: string;
          status?: string;
          estimate_id?: string | null;
          project_id?: string | null;
          expected_participants: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string;
          status?: string;
          estimate_id?: string | null;
          project_id?: string | null;
          expected_participants?: number;
        };
      };
      crowd_participation: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          crowd_project_id: string;
          amount: number;
          status: string;
          paid: boolean;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          crowd_project_id: string;
          amount: number;
          status?: string;
          paid?: boolean;
          paid_at?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          crowd_project_id?: string;
          amount?: number;
          status?: string;
          paid?: boolean;
          paid_at?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
};
