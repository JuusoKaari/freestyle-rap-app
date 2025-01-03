/**
 * Beats Configuration Module
 * ========================
 * 
 * Configuration file for all available beats in the application.
 * Defines beat metadata and playback settings.
 * 
 * Each beat entry contains:
 * - id: Unique identifier for the beat
 * - name: Display name in both languages (FI/EN)
 * - file: Audio file reference
 * - bpm: Beats per minute for timing
 * - credits: Attribution for beat creators
 * 
 * The beats are used for:
 * - Training mode accompaniment
 * - Word timing synchronization
 * - Practice rhythm maintenance
 * - User experience enhancement
 */

export const beats = [
  {
    id: 'night-ride-slowest',
    name: 'Night Ride - slowest',
    bpm: 55,
    file: 'night_ride_short_55bpm.mp3',
    description: 'Same beat but even slower!'
  },
  {
    id: 'night-ride-slower',
    name: 'Night Ride - slower',
    bpm: 65,
    file: 'night_ride_short_65bpm.mp3',
    description: 'Same beat but slower!'
  },
  {
    id: 'night-ride',
    name: 'Night Ride',
    bpm: 75,
    file: 'night_ride_short_75bpm.mp3',
    description: 'Moody Slow beat with some fast hihats - Good for coding!'
  },
  {
    id: 'night-ride-fast',
    name: 'Night Ride - faster',
    bpm: 85,
    file: 'night_ride_short_85bpm.mp3',
    description: 'Same beat but faster!'
  },
  {
    id: 'night-ride-faster',
    name: 'Night Ride - even faster',
    bpm: 95,
    file: 'night_ride_short_95bpm.mp3',
    description: 'Same beat but even faster!'
  },
  {
    id: 'night-ride-fastest',
    name: 'Night Ride - crazy fast',
    bpm: 120,
    file: 'night_ride_short_120bpm.mp3',
    description: 'Same beat but crazy fast!'
  }
]; 