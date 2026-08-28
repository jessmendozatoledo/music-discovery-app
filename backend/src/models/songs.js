const database = require('../config/database');

class SongModel {
    async createSong(songData) {
        const query = `
            CREATE (s:Song {
                id: $id,
                title: $title,
                duration: $duration,
                release_year: $release_year,
                popularity: $popularity
            })
            RETURN s.id as id, s.title as title, s.duration as duration, 
                   s.release_year as release_year, s.popularity as popularity
        `;
        const params = {
            id: songData.id || `song_${Date.now()}`,
            title: songData.title,
            duration: songData.duration,
            release_year: songData.release_year,
            popularity: songData.popularity || 0
        };

        const records = await database.runQuery(query, params);
        return records[0] ? {
            id: records[0].get('id'),
            title: records[0].get('title'),
            duration: records[0].get('duration'),
            release_year: records[0].get('release_year'),
            popularity: records[0].get('popularity')
        } : null;
    }

    async getSongWithDetails(songId) {
        const query = `
            MATCH (s:Song {id: $songId})
            OPTIONAL MATCH (s)-[:BELONGS_TO]->(a:Album)
            OPTIONAL MATCH (a)-[:RELEASED_BY]->(art:Artist)
            OPTIONAL MATCH (s)-[:HAS_GENRE]->(g:Genre)
            RETURN s.id as id, s.title as title, s.duration as duration, 
                   s.release_year as release_year, s.popularity as popularity,
                   a.id as albumId, a.title as albumTitle,
                   art.id as artistId, art.name as artistName,
                   COLLECT(DISTINCT g.name) as genres
        `;
        const params = { songId };
        const records = await database.runQuery(query, params);

        if (records.length === 0) return null;
        return {
            id: records[0].get('id'),
            title: records[0].get('title'),
            duration: records[0].get('duration'),
            release_year: records[0].get('release_year'),
            popularity: records[0].get('popularity'),
            album: {
                id: records[0].get('albumId'),
                title: records[0].get('albumTitle')
            },
            artist: {
                id: records[0].get('artistId'),
                name: records[0].get('artistName')
            },
            genres: records[0].get('genres')
        };
    }

    async getPopularSongs(limit = 10) {
        const query = `
            MATCH (s:Song)
            OPTIONAL MATCH (s)-[:BELONGS_TO]->(a:Album)-[:RELEASED_BY]->(art:Artist)
            OPTIONAL MATCH (s)-[:HAS_GENRE]->(g:Genre)
            RETURN s.id as id, s.title as title, s.duration as duration,
                   s.popularity as popularity,
                   art.name as artistName,
                   COLLECT(DISTINCT g.name) as genres
            ORDER BY s.popularity DESC
            LIMIT $limit
        `;
        const params = { limit };
        const records = await database.runQuery(query, params);
        return records.map(record => ({
            id: record.get('id'),
            title: record.get('title'),
            duration: record.get('duration'),
            popularity: record.get('popularity'),
            artistName: record.get('artistName'),
            genres: record.get('genres')
        }));
    }
}

module.exports = new SongModel();