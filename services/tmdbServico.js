// Serviço para interagir com a API do TMDB
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL;
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL;

class ServicoTMDB {
  static async buscarFilmes(consulta) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(consulta)}&language=pt-BR`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar filmes');
      }
      
      const data = await response.json();
      return data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        originalTitle: movie.original_title,
        posterPath: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
        backdropPath: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : null,
        overview: movie.overview,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
        genres: movie.genre_ids
      }));
    } catch (error) {
      console.error('Erro ao buscar filmes:', error);
      throw error;
    }
  }

  static async obterDetalhesFilme(idFilme) {
    try {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${idFilme}?api_key=${TMDB_API_KEY}&language=pt-BR`
      );
      
      if (!response.ok) {
        throw new Error('Erro ao buscar detalhes do filme');
      }
      
      const movie = await response.json();
      return {
        id: movie.id,
        title: movie.title,
        originalTitle: movie.original_title,
        posterPath: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : null,
        backdropPath: movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : null,
        overview: movie.overview,
        releaseDate: movie.release_date,
        voteAverage: movie.vote_average,
        genres: movie.genres,
        runtime: movie.runtime
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do filme:', error);
      throw error;
    }
  }
}

export default ServicoTMDB;
