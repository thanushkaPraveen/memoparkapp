// features/parking/store.ts
import { create } from 'zustand';
import axiosClient from '../../lib/axios';

/**
 * Interface representing a Landmark object from the API.
 */
interface Landmark {
  landmarks_id: number;
  parking_events_id: number;
  landmark_latitude: number | null;
  landmark_longitude: number | null;
  location_name: string;
  distance_from_parking: number;
  photo_url: string | null;
  is_achieved: boolean;
  created_at: string;
}

/**
 * Interface representing a Score object from the API.
 */
interface Score {
  scores_id: number;
  parking_events_id: number;
  time_factor: number;
  landmark_factor: number;
  path_performance: number;
  assistance_points: number;
  no_of_landmarks: number;
  landmarks_recalled: number;
  task_score: number;
  created_at: string;
  peek_penalty?: number; 
  calculated_at?: string;
}

/**
 * Interface representing a full ParkingEvent object from the API.
 */
export interface ParkingEvent {
  parking_events_id: number;
  user_id: number;
  parking_latitude: number;
  parking_longitude: number;
  parking_location_name: string;
  parking_address: string;
  notes: string | null;
  parking_type: string;
  level_floor: string | null;
  parking_slot: string | null;
  photo_url: string | null;
  photo_s3_key: string | null;
  started_at: string;
  ended_at: string | null;
  status: 'active' | 'retrieving' | 'retrieved' | 'expired';
  landmarks: Landmark[];
  score: Score | null;
}

interface ParkingState {
  activeParkingSession: ParkingEvent | null | {}; // Can be null or an empty object
  isLoading: boolean;
  fetchActiveParkingSession: () => Promise<void>;
  clearActiveParkingSession: () => void;
}

export const useParkingStore = create<ParkingState>((set) => ({
  activeParkingSession: null,
  isLoading: true,

  /**
   * Fetches the latest active parking session from the backend.
   */
  fetchActiveParkingSession: async () => {
    set({ isLoading: true });
    try {
      const response = await axiosClient.get('/parking/latest-active');
      
      if (Object.keys(response.data).length === 0) {
        set({ activeParkingSession: {} });
      } else {
        set({ activeParkingSession: response.data });
      }

    } catch (error) {
      console.error('Failed to fetch active parking session:', error);
      set({ activeParkingSession: null }); // Set to null on error
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Clears the active parking session from the state.
   */
  clearActiveParkingSession: () => {
    set({ activeParkingSession: null });
  },

}));