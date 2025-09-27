export interface StoredMeditation {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  audioUrl: string; // Vercel Blob URL
  category: string;
  isPremium: boolean;
  tags: string[];
  createdAt: string;
}

// Simple in-memory storage (in production, this would be a database)
let meditationsStore: StoredMeditation[] = [
  // You can add some default meditations here for testing
];

export const meditationStorage = {
  // Get all meditations
  getAll(): StoredMeditation[] {
    return meditationsStore;
  },

  // Add a new meditation
  add(meditation: Omit<StoredMeditation, 'id' | 'createdAt'>): StoredMeditation {
    const newMeditation: StoredMeditation = {
      ...meditation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    meditationsStore.push(newMeditation);
    return newMeditation;
  },

  // Search meditations
  search(query?: string, isPremium?: boolean): StoredMeditation[] {
    let results = meditationsStore;

    if (query) {
      const searchTerm = query.toLowerCase();
      results = results.filter(m => 
        m.title.toLowerCase().includes(searchTerm) ||
        m.description.toLowerCase().includes(searchTerm) ||
        m.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (isPremium !== undefined) {
      results = results.filter(m => m.isPremium === isPremium);
    }

    return results;
  },

  // Delete a meditation
  delete(id: string): boolean {
    const index = meditationsStore.findIndex(m => m.id === id);
    if (index !== -1) {
      meditationsStore.splice(index, 1);
      return true;
    }
    return false;
  },

  // Update a meditation
  update(id: string, updates: Partial<StoredMeditation>): StoredMeditation | null {
    const index = meditationsStore.findIndex(m => m.id === id);
    if (index !== -1) {
      meditationsStore[index] = { ...meditationsStore[index], ...updates };
      return meditationsStore[index];
    }
    return null;
  }
}; 