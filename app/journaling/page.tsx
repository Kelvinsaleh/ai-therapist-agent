"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  NotebookPen, 
  Save, 
  Calendar, 
  Heart, 
  Brain, 
  Lightbulb,
  TrendingUp,
  Clock,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  Crown
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfDay, isToday, isYesterday } from "date-fns";
import { useSession } from "@/lib/hooks/use-session";
import { getFeatureLimits, checkJournalLimit } from "@/lib/session-limits";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood: number;
  tags: string[];
  createdAt: Date;
  insights?: string[];
}

export default function JournalingPage() {
  const { user, isAuthenticated } = useSession();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState("");
  const [entryTitle, setEntryTitle] = useState("");
  const [mood, setMood] = useState(5);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saved, setSaved] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMood, setFilterMood] = useState<number | null>(null);
  const [userTier, setUserTier] = useState<"free" | "premium">("free");
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);

  const moodLabels = [
    "😔 Very Low", "😟 Low", "😐 Neutral", "😊 Good", "😄 Great", "🤩 Excellent"
  ];

  const commonTags = ["gratitude", "anxiety", "work", "relationships", "health", "goals", "reflection"];

  useEffect(() => {
    const loadJournalEntries = async () => {
      try {
        // First load from localStorage for immediate display
        const savedEntries = localStorage.getItem("journalEntries");
        if (savedEntries) {
          const localEntries = JSON.parse(savedEntries).map((entry: any) => ({
            ...entry,
            createdAt: new Date(entry.createdAt)
          }));
          setEntries(localEntries);
        }

        // Then load from backend if authenticated
        if (isAuthenticated) {
          const { backendService } = await import("@/lib/api/backend-service");
          const response = await backendService.getJournalEntries();
          
          if (response.success && response.data) {
            setBackendConnected(true);
            const backendEntries = response.data.map((entry: any) => ({
              id: entry._id,
              title: entry.title,
              content: entry.content,
              mood: entry.mood,
              tags: entry.tags || [],
              createdAt: new Date(entry.createdAt),
              insights: entry.insights || []
            }));
            
            // Merge with local entries (backend takes precedence)
            const mergedEntries = [...backendEntries];
            setEntries(mergedEntries);
            
            // Update localStorage with backend data
            localStorage.setItem("journalEntries", JSON.stringify(mergedEntries));
          } else {
            setBackendConnected(false);
          }
        }
      } catch (error) {
        console.error("Failed to load journal entries:", error);
        setBackendConnected(false);
        // Continue with localStorage data if backend fails
      }
    };

    loadJournalEntries();
  }, [isAuthenticated]);

  const saveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem("journalEntries", JSON.stringify(newEntries));
  };

  const handleSave = async () => {
    if (!currentEntry.trim()) return;

    // Check journal limits for free users
    if (userTier === "free") {
      const currentEntriesThisWeek = entries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      }).length;
      
      const limitCheck = checkJournalLimit(userTier, currentEntriesThisWeek);
      
      if (!limitCheck.canStart) {
        toast.error(limitCheck.reason);
        return;
      }
    }

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      title: entryTitle || `Entry ${format(new Date(), "MMM dd, yyyy")}`,
      content: currentEntry,
      mood,
      tags,
      createdAt: new Date(),
      insights: userTier === "premium" ? generateInsights(currentEntry, mood) : undefined
    };

    const updatedEntries = [newEntry, ...entries];
    saveEntries(updatedEntries);
    
            // Add to memory system for therapy context
        try {
          const { userMemoryManager } = await import("@/lib/memory/user-memory");
          await userMemoryManager.addJournalEntry({
            date: new Date(),
            mood,
            content: currentEntry,
            tags,
            keyThemes: [],
            emotionalState: "",
            concerns: [],
            achievements: [],
            insights: []
          });
        } catch (error) {
          console.error("Failed to add journal entry to memory:", error);
        }

        // Save to backend
        try {
          const { backendService } = await import("@/lib/api/backend-service");
          await backendService.createJournalEntry({
            title: entryTitle || `Entry ${format(new Date(), "MMM dd, yyyy")}`,
            content: currentEntry,
            mood,
            tags,
            createdAt: new Date(),
            insights: generateInsights(currentEntry, mood)
          });
        } catch (error) {
          console.error("Failed to save journal entry to backend:", error);
        }
    
    setCurrentEntry("");
    setEntryTitle("");
    setMood(5);
    setTags([]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const generateInsights = (content: string, mood: number): string[] => {
    const insights = [];
    
    if (content.toLowerCase().includes("grateful") || content.toLowerCase().includes("thankful")) {
      insights.push("Gratitude practice detected - great for mental well-being!");
    }
    
    if (mood <= 3) {
      insights.push("Consider reaching out to a support system or trying a relaxation technique.");
    }
    
    if (content.toLowerCase().includes("goal") || content.toLowerCase().includes("plan")) {
      insights.push("Goal-setting mindset - keep up the positive planning!");
    }
    
    if (content.length > 200) {
      insights.push("Detailed reflection - this depth of thinking is valuable for self-awareness.");
    }
    
    return insights;
  };

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const deleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
    if (selectedEntry?.id === id) {
      setSelectedEntry(null);
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMood = filterMood === null || entry.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  const getMoodColor = (moodValue: number) => {
    if (moodValue <= 2) return "text-red-500";
    if (moodValue <= 4) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            AI Journal
          </h1>
          {/* Backend Connection Status */}
          {backendConnected !== null && (
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              backendConnected 
                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                backendConnected ? 'bg-green-500' : 'bg-yellow-500'
              }`} />
              {backendConnected ? 'Cloud Sync' : 'Local Only'}
            </div>
          )}
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Write freely, reflect deeply, and discover insights about your mental well-being
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* New Entry Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <NotebookPen className="w-5 h-5 text-primary" />
                {selectedEntry ? "Edit Entry" : "New Entry"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title (optional)</label>
                <input
                  type="text"
                  value={entryTitle}
                  onChange={(e) => setEntryTitle(e.target.value)}
                  placeholder="Give your entry a title..."
                  className="w-full p-3 rounded-md border bg-background"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">How are you feeling today?</label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">😔</span>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={mood}
                    onChange={(e) => setMood(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">🤩</span>
                  <span className={`text-sm font-medium ${getMoodColor(mood)}`}>
                    {moodLabels[mood - 1]}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(newTag);
                        setNewTag("");
                      }
                    }}
                    placeholder="Add a tag..."
                    className="flex-1 p-2 rounded-md border bg-background text-sm"
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      addTag(newTag);
                      setNewTag("");
                    }}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {commonTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => addTag(tag)}
                      className="text-xs px-2 py-1 rounded-full bg-muted hover:bg-primary/20 transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What's on your mind?</label>
                <textarea
                  value={currentEntry}
                  onChange={(e) => {
                    setCurrentEntry(e.target.value);
                    setSaved(false);
                  }}
                  placeholder="Write freely about your thoughts, feelings, experiences, or anything else on your mind..."
                  className="w-full min-h-[300px] rounded-md border p-3 bg-background resize-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={!currentEntry.trim()}
                    className="bg-primary/90 hover:bg-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Entry
                  </Button>
                  {saved && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm text-green-600 flex items-center gap-1"
                    >
                      ✓ Saved!
                    </motion.span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentEntry.length} characters
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entries List */}
        <div className="space-y-6">
          {/* Search and Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Entries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search entries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-md border bg-background text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Filter by mood</label>
                <select
                  value={filterMood || ""}
                  onChange={(e) => setFilterMood(e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-2 rounded-md border bg-background text-sm"
                >
                  <option value="">All moods</option>
                  {moodLabels.map((label, index) => (
                    <option key={index} value={index + 1}>{label}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Entries */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            <AnimatePresence>
              {filteredEntries.map((entry) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedEntry?.id === entry.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-sm line-clamp-1">{entry.title}</h3>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEntry(entry.id);
                            }}
                            className="text-muted-foreground hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {entry.content}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className={getMoodColor(entry.mood)}>
                            {moodLabels[entry.mood - 1].split(' ')[0]}
                          </span>
                          <Clock className="w-3 h-3" />
                          {isToday(entry.createdAt) ? 'Today' : 
                           isYesterday(entry.createdAt) ? 'Yesterday' : 
                           format(entry.createdAt, 'MMM dd')}
                        </div>
                        {entry.insights && entry.insights.length > 0 && (
                          <Lightbulb className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                      
                      {entry.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {entry.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {entry.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{entry.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {filteredEntries.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <NotebookPen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No entries found</p>
                <p className="text-sm">Start writing your first entry!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Entry Details Modal */}
      <AnimatePresence>
        {selectedEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedEntry(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedEntry.title}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedEntry(null)}
                    >
                      ×
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className={getMoodColor(selectedEntry.mood)}>
                      {moodLabels[selectedEntry.mood - 1]}
                    </span>
                    <span>{format(selectedEntry.createdAt, 'MMMM dd, yyyy')}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Entry</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {selectedEntry.content}
                    </p>
                  </div>
                  
                  {selectedEntry.tags.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEntry.tags.map(tag => (
                          <Badge key={tag} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {selectedEntry.insights && selectedEntry.insights.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-yellow-500" />
                        AI Insights
                      </h4>
                      <div className="space-y-2">
                        {selectedEntry.insights.map((insight, index) => (
                          <div key={index} className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                            <p className="text-sm">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


