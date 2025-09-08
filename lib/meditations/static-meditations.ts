export interface MeditationTrack {
  id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  url: string;
  isPremium: boolean;
  category: 'relaxation' | 'sleep' | 'anxiety' | 'focus' | 'breathing';
  tags: string[];
}

// Static meditation library - managed through cloud storage
export const MEDITATION_TRACKS: MeditationTrack[] = [
  // FREE MEDITATIONS
  {
    id: 'basic-breathing',
    title: 'Basic Breathing',
    description: 'A simple 5-minute breathing exercise to help you relax and center yourself.',
    duration: 300, // 5 minutes
    url: 'https://your-blob-url.com/meditations/basic-breathing.mp3',
    isPremium: false,
    category: 'breathing',
    tags: ['beginner', 'breathing', 'relaxation']
  },
  {
    id: 'body-scan',
    title: 'Body Scan Meditation',
    description: 'A gentle 10-minute body scan to release tension and promote relaxation.',
    duration: 600, // 10 minutes
    url: 'https://your-blob-url.com/meditations/body-scan.mp3',
    isPremium: false,
    category: 'relaxation',
    tags: ['body-scan', 'tension-relief', 'mindfulness']
  },
  {
    id: 'mindful-breathing',
    title: 'Mindful Breathing',
    description: 'Focus on your breath with this 8-minute guided meditation.',
    duration: 480, // 8 minutes
    url: 'https://your-blob-url.com/meditations/mindful-breathing.mp3',
    isPremium: false,
    category: 'breathing',
    tags: ['mindfulness', 'breathing', 'focus']
  },
  {
    id: 'progressive-relaxation',
    title: 'Progressive Muscle Relaxation',
    description: 'Release tension by systematically relaxing each muscle group.',
    duration: 900, // 15 minutes
    url: 'https://your-blob-url.com/meditations/progressive-relaxation.mp3',
    isPremium: false,
    category: 'relaxation',
    tags: ['muscle-relaxation', 'tension-relief', 'body-awareness']
  },
  {
    id: 'sleep-preparation',
    title: 'Sleep Preparation',
    description: 'A calming 12-minute meditation to prepare your mind and body for sleep.',
    duration: 720, // 12 minutes
    url: 'https://your-blob-url.com/meditations/sleep-preparation.mp3',
    isPremium: false,
    category: 'sleep',
    tags: ['sleep', 'bedtime', 'calming']
  },

  // PREMIUM MEDITATIONS
  {
    id: 'ocean-waves',
    title: 'Ocean Waves',
    description: 'Immerse yourself in the soothing sounds of ocean waves with guided visualization.',
    duration: 1200, // 20 minutes
    url: 'https://your-blob-url.com/meditations/premium/ocean-waves.mp3',
    isPremium: true,
    category: 'relaxation',
    tags: ['nature-sounds', 'visualization', 'deep-relaxation']
  },
  {
    id: 'forest-walk',
    title: 'Forest Walk',
    description: 'Take a peaceful journey through a serene forest with nature sounds and guidance.',
    duration: 1800, // 30 minutes
    url: 'https://your-blob-url.com/meditations/premium/forest-walk.mp3',
    isPremium: true,
    category: 'relaxation',
    tags: ['nature', 'walking-meditation', 'peaceful']
  },
  {
    id: 'zen-garden',
    title: 'Zen Garden',
    description: 'Find inner peace in a virtual zen garden with traditional meditation techniques.',
    duration: 1500, // 25 minutes
    url: 'https://your-blob-url.com/meditations/premium/zen-garden.mp3',
    isPremium: true,
    category: 'focus',
    tags: ['zen', 'traditional', 'inner-peace']
  },
  {
    id: 'anxiety-relief',
    title: 'Anxiety Relief',
    description: 'Specialized meditation techniques to calm anxiety and restore emotional balance.',
    duration: 900, // 15 minutes
    url: 'https://your-blob-url.com/meditations/premium/anxiety-relief.mp3',
    isPremium: true,
    category: 'anxiety',
    tags: ['anxiety', 'calm', 'emotional-balance']
  },
  {
    id: 'deep-sleep',
    title: 'Deep Sleep Journey',
    description: 'A comprehensive 45-minute sleep meditation for deep, restorative rest.',
    duration: 2700, // 45 minutes
    url: 'https://your-blob-url.com/meditations/premium/deep-sleep.mp3',
    isPremium: true,
    category: 'sleep',
    tags: ['deep-sleep', 'restorative', 'long-form']
  }
];

// Helper functions
export function getMeditationsByCategory(category: string): MeditationTrack[] {
  return MEDITATION_TRACKS.filter(track => track.category === category);
}

export function getFreeMeditations(): MeditationTrack[] {
  return MEDITATION_TRACKS.filter(track => !track.isPremium);
}

export function getPremiumMeditations(): MeditationTrack[] {
  return MEDITATION_TRACKS.filter(track => track.isPremium);
}

export function getMeditationById(id: string): MeditationTrack | undefined {
  return MEDITATION_TRACKS.find(track => track.id === id);
}

export function searchMeditations(query: string): MeditationTrack[] {
  const lowercaseQuery = query.toLowerCase();
  return MEDITATION_TRACKS.filter(track => 
    track.title.toLowerCase().includes(lowercaseQuery) ||
    track.description.toLowerCase().includes(lowercaseQuery) ||
    track.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
}
