// Generated from the `fantasy-football` Supabase project (id: arpawvszlvhynkepusia).
//
// NOTE ON THE `core` SCHEMA: all of this project's tables live in `core`, not
// `public`. The Supabase MCP `generate_typescript_types` tool (and PostgREST
// itself) only walks schemas listed under Project Settings -> Data API ->
// Exposed schemas, which is `public` only right now — so the MCP generator
// emits an empty `public` schema and silently omits `core`. The `core` types
// below were hand-authored from `list_tables(schemas: ["core"], verbose: true)`
// introspection output instead. Once `core` is added to the exposed-schemas
// list in the dashboard (required anyway for supabase-js to query it), rerun
// `generate_typescript_types` and replace this whole file with its output —
// prefer the generator's version over this one when they diverge.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  core: {
    Tables: {
      league: {
        Row: {
          league_key: string;
          display_name: string;
        };
        Insert: {
          league_key: string;
          display_name: string;
        };
        Update: {
          league_key?: string;
          display_name?: string;
        };
        Relationships: [];
      };
      league_season: {
        Row: {
          id: number;
          league_key: string;
          platform: Database["core"]["Enums"]["platform"];
          platform_league_id: string;
          season: number;
          name: string | null;
          num_teams: number | null;
          scoring_type: string | null;
          scoring_settings: Json | null;
          roster_positions: Json | null;
          settings: Json | null;
          status: string | null;
          previous_platform_league_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          league_key: string;
          platform: Database["core"]["Enums"]["platform"];
          platform_league_id: string;
          season: number;
          name?: string | null;
          num_teams?: number | null;
          scoring_type?: string | null;
          scoring_settings?: Json | null;
          roster_positions?: Json | null;
          settings?: Json | null;
          status?: string | null;
          previous_platform_league_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          league_key?: string;
          platform?: Database["core"]["Enums"]["platform"];
          platform_league_id?: string;
          season?: number;
          name?: string | null;
          num_teams?: number | null;
          scoring_type?: string | null;
          scoring_settings?: Json | null;
          roster_positions?: Json | null;
          settings?: Json | null;
          status?: string | null;
          previous_platform_league_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "league_season_league_key_fkey";
            columns: ["league_key"];
            isOneToOne: false;
            referencedRelation: "league";
            referencedColumns: ["league_key"];
          },
        ];
      };
      manager: {
        Row: {
          id: number;
          display_name: string;
        };
        Insert: {
          id?: number;
          display_name: string;
        };
        Update: {
          id?: number;
          display_name?: string;
        };
        Relationships: [];
      };
      manager_platform_identity: {
        Row: {
          manager_id: number;
          platform: Database["core"]["Enums"]["platform"];
          platform_user_id: string;
          platform_username: string | null;
        };
        Insert: {
          manager_id: number;
          platform: Database["core"]["Enums"]["platform"];
          platform_user_id: string;
          platform_username?: string | null;
        };
        Update: {
          manager_id?: number;
          platform?: Database["core"]["Enums"]["platform"];
          platform_user_id?: string;
          platform_username?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "manager_platform_identity_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "manager";
            referencedColumns: ["id"];
          },
        ];
      };
      franchise: {
        Row: {
          id: number;
          league_season_id: number;
          platform_franchise_id: string;
          name: string | null;
          abbrev: string | null;
          manager_id: number | null;
          wins: number | null;
          losses: number | null;
          ties: number | null;
          points_for: number | null;
          points_against: number | null;
          waiver_position: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          league_season_id: number;
          platform_franchise_id: string;
          name?: string | null;
          abbrev?: string | null;
          manager_id?: number | null;
          wins?: number | null;
          losses?: number | null;
          ties?: number | null;
          points_for?: number | null;
          points_against?: number | null;
          waiver_position?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          league_season_id?: number;
          platform_franchise_id?: string;
          name?: string | null;
          abbrev?: string | null;
          manager_id?: number | null;
          wins?: number | null;
          losses?: number | null;
          ties?: number | null;
          points_for?: number | null;
          points_against?: number | null;
          waiver_position?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "franchise_manager_id_fkey";
            columns: ["manager_id"];
            isOneToOne: false;
            referencedRelation: "manager";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "franchise_league_season_id_fkey";
            columns: ["league_season_id"];
            isOneToOne: false;
            referencedRelation: "league_season";
            referencedColumns: ["id"];
          },
        ];
      };
      player: {
        Row: {
          id: number;
          gsis_id: string | null;
          full_name: string;
          first_name: string | null;
          last_name: string | null;
          position: string | null;
          birth_date: string | null;
          college: string | null;
          draft_year: number | null;
          draft_round: number | null;
          draft_pick: number | null;
          latest_nfl_team: string | null;
          status: string | null;
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          gsis_id?: string | null;
          full_name: string;
          first_name?: string | null;
          last_name?: string | null;
          position?: string | null;
          birth_date?: string | null;
          college?: string | null;
          draft_year?: number | null;
          draft_round?: number | null;
          draft_pick?: number | null;
          latest_nfl_team?: string | null;
          status?: string | null;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          gsis_id?: string | null;
          full_name?: string;
          first_name?: string | null;
          last_name?: string | null;
          position?: string | null;
          birth_date?: string | null;
          college?: string | null;
          draft_year?: number | null;
          draft_round?: number | null;
          draft_pick?: number | null;
          latest_nfl_team?: string | null;
          status?: string | null;
          source?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      player_id_map: {
        Row: {
          player_id: number;
          id_type: string;
          id_value: string;
          source: string;
        };
        Insert: {
          player_id: number;
          id_type: string;
          id_value: string;
          source?: string;
        };
        Update: {
          player_id?: number;
          id_type?: string;
          id_value?: string;
          source?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_id_map_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "player";
            referencedColumns: ["id"];
          },
        ];
      };
      matchup: {
        Row: {
          id: number;
          league_season_id: number;
          week: number;
          franchise_id: number;
          opponent_franchise_id: number | null;
          platform_matchup_id: string | null;
          points: number | null;
          is_playoffs: boolean;
          is_consolation: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          league_season_id: number;
          week: number;
          franchise_id: number;
          opponent_franchise_id?: number | null;
          platform_matchup_id?: string | null;
          points?: number | null;
          is_playoffs?: boolean;
          is_consolation?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          league_season_id?: number;
          week?: number;
          franchise_id?: number;
          opponent_franchise_id?: number | null;
          platform_matchup_id?: string | null;
          points?: number | null;
          is_playoffs?: boolean;
          is_consolation?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "matchup_league_season_id_fkey";
            columns: ["league_season_id"];
            isOneToOne: false;
            referencedRelation: "league_season";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matchup_franchise_id_fkey";
            columns: ["franchise_id"];
            isOneToOne: false;
            referencedRelation: "franchise";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "matchup_opponent_franchise_id_fkey";
            columns: ["opponent_franchise_id"];
            isOneToOne: false;
            referencedRelation: "franchise";
            referencedColumns: ["id"];
          },
        ];
      };
      lineup_slot_entry: {
        Row: {
          id: number;
          league_season_id: number;
          week: number;
          franchise_id: number;
          player_id: number;
          slot: string;
          is_starter: boolean;
          points: number | null;
          projected_points: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          league_season_id: number;
          week: number;
          franchise_id: number;
          player_id: number;
          slot: string;
          is_starter: boolean;
          points?: number | null;
          projected_points?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          league_season_id?: number;
          week?: number;
          franchise_id?: number;
          player_id?: number;
          slot?: string;
          is_starter?: boolean;
          points?: number | null;
          projected_points?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "lineup_slot_entry_franchise_id_fkey";
            columns: ["franchise_id"];
            isOneToOne: false;
            referencedRelation: "franchise";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lineup_slot_entry_league_season_id_fkey";
            columns: ["league_season_id"];
            isOneToOne: false;
            referencedRelation: "league_season";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "lineup_slot_entry_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "player";
            referencedColumns: ["id"];
          },
        ];
      };
      roster_membership: {
        Row: {
          league_season_id: number;
          franchise_id: number;
          player_id: number;
          as_of: string;
          slot_group: string | null;
        };
        Insert: {
          league_season_id: number;
          franchise_id: number;
          player_id: number;
          as_of: string;
          slot_group?: string | null;
        };
        Update: {
          league_season_id?: number;
          franchise_id?: number;
          player_id?: number;
          as_of?: string;
          slot_group?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "roster_membership_franchise_id_fkey";
            columns: ["franchise_id"];
            isOneToOne: false;
            referencedRelation: "franchise";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roster_membership_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "player";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "roster_membership_league_season_id_fkey";
            columns: ["league_season_id"];
            isOneToOne: false;
            referencedRelation: "league_season";
            referencedColumns: ["id"];
          },
        ];
      };
      transaction: {
        Row: {
          id: number;
          league_season_id: number;
          platform_txn_id: string;
          week: number | null;
          txn_type: string;
          status: string | null;
          processed_at: string | null;
          faab_spent: number | null;
          detail: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          league_season_id: number;
          platform_txn_id: string;
          week?: number | null;
          txn_type: string;
          status?: string | null;
          processed_at?: string | null;
          faab_spent?: number | null;
          detail: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          league_season_id?: number;
          platform_txn_id?: string;
          week?: number | null;
          txn_type?: string;
          status?: string | null;
          processed_at?: string | null;
          faab_spent?: number | null;
          detail?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transaction_league_season_id_fkey";
            columns: ["league_season_id"];
            isOneToOne: false;
            referencedRelation: "league_season";
            referencedColumns: ["id"];
          },
        ];
      };
      transaction_item: {
        Row: {
          id: number;
          transaction_id: number;
          player_id: number | null;
          from_franchise_id: number | null;
          to_franchise_id: number | null;
          draft_pick_desc: string | null;
        };
        Insert: {
          id?: number;
          transaction_id: number;
          player_id?: number | null;
          from_franchise_id?: number | null;
          to_franchise_id?: number | null;
          draft_pick_desc?: string | null;
        };
        Update: {
          id?: number;
          transaction_id?: number;
          player_id?: number | null;
          from_franchise_id?: number | null;
          to_franchise_id?: number | null;
          draft_pick_desc?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "transaction_item_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "player";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transaction_item_from_franchise_id_fkey";
            columns: ["from_franchise_id"];
            isOneToOne: false;
            referencedRelation: "franchise";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transaction_item_to_franchise_id_fkey";
            columns: ["to_franchise_id"];
            isOneToOne: false;
            referencedRelation: "franchise";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transaction_item_transaction_id_fkey";
            columns: ["transaction_id"];
            isOneToOne: false;
            referencedRelation: "transaction";
            referencedColumns: ["id"];
          },
        ];
      };
      draft: {
        Row: {
          id: number;
          league_season_id: number;
          platform_draft_id: string | null;
          draft_type: string | null;
          started_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          league_season_id: number;
          platform_draft_id?: string | null;
          draft_type?: string | null;
          started_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          league_season_id?: number;
          platform_draft_id?: string | null;
          draft_type?: string | null;
          started_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "draft_league_season_id_fkey";
            columns: ["league_season_id"];
            isOneToOne: false;
            referencedRelation: "league_season";
            referencedColumns: ["id"];
          },
        ];
      };
      draft_pick: {
        Row: {
          draft_id: number;
          overall_pick: number;
          round: number;
          round_pick: number;
          franchise_id: number | null;
          player_id: number | null;
          auction_price: number | null;
          is_keeper: boolean | null;
        };
        Insert: {
          draft_id: number;
          overall_pick: number;
          round: number;
          round_pick: number;
          franchise_id?: number | null;
          player_id?: number | null;
          auction_price?: number | null;
          is_keeper?: boolean | null;
        };
        Update: {
          draft_id?: number;
          overall_pick?: number;
          round?: number;
          round_pick?: number;
          franchise_id?: number | null;
          player_id?: number | null;
          auction_price?: number | null;
          is_keeper?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "draft_pick_franchise_id_fkey";
            columns: ["franchise_id"];
            isOneToOne: false;
            referencedRelation: "franchise";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_pick_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "player";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "draft_pick_draft_id_fkey";
            columns: ["draft_id"];
            isOneToOne: false;
            referencedRelation: "draft";
            referencedColumns: ["id"];
          },
        ];
      };
      nfl_team: {
        Row: {
          abbrev: string;
          name: string | null;
          conference: string | null;
          division: string | null;
        };
        Insert: {
          abbrev: string;
          name?: string | null;
          conference?: string | null;
          division?: string | null;
        };
        Update: {
          abbrev?: string;
          name?: string | null;
          conference?: string | null;
          division?: string | null;
        };
        Relationships: [];
      };
      nfl_game: {
        Row: {
          game_id: string;
          season: number;
          week: number;
          game_type: string;
          kickoff: string | null;
          home_team: string | null;
          away_team: string | null;
          home_score: number | null;
          away_score: number | null;
        };
        Insert: {
          game_id: string;
          season: number;
          week: number;
          game_type: string;
          kickoff?: string | null;
          home_team?: string | null;
          away_team?: string | null;
          home_score?: number | null;
          away_score?: number | null;
        };
        Update: {
          game_id?: string;
          season?: number;
          week?: number;
          game_type?: string;
          kickoff?: string | null;
          home_team?: string | null;
          away_team?: string | null;
          home_score?: number | null;
          away_score?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "nfl_game_home_team_fkey";
            columns: ["home_team"];
            isOneToOne: false;
            referencedRelation: "nfl_team";
            referencedColumns: ["abbrev"];
          },
          {
            foreignKeyName: "nfl_game_away_team_fkey";
            columns: ["away_team"];
            isOneToOne: false;
            referencedRelation: "nfl_team";
            referencedColumns: ["abbrev"];
          },
        ];
      };
      player_week_stats: {
        Row: {
          player_id: number;
          season: number;
          week: number;
          season_type: string;
          nfl_team: string | null;
          opponent: string | null;
          stats: Json;
          pass_yds: number | null;
          pass_td: number | null;
          interceptions: number | null;
          rush_yds: number | null;
          rush_td: number | null;
          receptions: number | null;
          targets: number | null;
          rec_yds: number | null;
          rec_td: number | null;
          fumbles_lost: number | null;
          fantasy_points_std: number | null;
          fantasy_points_ppr: number | null;
          updated_at: string;
        };
        Insert: {
          player_id: number;
          season: number;
          week: number;
          season_type?: string;
          nfl_team?: string | null;
          opponent?: string | null;
          stats: Json;
          pass_yds?: number | null;
          pass_td?: number | null;
          interceptions?: number | null;
          rush_yds?: number | null;
          rush_td?: number | null;
          receptions?: number | null;
          targets?: number | null;
          rec_yds?: number | null;
          rec_td?: number | null;
          fumbles_lost?: number | null;
          fantasy_points_std?: number | null;
          fantasy_points_ppr?: number | null;
          updated_at?: string;
        };
        Update: {
          player_id?: number;
          season?: number;
          week?: number;
          season_type?: string;
          nfl_team?: string | null;
          opponent?: string | null;
          stats?: Json;
          pass_yds?: number | null;
          pass_td?: number | null;
          interceptions?: number | null;
          rush_yds?: number | null;
          rush_td?: number | null;
          receptions?: number | null;
          targets?: number | null;
          rec_yds?: number | null;
          rec_td?: number | null;
          fumbles_lost?: number | null;
          fantasy_points_std?: number | null;
          fantasy_points_ppr?: number | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "player_week_stats_player_id_fkey";
            columns: ["player_id"];
            isOneToOne: false;
            referencedRelation: "player";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      platform: "espn" | "sleeper";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
  core: {
    Enums: {
      platform: ["espn", "sleeper"],
    },
  },
} as const;
