// Serviço para interagir com a API do TMDB
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '00a24a2387caf4f9fbc5178f45452d3f';
const TMDB_BASE_URL = process.env.NEXT_PUBLIC_TMDB_BASE_URL || 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = process.env.NEXT_PUBLIC_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

class ServicoTMDB {
  static async buscarFilmes(consulta) {
    try {
      console.log('🔍 Buscando filmes com:', {
        consulta,
        apiKey: TMDB_API_KEY ? 'Definida' : 'Não definida',
        baseUrl: TMDB_BASE_URL
      });

      if (!TMDB_API_KEY || TMDB_API_KEY === 'undefined') {
        throw new Error('Chave da API TMDB não está configurada');
      }

      const url = `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(consulta)}&language=pt-BR`;
      console.log('🌐 URL da requisição:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('❌ Resposta da API:', response.status, response.statusText);
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Resultados encontrados:', data.results?.length || 0);

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
      console.error('❌ Erro ao buscar filmes:', error);
      throw error;
    }
  }

  static async obterDetalhesFilme(idFilme) {
    try {
      console.log('🔍 Buscando detalhes do filme:', idFilme);

      if (!TMDB_API_KEY || TMDB_API_KEY === 'undefined') {
        throw new Error('Chave da API TMDB não está configurada');
      }

      const url = `${TMDB_BASE_URL}/movie/${idFilme}?api_key=${TMDB_API_KEY}&language=pt-BR`;
      console.log('🌐 URL da requisição:', url);

      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('❌ Resposta da API:', response.status, response.statusText);
        throw new Error(`Erro na API: ${response.status}`);
      }
      
      const movie = await response.json();
      console.log('✅ Detalhes do filme obtidos:', movie.title);

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
