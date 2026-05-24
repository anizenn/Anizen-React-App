export const TRENDING_QUERY = `
  query GetTrending($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
        relations {
          edges {
            node {
              id
              title { romaji english native }
              coverImage { large }
              format episodes status
            }
            relationType
          }
        }
        recommendations {
          edges {
            node {
              mediaRecommendation {
                id
                title { romaji english native }
                coverImage { large }
                format episodes averageScore
              }
            }
          }
        }
      }
    }
  }
`;
export const POPULAR_QUERY = `
  query GetPopular($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const TOP_RATED_QUERY = `
  query GetTopRated($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const AIRING_QUERY = `
  query GetAiring($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      airingSchedules(sort: TIME_DESC) {
        airingAt episode
        media {
          id
          title { romaji english native }
          coverImage { large extraLarge }
          bannerImage description format episodes status averageScore genres
          studios { nodes { name } }
          seasonYear season
          startDate { year month day }
          endDate { year month day }
          duration
        }
      }
    }
  }
`;
export const RELEASING_QUERY = `
  query GetReleasing($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total currentPage lastPage }
      media(type: ANIME, status: RELEASING, sort: TRENDING_DESC, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const UPCOMING_QUERY = `
  query GetUpcoming($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(type: ANIME, sort: POPULARITY_DESC, status: NOT_YET_RELEASED, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const RECENTLY_ADDED_QUERY = `
  query GetRecentlyAdded($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(type: ANIME, sort: ID_DESC, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const COMPLETED_QUERY = `
  query GetCompleted($page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total }
      media(type: ANIME, sort: POPULARITY_DESC, status: FINISHED, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const ANIME_DETAIL_QUERY = `
  query GetAnimeDetail($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      coverImage { large extraLarge medium color }
      bannerImage description format episodes status averageScore genres
      studios { nodes { name } }
      seasonYear season
      startDate { year month day }
      endDate { year month day }
      duration source synonyms
      relations {
        edges {
          node {
            id
            title { romaji english native }
            coverImage { large }
            format episodes status
          }
          relationType
        }
      }
      recommendations {
        edges {
          node {
            mediaRecommendation {
              id
              title { romaji english native }
              coverImage { large }
              format episodes averageScore
            }
          }
        }
      }
      characters {
        edges {
          node {
            id
            name { full native }
            image { large medium }
          }
          voiceActors {
            id
            name { full native }
            image { large medium }
            language
          }
          role
        }
      }
      externalLinks { id url type site }
      streamingEpisodes { title thumbnail url site }
    }
  }
`;
export const SEARCH_QUERY = `
  query SearchAnime($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total currentPage lastPage }
      media(search: $search, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const SEARCH_SUGGESTION_QUERY = `
  query SearchSuggestions($search: String) {
    Page(perPage: 10) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large }
        format episodes status averageScore
      }
    }
  }
`;
export const SCHEDULE_QUERY = `
  query GetSchedule($airingAtGreater: Int, $airingAtLess: Int, $perPage: Int) {
    Page(perPage: $perPage) {
      airingSchedules(
        airingAt_greater: $airingAtGreater
        airingAt_lesser: $airingAtLess
        sort: TIME
      ) {
        airingAt episode
        media {
          id
          title { romaji english native }
          coverImage { large }
          format episodes status genres
          studios { nodes { name } }
          seasonYear season duration
        }
      }
    }
  }
`;
export const WEEKLY_SCHEDULE_QUERY = `
  query GetWeeklySchedule($airingAtGreater: Int, $airingAtLess: Int) {
    Page(perPage: 50) {
      airingSchedules(
        airingAt_greater: $airingAtGreater
        airingAt_lesser: $airingAtLess
        sort: TIME
      ) {
        airingAt episode
        media {
          id
          title { romaji english native }
          coverImage { large }
          format episodes status genres
          studios { nodes { name } }
          seasonYear season duration
        }
      }
    }
  }
`;
export const GENRE_QUERY = `
  query GetAnimeByGenre($genres: [String], $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total currentPage lastPage }
      media(genre_in: $genres, type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const FORMAT_QUERY = `
  query GetAnimeByFormat($format: MediaFormat, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total currentPage lastPage }
      media(type: ANIME, format: $format, sort: POPULARITY_DESC, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const SEASON_QUERY = `
  query GetAnimeBySeason($season: MediaSeason, $year: Int, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total currentPage lastPage }
      media(type: ANIME, season: $season, seasonYear: $year, sort: POPULARITY_DESC, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const ATOZ_QUERY = `
  query GetAtoZ($page: Int, $perPage: Int, $search: String) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage total currentPage lastPage }
      media(
        type: ANIME
        sort: TITLE_ROMAJI
        isAdult: false
        search: $search
      ) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const CHARACTERS_QUERY = `
  query GetAnimeCharacters($id: Int, $page: Int, $perPage: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      characters(page: $page, perPage: $perPage) {
        pageInfo { total currentPage lastPage hasNextPage }
        edges {
          node {
            id
            name { full native first last }
            image { large medium }
            description
          }
          voiceActors {
            id
            name { full native first last }
            image { large medium }
            language age gender description
          }
          role
        }
      }
    }
  }
`;
export const STAFF_QUERY = `
  query GetAnimeStaff($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title { romaji english native }
      staff {
        edges {
          node {
            id
            name { full native first last }
            image { large medium }
            description age gender homeTown siteUrl
          }
          role
        }
      }
    }
  }
`;
export const ALL_GENRES_QUERY = `
  query GetAllGenres {
    GenreCollection
  }
`;
export const RANDOM_QUERY = `
  query GetRandomAnime {
    Page(page: 1, perPage: 1) {
      media(type: ANIME, sort: SCORE_DESC, isAdult: false) {
        id
        title { romaji english native }
        coverImage { large extraLarge }
        bannerImage description format episodes status averageScore genres
        studios { nodes { name } }
        seasonYear season
        startDate { year month day }
        endDate { year month day }
        duration
      }
    }
  }
`;
export const STREAMING_EPISODES_QUERY = `
  query GetStreamingEpisodes($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      episodes
      streamingEpisodes { title thumbnail url site }
    }
  }
`;
