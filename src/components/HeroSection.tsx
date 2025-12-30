import React from 'react';
import { Play, Plus, Info, Star } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string[];
  runtime?: number;
  synopsis: string;
  backdrop?: string;
}

interface HeroSectionProps {
  movie: Movie;
  onPlayClick: () => void;
  onAddToWatchlist: () => void;
  isInWatchlist?: boolean;
}

export function HeroSection({ movie, onPlayClick, onAddToWatchlist, isInWatchlist }: HeroSectionProps) {
  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      <div className="absolute inset-0">
        <ImageWithFallback
          src={movie.backdrop || movie.poster || 'https://images.unsplash.com/photo-1621276336795-925346853745?w=1920&h=1080&fit=crop'}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>
      
      <div className="relative container mx-auto px-4 h-full flex items-end pb-16 md:pb-24">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="secondary" className="bg-red-600 hover:bg-red-600 text-white">
              Featured
            </Badge>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
              <span className="text-white">{movie.rating.toFixed(1)}/10</span>
            </div>
            <span className="text-white/80">{movie.year}</span>
            {movie.runtime && (
              <span className="text-white/80">{movie.runtime} min</span>
            )}
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl mb-4 text-white">
            {movie.title}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {movie.genre.map(genre => (
              <Badge key={genre} variant="outline" className="border-white/30 text-white">
                {genre}
              </Badge>
            ))}
          </div>
          
          <p className="text-lg text-white/90 mb-8 line-clamp-3">
            {movie.synopsis}
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-white/90"
              onClick={onPlayClick}
            >
              <Play className="w-5 h-5 mr-2 fill-black" />
              Watch Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10"
              onClick={onAddToWatchlist}
            >
              {isInWatchlist ? (
                <>
                  <Info className="w-5 h-5 mr-2" />
                  In Watchlist
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" />
                  Add to Watchlist
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
