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
          created_at: string | null
          description: string | null
          id: string
          max_tokens: number | null
          model: Database["public"]["Enums"]["ai_model"]
          name: string
          status: Database["public"]["Enums"]["agent_status"]
          system_prompt: string | null
          temperature: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_tokens?: number | null
          model?: Database["public"]["Enums"]["ai_model"]
          name: string
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          max_tokens?: number | null
          model?: Database["public"]["Enums"]["ai_model"]
          name?: string
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt?: string | null
          temperature?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_type: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          internal_notes: string | null
          location: string | null
          metadata: Json | null
          organization_id: string | null
          reminder_sent: boolean | null
          reminder_sent_at: string | null
          start_time: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          appointment_type?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          internal_notes?: string | null
          location?: string | null
          metadata?: Json | null
          organization_id?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          start_time: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          appointment_type?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          internal_notes?: string | null
          location?: string | null
          metadata?: Json | null
          organization_id?: string | null
          reminder_sent?: boolean | null
          reminder_sent_at?: string | null
          start_time?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          conversation_id: string
          created_at: string | null
          id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          conversation_id: string
          created_at?: string | null
          id?: string
          price: number
          product_id: string
          quantity?: number
        }
        Update: {
          conversation_id?: string
          created_at?: string | null
          id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          city: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          organization_id: string | null
          phone: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          organization_id?: string | null
          phone: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          city?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          organization_id?: string | null
          phone?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          assigned_to: string | null
          client_id: string | null
          created_at: string | null
          id: string
          last_message_at: string | null
          metadata: Json | null
          organization_id: string | null
          owner_conversation:
            | Database["public"]["Enums"]["conversation_owner"]
            | null
          status: string | null
          updated_at: string | null
          user_id: string
          whatsapp_instance_id: string | null
          whatsapp_phone: string
        }
        Insert: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          organization_id?: string | null
          owner_conversation?:
            | Database["public"]["Enums"]["conversation_owner"]
            | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_instance_id?: string | null
          whatsapp_phone: string
        }
        Update: {
          assigned_to?: string | null
          client_id?: string | null
          created_at?: string | null
          id?: string
          last_message_at?: string | null
          metadata?: Json | null
          organization_id?: string | null
          owner_conversation?:
            | Database["public"]["Enums"]["conversation_owner"]
            | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_instance_id?: string | null
          whatsapp_phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_whatsapp_instance_id_fkey"
            columns: ["whatsapp_instance_id"]
            isOneToOne: false
            referencedRelation: "whatsapp_instances"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          organization_id: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["invite_status"]
          token: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          organization_id?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["invite_status"]
          token?: string
          updated_at?: string
        }
        Relationships: []
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
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id: string
          price: number
          product_id: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string
          price?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          client_id: string | null
          conversation_id: string
          created_at: string | null
          id: string
          notes: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          total: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id?: string | null
          conversation_id: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string | null
          conversation_id?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          total?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          organization_id: string | null
          price: number
          sku: string | null
          status: string | null
          stock: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          organization_id?: string | null
          price: number
          sku?: string | null
          status?: string | null
          stock?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          organization_id?: string | null
          price?: number
          sku?: string | null
          status?: string | null
          stock?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_encrypted: boolean | null
          setting_category: string
          setting_key: string
          setting_value: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          setting_category: string
          setting_key: string
          setting_value: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          setting_category?: string
          setting_key?: string
          setting_value?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_instances: {
        Row: {
          agent_id: string | null
          created_at: string | null
          hash: string | null
          id: string
          instance_id: string | null
          instance_name: string
          integration: string | null
          phone_number: string | null
          qr_code: string | null
          qr_code_base64: string | null
          qr_code_text: string | null
          settings: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          agent_id?: string | null
          created_at?: string | null
          hash?: string | null
          id?: string
          instance_id?: string | null
          instance_name: string
          integration?: string | null
          phone_number?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          qr_code_text?: string | null
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string | null
          created_at?: string | null
          hash?: string | null
          id?: string
          instance_id?: string | null
          instance_name?: string
          integration?: string | null
          phone_number?: string | null
          qr_code?: string | null
          qr_code_base64?: string | null
          qr_code_text?: string | null
          settings?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_instances_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
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
      current_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      same_organization: {
        Args: { _owner_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      agent_status: "active" | "inactive" | "training"
      ai_model:
        | "gpt-4"
        | "gpt-3.5-turbo"
        | "claude-3-opus"
        | "claude-3-sonnet"
        | "gemini-pro"
        | "google/gemini-2.5-pro"
        | "google/gemini-2.5-flash"
        | "google/gemini-2.5-flash-lite"
        | "openai/gpt-5"
        | "openai/gpt-5-mini"
        | "openai/gpt-5-nano"
      conversation_owner: "ia" | "human"
      invite_status: "pending" | "accepted" | "expired"
      order_status:
        | "pending"
        | "confirmed"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      user_role: "admin" | "moderator" | "user" | "super_admin" | "vendedor"
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
        "gpt-4",
        "gpt-3.5-turbo",
        "claude-3-opus",
        "claude-3-sonnet",
        "gemini-pro",
        "google/gemini-2.5-pro",
        "google/gemini-2.5-flash",
        "google/gemini-2.5-flash-lite",
        "openai/gpt-5",
        "openai/gpt-5-mini",
        "openai/gpt-5-nano",
      ],
      conversation_owner: ["ia", "human"],
      invite_status: ["pending", "accepted", "expired"],
      order_status: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      user_role: ["admin", "moderator", "user", "super_admin", "vendedor"],
    },
  },
} as const
