// backend/scripts/seedData.js
const database = require('../src/config/database');
require('dotenv').config();

async function seedDatabase() {
    console.log('🌱 Starting database seeding...');

    try {
        await database.connect();

        // Clear existing data (optional - be careful!)
        console.log('🧹 Clearing existing data...');
        await database.runQuery('MATCH (n) DETACH DELETE n');
        console.log('✅ Existing data cleared');

        // Create Genres
        console.log('📀 Creating genres...');
        const genres = [
            { id: 'genre_1', name: 'Alternative Rock' },
            { id: 'genre_2', name: 'Electronic' },
            { id: 'genre_3', name: 'Experimental' },
            { id: 'genre_4', name: 'Indie Pop' },
            { id: 'genre_5', name: 'Jazz Fusion' },
            { id: 'genre_6', name: 'Progressive Rock' },
            { id: 'genre_7', name: 'Ambient' },
            { id: 'genre_8', name: 'Post-Rock' }
        ];

        for (const genre of genres) {
            await database.runQuery(
                'CREATE (g:Genre {id: $id, name: $name})',
                genre
            );
        }
        console.log(`✅ Created ${genres.length} genres`);

        // Create Artists
        console.log('🎤 Creating artists...');
        const artists = [
            { id: 'artist_1', name: 'Radiohead', country: 'UK', formed_year: 1985, genre: 'Alternative Rock' },
            { id: 'artist_2', name: 'Thom Yorke', country: 'UK', formed_year: 1990, genre: 'Electronic' },
            { id: 'artist_3', name: 'Bjork', country: 'Iceland', formed_year: 1977, genre: 'Experimental' },
            { id: 'artist_4', name: 'Tame Impala', country: 'Australia', formed_year: 2007, genre: 'Indie Pop' },
            { id: 'artist_5', name: 'Flying Lotus', country: 'USA', formed_year: 2006, genre: 'Electronic' },
            { id: 'artist_6', name: 'Jonny Greenwood', country: 'UK', formed_year: 1985, genre: 'Progressive Rock' },
            { id: 'artist_7', name: 'Sigur Rós', country: 'Iceland', formed_year: 1994, genre: 'Post-Rock' },
            { id: 'artist_8', name: 'Bon Iver', country: 'USA', formed_year: 2006, genre: 'Indie Pop' }
        ];

        for (const artist of artists) {
            await database.runQuery(
                `CREATE (a:Artist {
                    id: $id, 
                    name: $name, 
                    country: $country, 
                    formed_year: $formed_year,
                    genre: $genre
                })`,
                artist
            );
        }
        console.log(`✅ Created ${artists.length} artists`);

        // Create Albums
        console.log('💿 Creating albums...');
        const albums = [
            { id: 'album_1', title: 'OK Computer', release_year: 1997 },
            { id: 'album_2', title: 'Kid A', release_year: 2000 },
            { id: 'album_3', title: 'In Rainbows', release_year: 2007 },
            { id: 'album_4', title: 'Homogenic', release_year: 1997 },
            { id: 'album_5', title: 'Currents', release_year: 2015 },
            { id: 'album_6', title: 'Cosmogramma', release_year: 2010 },
            { id: 'album_7', title: 'Ágætis byrjun', release_year: 1999 },
            { id: 'album_8', title: '22, A Million', release_year: 2016 }
        ];

        for (const album of albums) {
            await database.runQuery(
                'CREATE (a:Album {id: $id, title: $title, release_year: $release_year})',
                album
            );
        }
        console.log(`✅ Created ${albums.length} albums`);

        // Create Songs
        console.log('🎵 Creating songs...');
        const songs = [
            { id: 'song_1', title: 'Paranoid Android', duration: 382, release_year: 1997, popularity: 85 },
            { id: 'song_2', title: 'Karma Police', duration: 261, release_year: 1997, popularity: 82 },
            { id: 'song_3', title: 'No Surprises', duration: 228, release_year: 1997, popularity: 78 },
            { id: 'song_4', title: 'Everything in Its Right Place', duration: 246, release_year: 2000, popularity: 75 },
            { id: 'song_5', title: 'Idioteque', duration: 312, release_year: 2000, popularity: 80 },
            { id: 'song_6', title: 'Jigsaw Falling into Place', duration: 254, release_year: 2007, popularity: 76 },
            { id: 'song_7', title: 'Joga', duration: 308, release_year: 1997, popularity: 70 },
            { id: 'song_8', title: 'Let It Happen', duration: 468, release_year: 2015, popularity: 88 },
            { id: 'song_9', title: 'The Less I Know the Better', duration: 216, release_year: 2015, popularity: 90 },
            { id: 'song_10', title: 'Never Catch Me', duration: 234, release_year: 2014, popularity: 75 },
            { id: 'song_11', title: 'Bodysnatchers', duration: 242, release_year: 2007, popularity: 72 },
            { id: 'song_12', title: 'Svefn-g-englar', duration: 610, release_year: 1999, popularity: 68 },
            { id: 'song_13', title: 'Holocene', duration: 330, release_year: 2011, popularity: 74 },
            { id: 'song_14', title: 'Nude', duration: 256, release_year: 2007, popularity: 71 }
        ];

        for (const song of songs) {
            await database.runQuery(
                `CREATE (s:Song {
                    id: $id, 
                    title: $title, 
                    duration: $duration, 
                    release_year: $release_year,
                    popularity: $popularity
                })`,
                song
            );
        }
        console.log(`✅ Created ${songs.length} songs`);

        // Create Users
        console.log('👤 Creating users...');
        const users = [
            { id: 'user_1', name: 'Alice Johnson', email: 'alice@example.com', joined_date: '2024-01-15' },
            { id: 'user_2', name: 'Bob Smith', email: 'bob@example.com', joined_date: '2024-02-20' },
            { id: 'user_3', name: 'Carol Davis', email: 'carol@example.com', joined_date: '2024-03-10' },
            { id: 'user_4', name: 'David Wilson', email: 'david@example.com', joined_date: '2024-04-05' },
            { id: 'user_5', name: 'Emma Thompson', email: 'emma@example.com', joined_date: '2024-05-01' },
            { id: 'user_6', name: 'Frank Chen', email: 'frank@example.com', joined_date: '2024-06-15' }
        ];

        for (const user of users) {
            await database.runQuery(
                `CREATE (u:User {
                    id: $id, 
                    name: $name, 
                    email: $email, 
                    joined_date: $joined_date,
                    preferences: []
                })`,
                user
            );
        }
        console.log(`✅ Created ${users.length} users`);

        // Create Relationships
        console.log('🔗 Creating relationships...');

        // Song to Album relationships
        const songAlbums = [
            { song: 'song_1', album: 'album_1' },
            { song: 'song_2', album: 'album_1' },
            { song: 'song_3', album: 'album_1' },
            { song: 'song_4', album: 'album_2' },
            { song: 'song_5', album: 'album_2' },
            { song: 'song_6', album: 'album_3' },
            { song: 'song_11', album: 'album_3' },
            { song: 'song_14', album: 'album_3' },
            { song: 'song_7', album: 'album_4' },
            { song: 'song_8', album: 'album_5' },
            { song: 'song_9', album: 'album_5' },
            { song: 'song_10', album: 'album_6' },
            { song: 'song_12', album: 'album_7' },
            { song: 'song_13', album: 'album_8' }
        ];

        for (const sa of songAlbums) {
            await database.runQuery(
                `MATCH (s:Song {id: $song})
                 MATCH (a:Album {id: $album})
                 CREATE (s)-[:BELONGS_TO]->(a)`,
                sa
            );
        }
        console.log(`✅ Created ${songAlbums.length} song-album relationships`);

        // Album to Artist relationships
        const albumArtists = [
            { album: 'album_1', artist: 'artist_1' },
            { album: 'album_2', artist: 'artist_1' },
            { album: 'album_3', artist: 'artist_1' },
            { album: 'album_4', artist: 'artist_3' },
            { album: 'album_5', artist: 'artist_4' },
            { album: 'album_6', artist: 'artist_5' },
            { album: 'album_7', artist: 'artist_7' },
            { album: 'album_8', artist: 'artist_8' }
        ];

        for (const aa of albumArtists) {
            await database.runQuery(
                `MATCH (a:Album {id: $album})
                 MATCH (art:Artist {id: $artist})
                 CREATE (a)-[:RELEASED_BY]->(art)`,
                aa
            );
        }
        console.log(`✅ Created ${albumArtists.length} album-artist relationships`);

        // Song to Genre relationships
        const songGenres = [
            { song: 'song_1', genre: 'genre_1' },
            { song: 'song_1', genre: 'genre_3' },
            { song: 'song_2', genre: 'genre_1' },
            { song: 'song_3', genre: 'genre_1' },
            { song: 'song_4', genre: 'genre_2' },
            { song: 'song_4', genre: 'genre_3' },
            { song: 'song_5', genre: 'genre_2' },
            { song: 'song_5', genre: 'genre_3' },
            { song: 'song_6', genre: 'genre_4' },
            { song: 'song_6', genre: 'genre_1' },
            { song: 'song_7', genre: 'genre_3' },
            { song: 'song_7', genre: 'genre_2' },
            { song: 'song_8', genre: 'genre_4' },
            { song: 'song_8', genre: 'genre_2' },
            { song: 'song_9', genre: 'genre_4' },
            { song: 'song_10', genre: 'genre_2' },
            { song: 'song_10', genre: 'genre_5' },
            { song: 'song_11', genre: 'genre_1' },
            { song: 'song_11', genre: 'genre_6' },
            { song: 'song_12', genre: 'genre_7' },
            { song: 'song_12', genre: 'genre_8' },
            { song: 'song_13', genre: 'genre_4' },
            { song: 'song_14', genre: 'genre_1' },
            { song: 'song_14', genre: 'genre_3' }
        ];

        for (const sg of songGenres) {
            await database.runQuery(
                `MATCH (s:Song {id: $song})
                 MATCH (g:Genre {id: $genre})
                 CREATE (s)-[:HAS_GENRE]->(g)`,
                sg
            );
        }
        console.log(`✅ Created ${songGenres.length} song-genre relationships`);

        // Artist collaborations
        const collaborations = [
            { artist1: 'artist_1', artist2: 'artist_2', year: 1997 },
            { artist1: 'artist_1', artist2: 'artist_6', year: 1997 },
            { artist1: 'artist_2', artist2: 'artist_3', year: 2000 },
            { artist1: 'artist_2', artist2: 'artist_5', year: 2010 },
            { artist1: 'artist_3', artist2: 'artist_5', year: 2012 },
            { artist1: 'artist_4', artist2: 'artist_5', year: 2015 },
            { artist1: 'artist_1', artist2: 'artist_7', year: 2005 },
            { artist1: 'artist_8', artist2: 'artist_4', year: 2016 }
        ];

        for (const collab of collaborations) {
            await database.runQuery(
                `MATCH (a1:Artist {id: $artist1})
                 MATCH (a2:Artist {id: $artist2})
                 CREATE (a1)-[:COLLABORATED_WITH {year: $year}]->(a2)`,
                collab
            );
            // Also create reverse direction
            await database.runQuery(
                `MATCH (a1:Artist {id: $artist2})
                 MATCH (a2:Artist {id: $artist1})
                 CREATE (a1)-[:COLLABORATED_WITH {year: $year}]->(a2)`,
                { artist1: collab.artist2, artist2: collab.artist1, year: collab.year }
            );
        }
        console.log(`✅ Created ${collaborations.length * 2} collaboration relationships`);

        // Artist influences
        const influences = [
            { artist: 'artist_1', influence: 'artist_2' },
            { artist: 'artist_1', influence: 'artist_6' },
            { artist: 'artist_2', influence: 'artist_3' },
            { artist: 'artist_4', influence: 'artist_1' },
            { artist: 'artist_5', influence: 'artist_2' },
            { artist: 'artist_5', influence: 'artist_3' },
            { artist: 'artist_7', influence: 'artist_1' },
            { artist: 'artist_8', influence: 'artist_4' }
        ];

        for (const inf of influences) {
            await database.runQuery(
                `MATCH (a:Artist {id: $artist})
                 MATCH (i:Artist {id: $influence})
                 CREATE (a)-[:INFLUENCED_BY]->(i)`,
                inf
            );
        }
        console.log(`✅ Created ${influences.length} influence relationships`);

        // User listening history
        console.log('👂 Creating listening history...');
        const listeningHistory = [
            { user: 'user_1', song: 'song_1', timestamp: '2024-03-01T10:00:00Z', count: 5 },
            { user: 'user_1', song: 'song_2', timestamp: '2024-03-02T14:30:00Z', count: 3 },
            { user: 'user_1', song: 'song_4', timestamp: '2024-03-03T09:15:00Z', count: 2 },
            { user: 'user_1', song: 'song_8', timestamp: '2024-03-04T16:45:00Z', count: 4 },
            { user: 'user_1', song: 'song_9', timestamp: '2024-03-05T11:20:00Z', count: 6 },
            { user: 'user_1', song: 'song_14', timestamp: '2024-03-06T13:10:00Z', count: 3 },
            { user: 'user_2', song: 'song_3', timestamp: '2024-03-01T08:00:00Z', count: 2 },
            { user: 'user_2', song: 'song_5', timestamp: '2024-03-02T12:00:00Z', count: 4 },
            { user: 'user_2', song: 'song_6', timestamp: '2024-03-03T15:30:00Z', count: 3 },
            { user: 'user_2', song: 'song_11', timestamp: '2024-03-04T10:45:00Z', count: 1 },
            { user: 'user_2', song: 'song_1', timestamp: '2024-03-05T09:20:00Z', count: 2 },
            { user: 'user_3', song: 'song_7', timestamp: '2024-03-01T19:00:00Z', count: 3 },
            { user: 'user_3', song: 'song_10', timestamp: '2024-03-02T21:30:00Z', count: 2 },
            { user: 'user_3', song: 'song_1', timestamp: '2024-03-03T20:15:00Z', count: 4 },
            { user: 'user_3', song: 'song_12', timestamp: '2024-03-04T18:45:00Z', count: 5 },
            { user: 'user_3', song: 'song_13', timestamp: '2024-03-05T20:30:00Z', count: 2 },
            { user: 'user_4', song: 'song_8', timestamp: '2024-03-01T07:30:00Z', count: 5 },
            { user: 'user_4', song: 'song_9', timestamp: '2024-03-02T08:45:00Z', count: 3 },
            { user: 'user_4', song: 'song_2', timestamp: '2024-03-03T09:00:00Z', count: 2 },
            { user: 'user_4', song: 'song_6', timestamp: '2024-03-04T10:15:00Z', count: 4 },
            { user: 'user_5', song: 'song_10', timestamp: '2024-03-01T14:00:00Z', count: 3 },
            { user: 'user_5', song: 'song_5', timestamp: '2024-03-02T15:30:00Z', count: 2 },
            { user: 'user_5', song: 'song_7', timestamp: '2024-03-03T16:45:00Z', count: 4 },
            { user: 'user_6', song: 'song_4', timestamp: '2024-03-01T11:00:00Z', count: 3 },
            { user: 'user_6', song: 'song_8', timestamp: '2024-03-02T12:30:00Z', count: 5 },
            { user: 'user_6', song: 'song_9', timestamp: '2024-03-03T13:45:00Z', count: 2 }
        ];

        for (const listen of listeningHistory) {
            await database.runQuery(
                `MATCH (u:User {id: $user})
                 MATCH (s:Song {id: $song})
                 CREATE (u)-[:LISTENED_TO {timestamp: $timestamp, count: $count}]->(s)`,
                listen
            );
        }
        console.log(`✅ Created ${listeningHistory.length} listening history relationships`);

        console.log('\n✅ Database seeded successfully!');

        // Print some statistics
        const stats = await database.runQuery(`
            MATCH (n) 
            RETURN labels(n)[0] as type, COUNT(n) as count
            ORDER BY count DESC
        `);

        console.log('\n📊 Database Statistics:');
        if (stats.length > 0) {
            stats.forEach(record => {
                console.log(`  ${record.get('type')}: ${record.get('count')}`);
            });
        }

        // Count relationships
        const relStats = await database.runQuery(`
            MATCH ()-[r]->()
            RETURN type(r) as type, COUNT(r) as count
            ORDER BY count DESC
        `);

        console.log('\n📊 Relationship Statistics:');
        if (relStats.length > 0) {
            relStats.forEach(record => {
                console.log(`  ${record.get('type')}: ${record.get('count')}`);
            });
        }

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        await database.close();
        console.log('\n✨ Seeding complete!');
        console.log('🎵 You can now start the application with: npm start');
    }
}

// Run the seed function
seedDatabase();