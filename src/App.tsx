import React, { useState, useEffect } from 'react';
import { Search, Menu, X, User, LogIn, Moon, Sun, Home, Bookmark, Heart, TrendingUp, Star as StarIcon, Film } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Badge } from './components/ui/badge';
import { HeroSection } from './components/HeroSection';
import { MovieCarousel } from './components/MovieCarousel';
import { MovieCard } from './components/MovieCard';
import { EmptyStateComponent } from './components/EmptyStateComponent';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import {
  TMDbMovie,
  fetchTrending,
  fetchPopular,
  fetchTopRated,
  searchMovies,
  getPosterUrl,
  getBackdropUrl,
  getGenreNames,
  GENRES
} from './lib/tmdb';

// Transform TMDb movie to our app format
interface Movie {
  id: number;
  title: string;
  year: number;
  rating: number;
  genre: string[];
  runtime?: number;
  director?: string;
  cast?: string[];
  synopsis: string;
  poster: string;
  backdrop?: string;
  voteCount: number;
}

function transformMovie(tmdbMovie: TMDbMovie): Movie {
  return {
    id: tmdbMovie.id,
    title: tmdbMovie.title,
    year: new Date(tmdbMovie.release_date).getFullYear() || 0,
    rating: tmdbMovie.vote_average,
    genre: getGenreNames(tmdbMovie.genre_ids),
    synopsis: tmdbMovie.overview,
    poster: getPosterUrl(tmdbMovie.poster_path),
    backdrop: getBackdropUrl(tmdbMovie.backdrop_path),
    voteCount: tmdbMovie.vote_count
  };
}

