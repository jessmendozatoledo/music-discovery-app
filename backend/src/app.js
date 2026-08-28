const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const database = require('./config/database');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:8080', 'http://127.0.0.1:8080', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../../frontend')));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// ==================== HEALTH & ROOT ====================
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        dbConnected: database.isConnected
    });
});

app.get('/api', (req, res) => {
    res.json({
        name: '🎵 Music Discovery API',
        version: '1.0.0',
        status: database.isConnected ? 'Database Connected ✅' : 'Database Disconnected ❌',
        endpoints: {
            'GET /api/test': 'Test database connection',
            'GET /api/users': 'Get all users',
            'GET /api/users/:id': 'Get user by ID',
            'GET /api/songs/popular': 'Get popular songs',
            'GET /api/songs/:id/connected': 'Get connected songs (multi-hop)',
            'GET /api/artists/top': 'Get top artists',
            'GET /api/artists/:id/path/:id2': 'Find collaboration path',
            'GET /api/recommendations/:userId': 'Get personalized recommendations',
            'GET /api/stats': 'Get database statistics'
        }
    });
});

// ==================== TEST ====================
app.get('/api/test', async (req, res) => {
    try {
        const result = await database.runQuery('RETURN "CognoDB Connected!" as message');
        res.json({
            success: true,
            message: result[0].get('message'),
            dbConnected: database.isConnected
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== USERS ====================
app.get('/api/users', async (req, res) => {
    try {
        const result = await database.runQuery(`
            MATCH (u:User) 
            RETURN u.id as id, u.name as name, u.email as email, u.joined_date as joined_date
            ORDER BY u.joined_date DESC
        `);
        const users = result.map(r => ({
            id: r.get('id'),
            name: r.get('name'),
            email: r.get('email'),
            joined_date: r.get('joined_date')
        }));
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await database.runQuery(`
            MATCH (u:User {id: $userId})
            OPTIONAL MATCH (u)-[l:LISTENED_TO]->(s:Song)
            OPTIONAL MATCH (s)-[:BELONGS_TO]->(a:Album)-[:RELEASED_BY]->(art:Artist)
            RETURN u.id as id, u.name as name, u.email as email, u.joined_date as joined_date,
                   COLLECT(DISTINCT {
                       songId: s.id, 
                       title: s.title,
                       artist: art.name,
                       album: a.title
                   }) as listenedSongs
        `, { userId });

        if (result.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        res.json({
            success: true, data: {
                id: result[0].get('id'),
                name: result[0].get('name'),
                email: result[0].get('email'),
                joined_date: result[0].get('joined_date'),
                listenedSongs: result[0].get('listenedSongs')
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== SONGS ====================
app.get('/api/songs/popular', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const result = await database.runQuery(`
            MATCH (s:Song)
            OPTIONAL MATCH (s)-[:BELONGS_TO]->(a:Album)-[:RELEASED_BY]->(art:Artist)
            OPTIONAL MATCH (s)-[:HAS_GENRE]->(g:Genre)
            RETURN s.id as id, s.title as title, s.duration as duration,
                   s.popularity as popularity, s.release_year as releaseYear,
                   art.name as artistName,
                   a.title as albumTitle,
                   COLLECT(DISTINCT g.name) as genres
            ORDER BY s.popularity DESC
            LIMIT $limit
        `, { limit: parseInt(limit) });

        const songs = result.map(r => ({
            id: r.get('id'),
            title: r.get('title'),
            duration: r.get('duration'),
            popularity: r.get('popularity'),
            releaseYear: r.get('releaseYear'),
            artistName: r.get('artistName'),
            albumTitle: r.get('albumTitle'),
            genres: r.get('genres') || []
        }));
        res.json({ success: true, count: songs.length, data: songs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/songs/:songId/connected', async (req, res) => {
    try {
        const { songId } = req.params;
        const { maxHops = 3 } = req.query;
        const result = await database.runQuery(`
            MATCH (start:Song {id: $songId})
            MATCH path = shortestPath(
                (start)-[:BELONGS_TO|:RELEASED_BY|:COLLABORATED_WITH|:HAS_GENRE*1..${parseInt(maxHops)}]-(connected:Song)
            )
            WHERE connected <> start
            RETURN connected.id as songId, connected.title as title,
                   length(path) as distance,
                   [node IN nodes(path) | {
                       type: labels(node)[0], 
                       name: node.name or node.title,
                       id: node.id
                   }] as pathNodes
            ORDER BY distance
            LIMIT 20
        `, { songId });

        const songs = result.map(r => ({
            songId: r.get('songId'),
            title: r.get('title'),
            distance: r.get('distance'),
            pathNodes: r.get('pathNodes')
        }));
        res.json({ success: true, count: songs.length, data: songs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ARTISTS ====================
app.get('/api/artists/top', async (req, res) => {
    try {
        const { limit = 10 } = req.query;
        const result = await database.runQuery(`
            MATCH (a:Artist)
            OPTIONAL MATCH (a)<-[:RELEASED_BY]-(:Album)<-[:BELONGS_TO]-(s:Song)
            OPTIONAL MATCH (s)<-[:LISTENED_TO]-(u:User)
            OPTIONAL MATCH (a)-[:COLLABORATED_WITH]-(c:Artist)
            RETURN a.id as id, a.name as name, a.country as country,
                   a.genre as genre, a.formed_year as formedYear,
                   COUNT(DISTINCT s) as songCount,
                   COUNT(DISTINCT u) as listenerCount,
                   COUNT(DISTINCT c) as collaborationCount
            ORDER BY listenerCount DESC, songCount DESC
            LIMIT $limit
        `, { limit: parseInt(limit) });

        const artists = result.map(r => ({
            id: r.get('id'),
            name: r.get('name'),
            country: r.get('country') || 'Unknown',
            genre: r.get('genre') || 'No genre',
            formedYear: r.get('formedYear'),
            songCount: r.get('songCount') || 0,
            listenerCount: r.get('listenerCount') || 0,
            collaborationCount: r.get('collaborationCount') || 0
        }));
        res.json({ success: true, count: artists.length, data: artists });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/artists/:artist1Id/path/:artist2Id', async (req, res) => {
    try {
        const { artist1Id, artist2Id } = req.params;
        const result = await database.runQuery(`
            MATCH path = shortestPath(
                (a1:Artist {id: $artist1Id})-[:COLLABORATED_WITH*1..5]-(a2:Artist {id: $artist2Id})
            )
            RETURN [node IN nodes(path) | {
                id: node.id, 
                name: node.name,
                type: labels(node)[0]
            }] as path,
            length(path) as degrees,
            [rel IN relationships(path) | {year: rel.year}] as collaborations
        `, { artist1Id, artist2Id });

        if (result.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'No path found between these artists'
            });
        }

        res.json({
            success: true, data: {
                path: result[0].get('path'),
                degrees: result[0].get('degrees'),
                collaborations: result[0].get('collaborations') || []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== RECOMMENDATIONS ====================
app.get('/api/recommendations/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;
        const result = await database.runQuery(`
            MATCH (u:User {id: $userId})-[:LISTENED_TO]->(s:Song)
            MATCH (s)-[:HAS_GENRE]->(g:Genre)
            MATCH (g)<-[:HAS_GENRE]-(rec:Song)
            WHERE rec <> s
            MATCH (rec)-[:BELONGS_TO]->(a:Album)-[:RELEASED_BY]->(art:Artist)
            OPTIONAL MATCH (rec)-[:HAS_GENRE]->(g2:Genre)
            RETURN DISTINCT rec.id as songId, rec.title as title, 
                          rec.duration as duration, rec.popularity as popularity,
                          rec.release_year as releaseYear,
                          art.name as artistName,
                          a.title as albumTitle,
                          COLLECT(DISTINCT g2.name) as genres,
                          COUNT(DISTINCT g) as matchScore
            ORDER BY matchScore DESC, popularity DESC
            LIMIT $limit
        `, { userId, limit: parseInt(limit) });

        const recommendations = result.map(r => ({
            id: r.get('songId'),
            title: r.get('title'),
            duration: r.get('duration'),
            popularity: r.get('popularity'),
            releaseYear: r.get('releaseYear'),
            artistName: r.get('artistName'),
            albumTitle: r.get('albumTitle'),
            genres: r.get('genres') || [],
            matchScore: r.get('matchScore')
        }));
        res.json({ success: true, count: recommendations.length, data: recommendations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/recommendations/collaborative/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit = 10 } = req.query;
        const result = await database.runQuery(`
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
        `, { userId, limit: parseInt(limit) });

        const recommendations = result.map(r => ({
            id: r.get('songId'),
            title: r.get('title'),
            duration: r.get('duration'),
            artistName: r.get('artistName'),
            userMatchScore: r.get('userMatchScore')
        }));
        res.json({ success: true, count: recommendations.length, data: recommendations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== STATISTICS ====================
app.get('/api/stats', async (req, res) => {
    try {
        const nodeResult = await database.runQuery(`
            MATCH (n) 
            RETURN labels(n)[0] as type, COUNT(n) as count
            ORDER BY count DESC
        `);

        const nodes = {};
        if (nodeResult && nodeResult.length > 0) {
            nodeResult.forEach(r => {
                const type = r.get('type');
                const count = r.get('count');
                if (type) {
                    nodes[type] = Number(count);
                }
            });
        }

        const relResult = await database.runQuery(`
            MATCH ()-[r]->()
            RETURN type(r) as type, COUNT(r) as count
            ORDER BY count DESC
        `);

        const relationships = {};
        if (relResult && relResult.length > 0) {
            relResult.forEach(r => {
                const type = r.get('type');
                const count = r.get('count');
                if (type) {
                    relationships[type] = Number(count);
                }
            });
        }

        const totalNodes = Object.values(nodes).reduce((a, b) => a + b, 0);
        const totalRelationships = Object.values(relationships).reduce((a, b) => a + b, 0);

        res.json({
            success: true,
            data: {
                nodes: nodes,
                relationships: relationships,
                totalNodes: totalNodes || 0,
                totalRelationships: totalRelationships || 0
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== ERROR HANDLING ====================
app.use((err, req, res, next) => {
    console.error('❌ Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message
    });
});

// ==================== START SERVER ====================
async function startServer() {
    try {
        await database.connect();
        app.listen(port, () => {
            console.log(`\n${'='.repeat(50)}`);
            console.log(`🎵 Music Discovery API`);
            console.log(`${'='.repeat(50)}`);
            console.log(`🚀 Server running on http://localhost:${port}`);
            console.log(`📊 Health: http://localhost:${port}/health`);
            console.log(`✅ Database: Connected`);
            console.log(`\n📝 Available Endpoints:`);
            console.log(`  GET /api/users`);
            console.log(`  GET /api/users/:userId`);
            console.log(`  GET /api/songs/popular`);
            console.log(`  GET /api/songs/:songId/connected`);
            console.log(`  GET /api/artists/top`);
            console.log(`  GET /api/artists/:artist1/path/:artist2`);
            console.log(`  GET /api/recommendations/:userId`);
            console.log(`  GET /api/recommendations/collaborative/:userId`);
            console.log(`  GET /api/stats`);
            console.log(`\n🌐 Frontend available at: http://localhost:${port}`);
            console.log(`${'='.repeat(50)}\n`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        console.log('⚠️  Starting server in limited mode (database offline)');
        app.listen(port, () => {
            console.log(`\n🚀 Server running on http://localhost:${port} (limited mode)`);
            console.log(`❌ Database: Disconnected\n`);
        });
    }
}

process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await database.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await database.close();
    process.exit(0);
});

startServer();