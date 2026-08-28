const database = require('../config/database');

class RecommendationService {
    async getPersonalizedRecommendations(userId, limit = 10) {
        const query = `
            MATCH (u:User {id: $userId})-[:LISTENED_TO]->(s:Song)
            MATCH (s)-[:HAS_GENRE]->(g:Genre)
            MATCH (g)<-[:HAS_GENRE]-(rec:Song)
            WHERE rec <> s
            MATCH (rec)-[:BELONGS_TO]->(:Album)-[:RELEASED_BY]->(art:Artist)
            OPTIONAL MATCH (rec)-[:HAS_GENRE]->(g2:Genre)
            RETURN DISTINCT rec.id as songId, rec.title as title, rec.duration as duration,
                          rec.release_year as releaseYear, rec.popularity as popularity,
                          art.name as artistName,
                          COLLECT(DISTINCT g2.name) as genres,
                          COUNT(DISTINCT g) as genreMatchScore,
                          COUNT(DISTINCT s) as listenerCount
            ORDER BY genreMatchScore DESC, popularity DESC
            LIMIT $limit
        `;
        const params = { userId, limit };
        const records = await database.runQuery(query, params);
        return records.map(r => ({
            id: r.get('songId'),
            title: r.get('title'),
            duration: r.get('duration'),
            releaseYear: r.get('releaseYear'),
            popularity: r.get('popularity'),
            artistName: r.get('artistName'),
            genres: r.get('genres'),
            matchScore: r.get('genreMatchScore'),
            listenerCount: r.get('listenerCount')
        }));
    }

    async findSimilarArtists(userId, limit = 5) {
        const query = `
            MATCH (u:User {id: $userId})-[:LISTENED_TO]->(:Song)-[:BELONGS_TO]->(:Album)-[:RELEASED_BY]->(a:Artist)
            MATCH (a)-[:COLLABORATED_WITH*1..2]-(similar:Artist)
            WHERE similar <> a
            OPTIONAL MATCH (similar)-[:INFLUENCED_BY]->(influence:Artist)
            RETURN DISTINCT similar.id as artistId, similar.name as name,
                          similar.country as country, similar.genre as genre,
                          COUNT(*) as connectionStrength,
                          COLLECT(DISTINCT influence.id) as influences
            ORDER BY connectionStrength DESC
            LIMIT $limit
        `;
        const params = { userId, limit };
        const records = await database.runQuery(query, params);
        return records.map(r => ({
            id: r.get('artistId'),
            name: r.get('name'),
            country: r.get('country'),
            genre: r.get('genre'),
            connectionStrength: r.get('connectionStrength'),
            influences: r.get('influences')
        }));
    }

    async getCollaborativeRecommendations(userId, limit = 10) {
        const query = `
            MATCH (u1:User {id: $userId})-[:LISTENED_TO]->(s:Song)
            MATCH (s)<-[:LISTENED_TO]-(u2:User)
            WHERE u1 <> u2
            MATCH (u2)-[:LISTENED_TO]->(rec:Song)
            WHERE NOT (u1)-[:LISTENED_TO]->(rec)
            MATCH (rec)-[:BELONGS_TO]->(:Album)-[:RELEASED_BY]->(art:Artist)
            RETURN rec.id as songId, rec.title as title, rec.duration as duration,
                   art.name as artistName,
                   COUNT(DISTINCT u2) as userMatchScore
            ORDER BY userMatchScore DESC
            LIMIT $limit
        `;
        const params = { userId, limit };
        const records = await database.runQuery(query, params);
        return records.map(r => ({
            id: r.get('songId'),
            title: r.get('title'),
            duration: r.get('duration'),
            artistName: r.get('artistName'),
            userMatchScore: r.get('userMatchScore')
        }));
    }

    async getUserListeningHistory(userId) {
        const query = `
            MATCH (u:User {id: $userId})-[l:LISTENED_TO]->(s:Song)
            MATCH (s)-[:BELONGS_TO]->(a:Album)-[:RELEASED_BY]->(art:Artist)
            OPTIONAL MATCH (s)-[:HAS_GENRE]->(g:Genre)
            RETURN s.id as songId, s.title as songTitle, s.duration as duration,
                   s.popularity as popularity,
                   a.id as albumId, a.title as albumTitle,
                   art.id as artistId, art.name as artistName,
                   COLLECT(DISTINCT g.name) as genres,
                   l.timestamp as lastListened,
                   l.count as listenCount
            ORDER BY l.timestamp DESC
        `;
        const params = { userId };
        const records = await database.runQuery(query, params);
        return records.map(r => ({
            songId: r.get('songId'),
            songTitle: r.get('songTitle'),
            duration: r.get('duration'),
            popularity: r.get('popularity'),
            albumId: r.get('albumId'),
            albumTitle: r.get('albumTitle'),
            artistId: r.get('artistId'),
            artistName: r.get('artistName'),
            genres: r.get('genres'),
            lastListened: r.get('lastListened'),
            listenCount: r.get('listenCount')
        }));
    }

    async findSimilarUsers(userId, limit = 5) {
        const query = `
            MATCH (u:User {id: $userId})-[:LISTENED_TO]->(s:Song)-[:HAS_GENRE]->(g:Genre)
            MATCH (g)<-[:HAS_GENRE]-(:Song)<-[:LISTENED_TO]-(similar:User)
            WHERE similar <> u
            MATCH (similar)-[:LISTENED_TO]->(other:Song)
            RETURN similar.id as userId, similar.name as name,
                   COUNT(DISTINCT g) as genreOverlap,
                   COLLECT(DISTINCT other.id) as songs
            ORDER BY genreOverlap DESC
            LIMIT $limit
        `;
        const params = { userId, limit };
        const records = await database.runQuery(query, params);
        return records.map(r => ({
            userId: r.get('userId'),
            name: r.get('name'),
            genreOverlap: r.get('genreOverlap'),
            songs: r.get('songs')
        }));
    }
}

module.exports = new RecommendationService();