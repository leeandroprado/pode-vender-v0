export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          conversations_count: number
          created_at: string
          description: string | null
          id: string
          model: Database["public"]["Enums"]["ai_model"]
          name: string
          prompt_system: string
          qr_code: string | null
          status: Database["public"]["Enums"]["agent_status"]
          updated_at: string
          user_id: string
          whatsapp_connected: boolean
          whatsapp_phone: string | null
        }
        Insert: {
          conversations_count?: number
          created_at?: string
          description?: string | null
          id?: string
          model?: Database["public"]["Enums"]["ai_model"]
          name: string
          prompt_system?: string
          qr_code?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
          user_id: string
          whatsapp_connected?: boolean
          whatsapp_phone?: string | null
        }
        Update: {
          conversations_count?: number
          created_at?: string
          description?: string | null
          id?: string
          model?: Database["public"]["Enums"]["ai_model"]
          name?: string
          prompt_system?: string
          qr_code?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          updated_at?: string
          user_id?: string
          whatsapp_connected?: boolean
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string | null
          id: string
          last_message_at: string | null
          metadata: Json | null
          status: string
          updated_at: string | null
          user_id: string
          whatsapp_instance_id: string | null
          whatsapp_phone: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string | null
          user_id: string
          whatsapp_instance_id?: string | null
          whatsapp_phone: string
        }
        Update: {
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          status?: string
          updated_at?: string | null
          user_id?: string
          whatsapp_instance_id?: string | null
          whatsapp_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_whatsapp_instance_id_fkey"
            columns: ["whatsapp_instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          id: string
          message_type: string | null
          sender_id: string | null
          sender_type: string
          timestamp: string | null
          whatsapp_message_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          id?: string
          message_type?: string | null
          sender_id?: string | null
          sender_type: string
          timestamp?: string | null
          whatsapp_message_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          id?: string
          message_type?: string | null
          sender_id?: string | null
          sender_type?: string
          timestamp?: string | null
          whatsapp_message_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
          price: number
          status: string
          stock: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price: number
          status?: string
          stock?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price?: number
          status?: string
          stock?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_encrypted: boolean | null
          setting_key: string
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          setting_key: string
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          setting_key?: string
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_instances: {
        Row: {
          agent_id: string
          created_at: string
          hash: string | null
          id: string
          instance_id: string | null
          instance_name: string
          integration: string
          qr_code_base64: string | null
          qr_code_text: string | null
          settings: Json | null
          status: Database["public"]["Enums"]["whatsapp_instance_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          hash?: string | null
          id?: string
          instance_id?: string | null
          instance_name: string
          integration?: string
          qr_code_base64?: string | null
          qr_code_text?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["whatsapp_instance_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          hash?: string | null
          id?: string
          instance_id?: string | null
          instance_name?: string
          integration?: string
          qr_code_base64?: string | null
          qr_code_text?: string | null
          settings?: Json | null
          status?: Database["public"]["Enums"]["whatsapp_instance_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: true
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      company_has_active_subscription: {
        Args: { company_uuid: string }
        Returns: boolean
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_company_role: {
        Args: { company_uuid: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_company_admin: {
        Args: { company_uuid: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      agent_status: "active" | "inactive" | "training"
      ai_model:
        | "google/gemini-2.5-pro"
        | "google/gemini-2.5-flash"
        | "google/gemini-2.5-flash-lite"
        | "openai/gpt-5"
        | "openai/gpt-5-mini"
        | "openai/gpt-5-nano"
        | "x-ai/grok-code-fast-1"
        | "x-ai/grok-4-fast:free"
        | "deepseek/deepseek-chat-v3-0324"
      plan_type: "trial" | "basic" | "professional"
      user_role: "super_admin" | "admin" | "caixa"
      whatsapp_instance_status:
        | "connecting"
        | "connected"
        | "disconnected"
        | "error"
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
  public: {
    Enums: {
      agent_status: ["active", "inactive", "training"],
      ai_model: [
        "google/gemini-2.5-pro",
        "google/gemini-2.5-flash",
        "google/gemini-2.5-flash-lite",
        "openai/gpt-5",
        "openai/gpt-5-mini",
        "openai/gpt-5-nano",
        "x-ai/grok-code-fast-1",
        "x-ai/grok-4-fast:free",
        "deepseek/deepseek-chat-v3-0324",
      ],
      plan_type: ["trial", "basic", "professional"],
      user_role: ["super_admin", "admin", "caixa"],
      whatsapp_instance_status: [
        "connecting",
        "connected",
        "disconnected",
        "error",
      ],
    },
  },
} as const
