"use client";

import { useAudioPlayer } from "@/lib/contexts/audio-player-context";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { 
  Play, 
  Pause, 
  X, 
  Volume2, 
  VolumeX, 
  SkipForward, 
  SkipBack,
  List,
  Shuffle,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function GlobalAudioPlayer() {
  const { 
    currentTrack, 
    isPlaying, 
    isLoading,
    currentTime, 
    duration, 
    volume,
    playlist,
    currentIndex,
    togglePlayPause, 
    stop, 
    seek,
    setVolume,
    playNext,
    playPrevious,
    removeFromPlaylist,
    clearPlaylist,
    shufflePlaylist,
    play
  } = useAudioPlayer();

  const [showVolume, setShowVolume] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 && isFinite(duration) ? (currentTime / duration) * 100 : 0;
  
  console.log('Player progress:', { currentTime, duration, progress });

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-16 left-0 right-0 z-50 p-4"
        >
          <Card className="max-w-4xl mx-auto bg-background/95 backdrop-blur-lg border-primary/20 shadow-2xl">
            <div className="p-4 space-y-3">
              {/* Main Player */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl sm:text-2xl">🎵</span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">{currentTrack.category}</p>
                  {playlist.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {currentIndex + 1} / {playlist.length}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 sm:gap-2">
                  {/* Previous */}
                  {playlist.length > 0 && (
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={playPrevious} 
                      disabled={currentIndex <= 0}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <SkipBack className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  )}

                {/* Play/Pause */}
                <Button 
                  size="icon" 
                  onClick={togglePlayPause} 
                  className="h-9 w-9 sm:h-10 sm:w-10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : isPlaying ? (
                    <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </Button>

                  {/* Next */}
                  {playlist.length > 0 && (
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={playNext} 
                      disabled={currentIndex >= playlist.length - 1}
                      className="h-8 w-8 sm:h-10 sm:w-10"
                    >
                      <SkipForward className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                  )}

                  {/* Volume */}
                  <div className="relative hidden sm:block">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowVolume(!showVolume)}
                      className="h-10 w-10"
                    >
                      {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>

                    {showVolume && (
                      <div className="absolute bottom-full right-0 mb-2 p-3 bg-popover border rounded-lg shadow-lg">
                        <Slider
                          value={[volume * 100]}
                          onValueChange={(value) => setVolume(value[0] / 100)}
                          max={100}
                          step={1}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>

                  {/* Playlist Toggle */}
                  {playlist.length > 0 && (
                    <Button
                      size="icon"
                      variant={showPlaylist ? "default" : "ghost"}
                      onClick={() => setShowPlaylist(!showPlaylist)}
                      className="h-8 w-8 sm:h-10 sm:w-10 relative"
                    >
                      <List className="w-4 h-4 sm:w-5 sm:h-5" />
                      <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">
                        {playlist.length}
                      </Badge>
                    </Button>
                  )}

                  {/* Close */}
                  <Button size="icon" variant="ghost" onClick={stop} className="h-8 w-8 sm:h-10 sm:w-10">
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <Slider
                  value={[progress]}
                  onValueChange={(value) => seek((value[0] / 100) * duration)}
                  max={100}
                  step={0.1}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playlist View */}
              {showPlaylist && playlist.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t pt-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-semibold">Playlist ({playlist.length})</h5>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={shufflePlaylist} className="h-7">
                        <Shuffle className="w-3 h-3 mr-1" />
                        Shuffle
                      </Button>
                      <Button size="sm" variant="ghost" onClick={clearPlaylist} className="h-7">
                        Clear
                      </Button>
                    </div>
                  </div>
                  <ScrollArea className="h-40">
                    <div className="space-y-1">
                      {playlist.map((meditation, index) => (
                        <div
                          key={meditation._id}
                          className={`flex items-center gap-2 p-2 rounded text-sm cursor-pointer hover:bg-muted/50 ${
                            index === currentIndex ? 'bg-primary/10 text-primary' : ''
                          }`}
                          onClick={() => {
                            play(meditation);
                          }}
                        >
                          <span className="text-xs text-muted-foreground w-6">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-xs font-medium">{meditation.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{meditation.category}</p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromPlaylist(meditation._id);
                            }}
                            className="h-6 w-6 shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
