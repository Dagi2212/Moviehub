import React from 'react';
import { Film, Heart, Bookmark, Eye } from 'lucide-react';
import { Button } from './ui/button';

interface EmptyStateProps {
  type: 'watchlist' | 'favorites' | 'watched' | 'search';
  onAction?: () => void;
}

export function EmptyStateComponent({ type, onAction }: EmptyStateProps) {
  const configs = {
    watchlist: {
      icon: Bookmark,
      title: 'Your Watchlist is Empty',
      description: 'Start building your watchlist by adding movies you want to watch later.',
      actionText: 'Explore Movies'
    },
    favorites: {
      icon: Heart,
      title: 'No Favorites Yet',
      description: 'Mark your favorite movies with a heart to see them here.',
      actionText: 'Discover Movies'
    },
    watched: {
      icon: Eye,
      title: 'No Watched Movies',
      description: 'Keep track of the movies you\'ve watched by marking them as watched.',
      actionText: 'Browse Movies'
    },
    search: {
      icon: Film,
      title: 'No Movies Found',
      description: 'We couldn\'t find any movies matching your search. Try different keywords or filters.',
      actionText: 'Clear Filters'
    }
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-6">
        <Icon className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-2xl mb-3 text-center">{config.title}</h3>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        {config.description}
      </p>
      {onAction && (
        <Button onClick={onAction} size="lg">
          {config.actionText}
        </Button>
      )}
    </div>
  );
}
