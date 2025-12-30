import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { MovieCard } from './MovieCard';

interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string[];
  poster: string;
  backdrop?: string;
}

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  onMovieClick: (movie: Movie) => void;
  onAddToWatchlist?: (movieId: number) => void;
  onAddToFavorites?: (movieId: number) => void;
  watchlistIds?: number[];
  favoritesIds?: number[];
}

export function MovieCarousel({
  title,
  movies,
  onMovieClick,
  onAddToWatchlist,
  onAddToFavorites,
  watchlistIds = [],
  favoritesIds = []
}: MovieCarouselProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="mb-12 group/carousel">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white">{title}</h2>
        <div className="flex gap-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="outline"
            className="border-white/20 hover:bg-white/10"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            className="border-white/20 hover:bg-white/10"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map(movie => (
          <div key={movie.id} className="flex-none w-[160px] md:w-[200px]">
            <MovieCard
              movie={movie}
              onCardClick={() => onMovieClick(movie)}
              onAddToWatchlist={() => onAddToWatchlist?.(movie.id)}
              onAddToFavorites={() => onAddToFavorites?.(movie.id)}
              isInWatchlist={watchlistIds.includes(movie.id)}
              isInFavorites={favoritesIds.includes(movie.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
