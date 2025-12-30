// TMDb API Configuration
// To use real data, get your API key from https://www.themoviedb.org/settings/api
const TMDB_API_KEY = 'YOUR_TMDB_API_KEY_HERE';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export interface TMDbMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
  adult: boolean;
  original_language: string;
  original_title: string;
  video: boolean;
}

export interface MovieDetails extends TMDbMovie {
  runtime: number;
  genres: { id: number; name: string }[];
  production_companies: { id: number; name: string; logo_path: string | null }[];
  status: string;
  tagline: string;
  budget: number;
  revenue: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

// Genre mapping
export const GENRES: { [key: number]: string } = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

export function getPosterUrl(path: string | null, size: 'w200' | 'w300' | 'w500' | 'original' = 'w500'): string {
  if (!path) return 'https://images.unsplash.com/photo-1620153850780-0883dd907257?w=500&h=750&fit=crop';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getBackdropUrl(path: string | null, size: 'w780' | 'w1280' | 'original' = 'w1280'): string {
  if (!path) return 'https://images.unsplash.com/photo-1621276336795-925346853745?w=1920&h=1080&fit=crop';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function getGenreNames(genreIds: number[]): string[] {
  return genreIds.map(id => GENRES[id] || 'Unknown').filter(Boolean);
}

// Mock data for development (when API key is not set)
export function useMockData(): boolean {
  return TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE';
}

// Fetch functions (will use mock data if API key not set)
export async function fetchTrending(): Promise<TMDbMovie[]> {
  if (useMockData()) {
    return getMockMovies().filter(m => m.popularity > 80);
  }
  
  const response = await fetch(
    `${TMDB_BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}`
  );
  const data = await response.json();
  return data.results;
}

export async function fetchPopular(): Promise<TMDbMovie[]> {
  if (useMockData()) {
    return getMockMovies().filter(m => m.vote_count > 5000);
  }
  
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}`
  );
  const data = await response.json();
  return data.results;
}

export async function fetchTopRated(): Promise<TMDbMovie[]> {
  if (useMockData()) {
    return getMockMovies().filter(m => m.vote_average > 8.0);
  }
  
  const response = await fetch(
    `${TMDB_BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}`
  );
  const data = await response.json();
  return data.results;
}

export async function searchMovies(query: string): Promise<TMDbMovie[]> {
  if (useMockData()) {
    const movies = getMockMovies();
    return movies.filter(m => 
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.overview.toLowerCase().includes(query.toLowerCase())
    );
  }
  
  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.results;
}

// Mock movie data for development
function getMockMovies(): TMDbMovie[] {
  return [
    {
      id: 550,
      title: "Fight Club",
      overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdrop_path: "/hZkgoQYus5vegHoetLkCJzb17zJ.jpg",
      release_date: "1999-10-15",
      vote_average: 8.4,
      vote_count: 27000,
      genre_ids: [18, 53],
      popularity: 95,
      adult: false,
      original_language: "en",
      original_title: "Fight Club",
      video: false
    },
    {
      id: 13,
      title: "Forrest Gump",
      overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events.",
      poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      backdrop_path: "/3h1JZGDhZ8nzxdgvkxha0qBqi05.jpg",
      release_date: "1994-07-06",
      vote_average: 8.5,
      vote_count: 25000,
      genre_ids: [35, 18, 10749],
      popularity: 88,
      adult: false,
      original_language: "en",
      original_title: "Forrest Gump",
      video: false
    },
    {
      id: 155,
      title: "The Dark Knight",
      overview: "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and District Attorney Harvey Dent.",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdrop_path: "/hkBaDkMWbLaf8B1lsWsKX7Ew3Xq.jpg",
      release_date: "2008-07-18",
      vote_average: 9.0,
      vote_count: 30000,
      genre_ids: [28, 80, 18, 53],
      popularity: 92,
      adult: false,
      original_language: "en",
      original_title: "The Dark Knight",
      video: false
    },
    {
      id: 27205,
      title: "Inception",
      overview: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.",
      poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
      backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
      release_date: "2010-07-16",
      vote_average: 8.8,
      vote_count: 33000,
      genre_ids: [28, 878, 53],
      popularity: 90,
      adult: false,
      original_language: "en",
      original_title: "Inception",
      video: false
    },
    {
      id: 278,
      title: "The Shawshank Redemption",
      overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      backdrop_path: "/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg",
      release_date: "1994-09-23",
      vote_average: 8.7,
      vote_count: 24000,
      genre_ids: [18, 80],
      popularity: 85,
      adult: false,
      original_language: "en",
      original_title: "The Shawshank Redemption",
      video: false
    },
    {
      id: 424,
      title: "Schindler's List",
      overview: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce.",
      poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
      backdrop_path: "/loRmRzQXZeqG78TqZuyvSlEQfZb.jpg",
      release_date: "1993-12-15",
      vote_average: 8.6,
      vote_count: 14000,
      genre_ids: [18, 36, 10752],
      popularity: 75,
      adult: false,
      original_language: "en",
      original_title: "Schindler's List",
      video: false
    },
    {
      id: 680,
      title: "Pulp Fiction",
      overview: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      backdrop_path: "/suaEOtk1N1sgg2MTM7oZd2cfVp3.jpg",
      release_date: "1994-09-10",
      vote_average: 8.9,
      vote_count: 26000,
      genre_ids: [53, 80],
      popularity: 87,
      adult: false,
      original_language: "en",
      original_title: "Pulp Fiction",
      video: false
    },
    {
      id: 129,
      title: "Spirited Away",
      overview: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits.",
      poster_path: "/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
      backdrop_path: "/Ab8mkHmkYADjU7wQiOkia9BzGvS.jpg",
      release_date: "2001-07-20",
      vote_average: 8.5,
      vote_count: 14000,
      genre_ids: [16, 10751, 14],
      popularity: 82,
      adult: false,
      original_language: "ja",
      original_title: "千と千尋の神隠し",
      video: false
    },
    {
      id: 497,
      title: "The Green Mile",
      overview: "The lives of guards on Death Row are affected by one of their charges: a black man accused of child murder and rape.",
      poster_path: "/velWPhVMQeQKcxggNEU8YmIo52R.jpg",
      backdrop_path: "/l6hQWH9eDksNJNiXWYRkWqikOdu.jpg",
      release_date: "1999-12-10",
      vote_average: 8.5,
      vote_count: 15000,
      genre_ids: [14, 18, 80],
      popularity: 78,
      adult: false,
      original_language: "en",
      original_title: "The Green Mile",
      video: false
    },
    {
      id: 122,
      title: "The Lord of the Rings: The Return of the King",
      overview: "Gandalf and Aragorn lead the World of Men against Sauron's army to draw his gaze from Frodo and Sam.",
      poster_path: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
      backdrop_path: "/2u7zbn8EudG6kLlBzUYqP8RyFU4.jpg",
      release_date: "2003-12-17",
      vote_average: 8.5,
      vote_count: 22000,
      genre_ids: [12, 14, 28],
      popularity: 89,
      adult: false,
      original_language: "en",
      original_title: "The Lord of the Rings: The Return of the King",
      video: false
    },
    {
      id: 389,
      title: "12 Angry Men",
      overview: "A jury holdout attempts to prevent a miscarriage of justice by forcing his colleagues to reconsider the evidence.",
      poster_path: "/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg",
      backdrop_path: "/l6hQWH9eDksNJNiXWYRkWqikOdu.jpg",
      release_date: "1957-04-10",
      vote_average: 8.5,
      vote_count: 7000,
      genre_ids: [18],
      popularity: 70,
      adult: false,
      original_language: "en",
      original_title: "12 Angry Men",
      video: false
    },
    {
      id: 19404,
      title: "Dilwale Dulhania Le Jayenge",
      overview: "When Raj meets Simran in Europe, it isn't love at first sight but when Simran moves to India, Raj follows.",
      poster_path: "/2CAL2433ZeIihfX1Hb2139CX0pW.jpg",
      backdrop_path: "/90ez6ArvpO8bvpyIngBuwXOqJm5.jpg",
      release_date: "1995-10-20",
      vote_average: 8.7,
      vote_count: 4000,
      genre_ids: [35, 18, 10749],
      popularity: 65,
      adult: false,
      original_language: "hi",
      original_title: "दिलवाले दुल्हनिया ले जायेंगे",
      video: false
    }
  ];
}
