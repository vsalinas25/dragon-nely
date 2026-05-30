export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          avatar_url: string | null
          is_admin: boolean
          created_at: string
        }
        Insert: {
          id: string
          name: string
          avatar_url?: string | null
          is_admin?: boolean
          created_at?: string
        }
        Update: {
          name?: string
          avatar_url?: string | null
          is_admin?: boolean
        }
      }
      daily_checkins: {
        Row: {
          id: string
          user_id: string
          date: string
          sugar_free: boolean
          low_carb: boolean
          exercised: boolean
          drank_water: boolean
          points_earned: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          sugar_free?: boolean
          low_carb?: boolean
          exercised?: boolean
          drank_water?: boolean
          points_earned?: number
          created_at?: string
        }
        Update: {
          sugar_free?: boolean
          low_carb?: boolean
          exercised?: boolean
          drank_water?: boolean
          points_earned?: number
        }
      }
      weight_logs: {
        Row: {
          id: string
          user_id: string
          weight_kg: number
          logged_at: string
        }
        Insert: {
          id?: string
          user_id: string
          weight_kg: number
          logged_at?: string
        }
        Update: {
          weight_kg?: number
          logged_at?: string
        }
      }
      measurements: {
        Row: {
          id: string
          user_id: string
          waist_cm: number | null
          hip_cm: number | null
          logged_at: string
        }
        Insert: {
          id?: string
          user_id: string
          waist_cm?: number | null
          hip_cm?: number | null
          logged_at?: string
        }
        Update: {
          waist_cm?: number | null
          hip_cm?: number | null
        }
      }
      checkups: {
        Row: {
          id: string
          user_id: string
          checkup_type: string
          completed_at: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          checkup_type: string
          completed_at: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          checkup_type?: string
          completed_at?: string
          notes?: string | null
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          current_streak: number
          longest_streak: number
          last_checkin_date: string | null
        }
        Insert: {
          id?: string
          user_id: string
          current_streak?: number
          longest_streak?: number
          last_checkin_date?: string | null
        }
        Update: {
          current_streak?: number
          longest_streak?: number
          last_checkin_date?: string | null
        }
      }
      points: {
        Row: {
          id: string
          user_id: string
          total_points: number
          monthly_points: number
          last_reset_at: string
        }
        Insert: {
          id?: string
          user_id: string
          total_points?: number
          monthly_points?: number
          last_reset_at?: string
        }
        Update: {
          total_points?: number
          monthly_points?: number
          last_reset_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          badge_type: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_type: string
          earned_at?: string
        }
        Update: never
      }
      weekly_challenges: {
        Row: {
          id: string
          title: string
          description: string
          start_date: string
          end_date: string
          reward_points: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          start_date: string
          end_date: string
          reward_points?: number
          created_at?: string
        }
        Update: {
          title?: string
          description?: string
          start_date?: string
          end_date?: string
          reward_points?: number
        }
      }
      challenge_completions: {
        Row: {
          id: string
          challenge_id: string
          user_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          challenge_id: string
          user_id: string
          completed_at?: string
        }
        Update: never
      }
      push_subscriptions: {
        Row: {
          id: string
          user_id: string
          subscription: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription: Json
          created_at?: string
        }
        Update: {
          subscription?: Json
        }
      }
      activity_feed: {
        Row: {
          id: string
          user_id: string
          event_type: string
          message: string
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          message: string
          metadata?: Json | null
          created_at?: string
        }
        Update: never
      }
    }
  }
}
