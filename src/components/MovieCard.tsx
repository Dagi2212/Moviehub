import React from 'react';
import { Star, Play, Plus, Check, Heart } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string[];
  poster: string;
  backdrop?: string;
}

interface MovieCardProps {
  movie: Movie;
  onCardClick: () => void;
  onAddToWatchlist?: () => void;
  onAddToFavorites?: () => void;
  isInWatchlist?: boolean;
  isInFavorites?: boolean;
  showActions?: boolean;
}

export function MovieCard({
  movie,
  onCardClick,
  onAddToWatchlist,
  onAddToFavorites,
  isInWatchlist = false,
  isInFavorites = false,
  showActions = true
}: MovieCardProps) {
  return (
    <Card className="group overflow-hidden bg-card/50 backdrop-blur border-0 hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
      <div className="relative aspect-[2/3] overflow-hidden" onClick={onCardClick}>
        <ImageWithFallback
          src={movie.poster}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 bg-yellow-500/20 backdrop-blur-sm px-2 py-1 rounded">
                <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                <span className="text-sm text-white">{movie.rating.toFixed(1)}</span>
              </div>
              <span className="text-sm text-white/80">{movie.year}</span>
            </div>
            {showActions && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-white/90 hover:bg-white text-black"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCardClick();
                  }}
                >
                  <Play className="w-4 h-4 mr-1" />
                  Details
                </Button>
                <Button
                  size="icon"
                  variant={isInWatchlist ? "default" : "secondary"}
                  className={isInWatchlist ? "bg-primary" : "bg-white/20 hover:bg-white/30"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToWatchlist?.();
                  }}
                >
                  {isInWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant={isInFavorites ? "default" : "secondary"}
                  className={isInFavorites ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToFavorites?.();
                  }}
                >
                  <Heart className={`w-4 h-4 ${isInFavorites ? 'fill-white' : ''}`} />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <CardContent className="p-3">
        <h3 className="line-clamp-1 mb-1">{movie.title}</h3>
        <div className="flex flex-wrap gap-1">
          {movie.genre.slice(0, 2).map(genre => (
            <Badge key={genre} variant="secondary" className="text-xs px-1.5 py-0">
              {genre}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
