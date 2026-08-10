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
      analysis_runs: {
        Row: {
          created_at: string
          id: string
          pr_number: number | null
          repo_id: string
          status: Database["public"]["Enums"]["analysis_run_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          pr_number?: number | null
          repo_id: string
          status?: Database["public"]["Enums"]["analysis_run_status"]
        }
        Update: {
          created_at?: string
          id?: string
          pr_number?: number | null
          repo_id?: string
          status?: Database["public"]["Enums"]["analysis_run_status"]
        }
        Relationships: [
          {
            foreignKeyName: "analysis_runs_repo_id_fkey"
            columns: ["repo_id"]
            isOneToOne: false
            referencedRelation: "repos"
            referencedColumns: ["id"]
          },
        ]
      }
      consumer_impacts: {
        Row: {
          affected_export: string
          analysis_run_id: string
          consumer_repo_id: string
          created_at: string
          file_path: string
          id: string
          line_number: number | null
        }
        Insert: {
          affected_export: string
          analysis_run_id: string
          consumer_repo_id: string
          created_at?: string
          file_path: string
          id?: string
          line_number?: number | null
        }
        Update: {
          affected_export?: string
          analysis_run_id?: string
          consumer_repo_id?: string
          created_at?: string
          file_path?: string
          id?: string
          line_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "consumer_impacts_analysis_run_id_fkey"
            columns: ["analysis_run_id"]
            isOneToOne: false
            referencedRelation: "analysis_runs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consumer_impacts_consumer_repo_id_fkey"
            columns: ["consumer_repo_id"]
            isOneToOne: false
            referencedRelation: "repos"
            referencedColumns: ["id"]
          },
        ]
      }
      findings: {
        Row: {
          analysis_run_id: string
          confidence: number
          created_at: string
          description: string
          id: string
          severity: Database["public"]["Enums"]["finding_severity"]
          tool: Database["public"]["Enums"]["governance_tool"]
          type: string
        }
        Insert: {
          analysis_run_id: string
          confidence?: number
          created_at?: string
          description: string
          id?: string
          severity?: Database["public"]["Enums"]["finding_severity"]
          tool: Database["public"]["Enums"]["governance_tool"]
          type: string
        }
        Update: {
          analysis_run_id?: string
          confidence?: number
          created_at?: string
          description?: string
          id?: string
          severity?: Database["public"]["Enums"]["finding_severity"]
          tool?: Database["public"]["Enums"]["governance_tool"]
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "findings_analysis_run_id_fkey"
            columns: ["analysis_run_id"]
            isOneToOne: false
            referencedRelation: "analysis_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      repos: {
        Row: {
          created_at: string
          github_url: string
          id: string
          name: string
          role: Database["public"]["Enums"]["repo_role"]
        }
        Insert: {
          created_at?: string
          github_url: string
          id?: string
          name: string
          role: Database["public"]["Enums"]["repo_role"]
        }
        Update: {
          created_at?: string
          github_url?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["repo_role"]
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      analysis_run_status: "pending" | "running" | "succeeded" | "failed"
      finding_severity: "info" | "low" | "medium" | "high" | "critical"
      governance_tool:
        | "health-cli"
        | "breaking-change-analyzer"
        | "deprecation-orchestrator"
        | "zero-usage-gate"
        | "ownership-mapper"
      repo_role: "design_system" | "consumer"
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
      analysis_run_status: ["pending", "running", "succeeded", "failed"],
      finding_severity: ["info", "low", "medium", "high", "critical"],
      governance_tool: [
        "health-cli",
        "breaking-change-analyzer",
        "deprecation-orchestrator",
        "zero-usage-gate",
        "ownership-mapper",
      ],
      repo_role: ["design_system", "consumer"],
    },
  },
} as const

