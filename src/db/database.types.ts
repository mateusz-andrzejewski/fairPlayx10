export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action_type: Database["public"]["Enums"]["audit_action"]
          actor_id: number
          changes: Json | null
          id: number
          ip_address: unknown
          target_id: number
          target_table: string
          timestamp: string
        }
        Insert: {
          action_type: Database["public"]["Enums"]["audit_action"]
          actor_id: number
          changes?: Json | null
          id?: number
          ip_address?: unknown
          target_id: number
          target_table: string
          timestamp?: string
        }
        Update: {
          action_type?: Database["public"]["Enums"]["audit_action"]
          actor_id?: number
          changes?: Json | null
          id?: number
          ip_address?: unknown
          target_id?: number
          target_table?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      event_signups: {
        Row: {
          event_id: number
          id: number
          player_id: number
          resignation_timestamp: string | null
          signup_timestamp: string
          status: Database["public"]["Enums"]["signup_status"]
        }
        Insert: {
          event_id: number
          id?: number
          player_id: number
          resignation_timestamp?: string | null
          signup_timestamp?: string
          status?: Database["public"]["Enums"]["signup_status"]
        }
        Update: {
          event_id?: number
          id?: number
          player_id?: number
          resignation_timestamp?: string | null
          signup_timestamp?: string
          status?: Database["public"]["Enums"]["signup_status"]
        }
        Relationships: [
          {
            foreignKeyName: "event_signups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_signups_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          current_signups_count: number
          deleted_at: string | null
          event_datetime: string
          id: number
          location: string
          max_places: number
          name: string
          optional_fee: number | null
          organizer_id: number
          preferred_team_count: number | null
          status: Database["public"]["Enums"]["event_status"]
          teams_drawn_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_signups_count?: number
          deleted_at?: string | null
          event_datetime: string
          id?: number
          location: string
          max_places: number
          name: string
          optional_fee?: number | null
          organizer_id: number
          preferred_team_count?: number | null
          status?: Database["public"]["Enums"]["event_status"]
          teams_drawn_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_signups_count?: number
          deleted_at?: string | null
          event_datetime?: string
          id?: number
          location?: string
          max_places?: number
          name?: string
          optional_fee?: number | null
          organizer_id?: number
          preferred_team_count?: number | null
          status?: Database["public"]["Enums"]["event_status"]
          teams_drawn_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string
          date_of_birth: string | null
          deleted_at: string | null
          first_name: string
          id: number
          last_name: string
          position: Database["public"]["Enums"]["player_position"]
          skill_rate: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          first_name: string
          id?: number
          last_name: string
          position: Database["public"]["Enums"]["player_position"]
          skill_rate?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          deleted_at?: string | null
          first_name?: string
          id?: number
          last_name?: string
          position?: Database["public"]["Enums"]["player_position"]
          skill_rate?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      team_assignments: {
        Row: {
          assignment_timestamp: string
          id: number
          signup_id: number
          team_color: Database["public"]["Enums"]["team_color"]
          team_number: number
        }
        Insert: {
          assignment_timestamp?: string
          id?: number
          signup_id: number
          team_color?: Database["public"]["Enums"]["team_color"]
          team_number: number
        }
        Update: {
          assignment_timestamp?: string
          id?: number
          signup_id?: number
          team_color?: Database["public"]["Enums"]["team_color"]
          team_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "team_assignments_signup_id_fkey"
            columns: ["signup_id"]
            isOneToOne: true
            referencedRelation: "event_signups"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          consent_date: string
          consent_version: string
          created_at: string
          deleted_at: string | null
          email: string
          first_name: string
          id: number
          last_name: string
          password_hash: string
          player_id: number | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          consent_date?: string
          consent_version: string
          created_at?: string
          deleted_at?: string | null
          email: string
          first_name: string
          id?: number
          last_name: string
          password_hash: string
          player_id?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          consent_date?: string
          consent_version?: string
          created_at?: string
          deleted_at?: string | null
          email?: string
          first_name?: string
          id?: number
          last_name?: string
          password_hash?: string
          player_id?: number | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "users_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      audit_action:
        | "user_approved"
        | "user_rejected"
        | "player_created"
        | "player_updated"
        | "player_deleted"
        | "event_created"
        | "event_updated"
        | "event_deleted"
        | "signup_confirmed"
        | "signup_withdrawn"
        | "team_assigned"
        | "team_reassigned"
        | "user_deleted"
        | "team_draw"
      event_status: "draft" | "active" | "completed" | "cancelled"
      player_position: "forward" | "midfielder" | "defender" | "goalkeeper"
      signup_status: "pending" | "confirmed" | "withdrawn"
      team_color: "black" | "white" | "red" | "blue"
      user_role: "admin" | "organizer" | "player"
      user_status: "pending" | "approved"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      audit_action: [
        "user_approved",
        "user_rejected",
        "player_created",
        "player_updated",
        "player_deleted",
        "event_created",
        "event_updated",
        "event_deleted",
        "signup_confirmed",
        "signup_withdrawn",
        "team_assigned",
        "team_reassigned",
        "user_deleted",
        "team_draw",
      ],
      event_status: ["draft", "active", "completed", "cancelled"],
      player_position: ["forward", "midfielder", "defender", "goalkeeper"],
      signup_status: ["pending", "confirmed", "withdrawn"],
      team_color: ["black", "white", "red", "blue"],
      user_role: ["admin", "organizer", "player"],
      user_status: ["pending", "approved"],
    },
  },
} as const

