const database = require('../config/database');

class QueryService {
    async findConnectedSongs(songId, maxHops = 3) {
        const query = `
            MATCH (start:Song {id: $songId})
            MATCH path = shortestPath(
                (start)-[:BELONGS_TO|:RELEASED_BY|:COLLABORATED_WITH|:HAS_GENRE*1..${maxHops}]-(connected:Song)
            )
            WHERE connected <> start
            RETURN connected.id as songId, connected.title as title,
                   length(path) as distance,
                   [node IN nodes(path) | {type: labels(node)[0], name: node.name or node.title}] as pathNodes
            ORDER BY distance
            LIMIT 20
        `;
        const params = { songId };
        const records = await database.runQuery(query, params);
        return records.map(r => ({
            songId: r.get('songId'),
            title: r.get('title'),
            distance: r.get('distance'),
            pathNodes: r.get('pathNodes')
        }));
    }

    async findInfluenceChains(artistId, maxDepth = 4) {
        const query = `
            MATCH path = (a:Artist {id: $artistId})-[:INFLUENCED_BY*1..${maxDepth}]-(influence:Artist)
            RETURN influence.id as artistId, influence.name as name,
                   length(path) as depth,
                   [node IN nodes(path) | {id: node.id, name: node.name}] as chain
            ORDER BY depth
        `;
        const params = { artistId };
        const records = await database.runQuery(query, params);
        return records.map(r => ({
            artistId: r.get('artistId'),
            name: r.get('name'),
            depth: r.get('depth'),
            chain: r.get('chain')
        }));
    }
}

module.exports = new QueryService();