type ViewType = 'home' | 'search' | 'details' | 'lists';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isDark, setIsDark] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  
  // Movie data
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // User lists (stored in localStorage for now)
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [watched, setWatched] = useState<number[]>([]);
  
  // Filters
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('popularity');

  // Load user lists from localStorage
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    const savedFavorites = localStorage.getItem('favorites');
    const savedWatched = localStorage.getItem('watched');
    
    if (savedWatchlist) setWatchlist(JSON.parse(savedWatchlist));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedWatched) setWatched(JSON.parse(savedWatched));
  }, []);

  // Save user lists to localStorage
  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('watched', JSON.stringify(watched));
  }, [watched]);

  // Load movies on mount
  useEffect(() => {
    loadMovies();
  }, []);

  // Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const loadMovies = async () => {
    setIsLoading(true);
    try {
      const [trending, popular, topRated] = await Promise.all([
        fetchTrending(),
        fetchPopular(),
        fetchTopRated()
      ]);
      
      setTrendingMovies(trending.map(transformMovie));
      setPopularMovies(popular.map(transformMovie));
      setTopRatedMovies(topRated.map(transformMovie));
    } catch (error) {
      console.error('Error loading movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setSearchQuery(query);
    setIsLoading(true);
    try {
      const results = await searchMovies(query);
      setSearchResults(results.map(transformMovie));
      setCurrentView('search');
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleList = (movieId: number, listType: 'watchlist' | 'favorites' | 'watched') => {
    const setters = {
      watchlist: setWatchlist,
      favorites: setFavorites,
      watched: setWatched
    };
    
    const lists = { watchlist, favorites, watched };
    const currentList = lists[listType];
    const setter = setters[listType];
    
    if (currentList.includes(movieId)) {
      setter(currentList.filter(id => id !== movieId));
    } else {
      setter([...currentList, movieId]);
    }
  };

  const getFilteredAndSortedMovies = (movies: Movie[]) => {
    let filtered = [...movies];
    
    // Genre filter
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(movie => 
        movie.genre.some(g => g.toLowerCase() === selectedGenre.toLowerCase())
      );
    }
    
    // Year filter
    if (selectedYear !== 'all') {
      const [startYear, endYear] = selectedYear.split('-').map(Number);
      filtered = filtered.filter(movie => 
        movie.year >= startYear && movie.year <= endYear
      );
    }
    
    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'year':
          return b.year - a.year;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return b.voteCount - a.voteCount;
      }
    });
    
    return filtered;
  };

  const getMoviesFromList = (listType: 'watchlist' | 'favorites' | 'watched'): Movie[] => {
    const listIds = { watchlist, favorites, watched }[listType];
    const allMovies = [...trendingMovies, ...popularMovies, ...topRatedMovies];
    const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());
    return uniqueMovies.filter(movie => listIds.includes(movie.id));
  };

  // Header Component
  const Header = () => (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Film className="w-8 h-8 text-red-600" />
              <span className="text-xl font-semibold text-white hidden sm:block">MovieHub</span>
            </button>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Button
                variant="ghost"
                className={`text-white hover:text-white/80 ${currentView === 'home' ? 'bg-white/10' : ''}`}
                onClick={() => setCurrentView('home')}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant="ghost"
                className={`text-white hover:text-white/80 ${currentView === 'lists' ? 'bg-white/10' : ''}`}
                onClick={() => setCurrentView('lists')}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                My Lists
              </Button>
            </nav>
          </div>

          {/* Search and Actions */}
          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
              <Input
                type="text"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="pl-10 w-64 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              />
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDark(!isDark)}
              className="text-white hover:bg-white/10"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10 md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="sm:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
            <Input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              className="pl-10 w-full bg-white/10 border-white/20 text-white placeholder:text-white/60"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col gap-2">
              <Button
                variant="ghost"
                className="justify-start text-white hover:bg-white/10"
                onClick={() => {
                  setCurrentView('home');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-white hover:bg-white/10"
                onClick={() => {
                  setCurrentView('lists');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                My Lists
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );

  // Home Page
  const HomePage = () => {
    const heroMovie = trendingMovies[0] || popularMovies[0];

    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <Header />
        
        {heroMovie && (
          <HeroSection
            movie={heroMovie}
            onPlayClick={() => {
              setSelectedMovie(heroMovie);
              setCurrentView('details');
            }}
            onAddToWatchlist={() => toggleList(heroMovie.id, 'watchlist')}
            isInWatchlist={watchlist.includes(heroMovie.id)}
          />
        )}

        <div className="container mx-auto px-4 py-12 space-y-8">
          <MovieCarousel
            title="Trending Now"
            movies={trendingMovies}
            onMovieClick={(movie) => {
              setSelectedMovie(movie);
              setCurrentView('details');
            }}
            onAddToWatchlist={(id) => toggleList(id, 'watchlist')}
            onAddToFavorites={(id) => toggleList(id, 'favorites')}
            watchlistIds={watchlist}
            favoritesIds={favorites}
          />

          <MovieCarousel
            title="Popular on MovieHub"
            movies={popularMovies}
            onMovieClick={(movie) => {
              setSelectedMovie(movie);
              setCurrentView('details');
            }}
            onAddToWatchlist={(id) => toggleList(id, 'watchlist')}
            onAddToFavorites={(id) => toggleList(id, 'favorites')}
            watchlistIds={watchlist}
            favoritesIds={favorites}
          />

          <MovieCarousel
            title="Top Rated Movies"
            movies={topRatedMovies}
            onMovieClick={(movie) => {
              setSelectedMovie(movie);
              setCurrentView('details');
            }}
            onAddToWatchlist={(id) => toggleList(id, 'watchlist')}
            onAddToFavorites={(id) => toggleList(id, 'favorites')}
            watchlistIds={watchlist}
            favoritesIds={favorites}
          />
        </div>

        <Footer />
      </div>
    );
  };

  // Search Page
  const SearchPage = () => {
    const filteredMovies = getFilteredAndSortedMovies(searchResults);

    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl mb-2 text-white">
              Search Results for "{searchQuery}"
            </h1>
            <p className="text-white/60">{filteredMovies.length} movies found</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All Genres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {Object.values(GENRES).sort().map(genre => (
                  <SelectItem key={genre} value={genre.toLowerCase()}>{genre}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="All Years" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Years</SelectItem>
                <SelectItem value="2020-2024">2020-2024</SelectItem>
                <SelectItem value="2015-2019">2015-2019</SelectItem>
                <SelectItem value="2010-2014">2010-2014</SelectItem>
                <SelectItem value="2000-2009">2000-2009</SelectItem>
                <SelectItem value="1990-1999">1990-1999</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Grid */}
          {filteredMovies.length === 0 ? (
            <EmptyStateComponent
              type="search"
              onAction={() => {
                setSelectedGenre('all');
                setSelectedYear('all');
              }}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredMovies.map(movie => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onCardClick={() => {
                    setSelectedMovie(movie);
                    setCurrentView('details');
                  }}
                  onAddToWatchlist={() => toggleList(movie.id, 'watchlist')}
                  onAddToFavorites={() => toggleList(movie.id, 'favorites')}
                  isInWatchlist={watchlist.includes(movie.id)}
                  isInFavorites={favorites.includes(movie.id)}
                />
              ))}
            </div>
          )}
        </div>

        <Footer />
      </div>
    );
  };

  // Lists Page
  const ListsPage = () => {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl mb-8 text-white">My Lists</h1>

          <Tabs defaultValue="watchlist" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 mb-8">
              <TabsTrigger value="watchlist" className="data-[state=active]:bg-white/20">
                <Bookmark className="w-4 h-4 mr-2" />
                Watchlist ({watchlist.length})
              </TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-white/20">
                <Heart className="w-4 h-4 mr-2" />
                Favorites ({favorites.length})
              </TabsTrigger>
              <TabsTrigger value="watched" className="data-[state=active]:bg-white/20">
                <StarIcon className="w-4 h-4 mr-2" />
                Watched ({watched.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="watchlist">
              {watchlist.length === 0 ? (
                <EmptyStateComponent
                  type="watchlist"
                  onAction={() => setCurrentView('home')}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {getMoviesFromList('watchlist').map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onCardClick={() => {
                        setSelectedMovie(movie);
                        setCurrentView('details');
                      }}
                      onAddToWatchlist={() => toggleList(movie.id, 'watchlist')}
                      onAddToFavorites={() => toggleList(movie.id, 'favorites')}
                      isInWatchlist={true}
                      isInFavorites={favorites.includes(movie.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites">
              {favorites.length === 0 ? (
                <EmptyStateComponent
                  type="favorites"
                  onAction={() => setCurrentView('home')}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {getMoviesFromList('favorites').map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onCardClick={() => {
                        setSelectedMovie(movie);
                        setCurrentView('details');
                      }}
                      onAddToWatchlist={() => toggleList(movie.id, 'watchlist')}
                      onAddToFavorites={() => toggleList(movie.id, 'favorites')}
                      isInWatchlist={watchlist.includes(movie.id)}
                      isInFavorites={true}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="watched">
              {watched.length === 0 ? (
                <EmptyStateComponent
                  type="watched"
                  onAction={() => setCurrentView('home')}
                />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {getMoviesFromList('watched').map(movie => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onCardClick={() => {
                        setSelectedMovie(movie);
                        setCurrentView('details');
                      }}
                      onAddToWatchlist={() => toggleList(movie.id, 'watchlist')}
                      onAddToFavorites={() => toggleList(movie.id, 'favorites')}
                      isInWatchlist={watchlist.includes(movie.id)}
                      isInFavorites={favorites.includes(movie.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <Footer />
      </div>
    );
  };

  // Movie Details Page
  const DetailsPage = () => {
    if (!selectedMovie) return null;

    const similarMovies = [...popularMovies, ...topRatedMovies]
      .filter(m => 
        m.id !== selectedMovie.id && 
        m.genre.some(g => selectedMovie.genre.includes(g))
      )
      .slice(0, 12);

    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
        <Header />

        {/* Backdrop Hero */}
        <div className="relative h-[50vh] md:h-[60vh]">
          <div className="absolute inset-0">
            <ImageWithFallback
              src={selectedMovie.backdrop || selectedMovie.poster}
              alt={selectedMovie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
          </div>
        </div>

        <div className="container mx-auto px-4 -mt-40 relative z-10">
          <div className="grid md:grid-cols-[300px_1fr] gap-8">
            {/* Poster */}
            <div className="hidden md:block">
              <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src={selectedMovie.poster}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Details */}
            <div className="text-white">
              <h1 className="text-4xl md:text-5xl mb-4">{selectedMovie.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded">
                  <StarIcon className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  <span className="text-lg">{selectedMovie.rating.toFixed(1)}/10</span>
                </div>
                <span className="text-white/80">{selectedMovie.year}</span>
                {selectedMovie.runtime && (
                  <span className="text-white/80">{selectedMovie.runtime} min</span>
                )}
                <Badge className="bg-white/10 hover:bg-white/20">
                  {selectedMovie.voteCount.toLocaleString()} votes
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {selectedMovie.genre.map(genre => (
                  <Badge key={genre} variant="outline" className="border-white/30 text-white">
                    {genre}
                  </Badge>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 mb-8">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90"
                >
                  <Film className="w-5 h-5 mr-2" />
                  Watch Trailer
                </Button>
                <Button
                  size="lg"
                  variant={watchlist.includes(selectedMovie.id) ? "default" : "outline"}
                  className={watchlist.includes(selectedMovie.id) ? "" : "border-white/30 text-white hover:bg-white/10"}
                  onClick={() => toggleList(selectedMovie.id, 'watchlist')}
                >
                  <Bookmark className="w-5 h-5 mr-2" />
                  {watchlist.includes(selectedMovie.id) ? 'In Watchlist' : 'Add to Watchlist'}
                </Button>
                <Button
                  size="lg"
                  variant={favorites.includes(selectedMovie.id) ? "default" : "outline"}
                  className={favorites.includes(selectedMovie.id) ? "bg-red-600 hover:bg-red-700" : "border-white/30 text-white hover:bg-white/10"}
                  onClick={() => toggleList(selectedMovie.id, 'favorites')}
                >
                  <Heart className={`w-5 h-5 mr-2 ${favorites.includes(selectedMovie.id) ? 'fill-white' : ''}`} />
                  {favorites.includes(selectedMovie.id) ? 'Favorited' : 'Add to Favorites'}
                </Button>
                <Button
                  size="lg"
                  variant={watched.includes(selectedMovie.id) ? "default" : "outline"}
                  className={watched.includes(selectedMovie.id) ? "" : "border-white/30 text-white hover:bg-white/10"}
                  onClick={() => toggleList(selectedMovie.id, 'watched')}
                >
                  <StarIcon className="w-5 h-5 mr-2" />
                  {watched.includes(selectedMovie.id) ? 'Watched' : 'Mark as Watched'}
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl mb-2">Overview</h3>
                  <p className="text-white/80 leading-relaxed">{selectedMovie.synopsis}</p>
                </div>

                {selectedMovie.director && (
                  <div>
                    <h3 className="text-xl mb-2">Director</h3>
                    <p className="text-white/80">{selectedMovie.director}</p>
                  </div>
                )}

                {selectedMovie.cast && selectedMovie.cast.length > 0 && (
                  <div>
                    <h3 className="text-xl mb-2">Cast</h3>
                    <p className="text-white/80">{selectedMovie.cast.join(', ')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Similar Movies */}
          {similarMovies.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl text-white mb-6">More Like This</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {similarMovies.map(movie => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onCardClick={() => {
                      setSelectedMovie(movie);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    onAddToWatchlist={() => toggleList(movie.id, 'watchlist')}
                    onAddToFavorites={() => toggleList(movie.id, 'favorites')}
                    isInWatchlist={watchlist.includes(movie.id)}
                    isInFavorites={favorites.includes(movie.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Footer />
      </div>
    );
  };

  // Footer Component
  const Footer = () => (
    <footer className="bg-black/50 border-t border-white/10 mt-16 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-6 h-6 text-red-600" />
              <span className="text-lg text-white">MovieHub</span>
            </div>
            <p className="text-white/60 text-sm">
              Your ultimate destination for discovering and tracking movies.
            </p>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Features</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Trending Movies</li>
              <li>Popular Titles</li>
              <li>Top Rated</li>
              <li>Personal Lists</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white mb-4">Account</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>My Watchlist</li>
              <li>Favorites</li>
              <li>Watch History</li>
              <li>Settings</li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white mb-4">About</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li>About Us</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-white/60 text-sm mb-2">
            This product uses the TMDb API but is not endorsed or certified by TMDb.
          </p>
          <p className="text-white/40 text-sm">
            © 2024 MovieHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );

  // Render current view
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'search':
        return <SearchPage />;
      case 'details':
        return <DetailsPage />;
      case 'lists':
        return <ListsPage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {renderView()}
    </div>
  );
}
