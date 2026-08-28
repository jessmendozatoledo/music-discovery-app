const database = require('../config/database');

class ArtistModel {
    async createArtist(artistData) {
        const query = `
            CREATE (a:Artist {
                id: $id,
                name: $name,
                country: $country,
                formed_year: $formed_year,
                genre: $genre
            })
            RETURN a.id as id, a.name as name, a.country as country, 
                   a.formed_year as formed_year, a.genre as genre
        `;
        const params = {
            id: artistData.id || `artist_${Date.now()}`,
            name: artistData.name,
            country: artistData.country,
            formed_year: artistData.formed_year,
            genre: artistData.genre
        };

        const records = await database.runQuery(query, params);
        return records[0] ? {
            id: records[0].get('id'),
            name: records[0].get('name'),
            country: records[0].get('country'),
            formed_year: records[0].get('formed_year'),
            genre: records[0].get('genre')
        } : null;
    }

    async getArtistWithCollaborations(artistId) {
        const query = `
            MATCH (a:Artist {id: $artistId})
            OPTIONAL MATCH (a)-[:COLLABORATED_WITH]-(collab:Artist)
            OPTIONAL MATCH (a)-[:INFLUENCED_BY]->(influence:Artist)
            RETURN a.id as id, a.name as name, a.country as country,
                   a.formed_year as formed_year, a.genre as genre,
                   COLLECT(DISTINCT collab.id) as collaborations,
                   COLLECT(DISTINCT influence.id) as influences
        `;
        const params = { artistId };
        const records = await database.runQuery(query, params);

        if (records.length === 0) return null;
        return {
            id: records[0].get('id'),
            name: records[0].get('name'),
            country: records[0].get('country'),
            formed_year: records[0].get('formed_year'),
            genre: records[0].get('genre'),
            collaborations: records[0].get('collaborations'),
            influences: records[0].get('influences')
        };
    }

    async findCollaborationPath(artist1Id, artist2Id) {
        const query = `
            MATCH path = shortestPath(
                (a1:Artist {id: $artist1Id})-[:COLLABORATED_WITH*1..5]-(a2:Artist {id: $artist2Id})
            )
            RETURN [node IN nodes(path) | {id: node.id, name: node.name}] as path,
                   length(path) as degrees,
                   [rel IN relationships(path) | {year: rel.year}] as collaborations
        `;
        const params = { artist1Id, artist2Id };
        const records = await database.runQuery(query, params);

        if (records.length === 0) return null;
        return {
            path: records[0].get('path'),
            degrees: records[0].get('degrees'),
            collaborations: records[0].get('collaborations')
        };
    }

    async getTopArtists(limit = 10) {
        const query = `
            MATCH (a:Artist)<-[:RELEASED_BY]-(:Album)<-[:BELONGS_TO]-(s:Song)
            OPTIONAL MATCH (s)<-[:LISTENED_TO]-(u:User)
            RETURN a.id as id, a.name as name, a.country as country,
                   a.genre as genre,
                   COUNT(DISTINCT s) as songCount,
                   COUNT(DISTINCT u) as listenerCount
            ORDER BY listenerCount DESC
            LIMIT $limit
        `;
        const params = { limit };
        const records = await database.runQuery(query, params);
        return records.map(record => ({
            id: record.get('id'),
            name: record.get('name'),
            country: record.get('country'),
            genre: record.get('genre'),
            songCount: record.get('songCount'),
            listenerCount: record.get('listenerCount')
        }));
    }
}

module.exports = new ArtistModel();