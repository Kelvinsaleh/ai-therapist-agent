const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const playlistAPI = {
  getUserPlaylists: async () => {
    const response = await fetch(`${API_BASE}/playlists`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  },

  createPlaylist: async (data: any) => {
    const response = await fetch(`${API_BASE}/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  getPlaylist: async (id: string) => {
    const response = await fetch(`${API_BASE}/playlists/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }
};
