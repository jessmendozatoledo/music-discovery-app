// backend/scripts/testConnection.js
const database = require('../src/config/database');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 Testing CognoDB connection...');

    try {
        await database.connect();

        // Run a simple test query
        const result = await database.runQuery('RETURN "CognoDB Connected!" as message');
        console.log('✅ Test query successful:', result[0].get('message'));

        // Get database version - using a different approach for CognoDB
        try {
            const version = await database.runQuery('CALL dbms.info() YIELD version RETURN version as version');
            if (version.length > 0) {
                console.log('📦 Database version:', version[0].get('version'));
            }
        } catch (error) {
            // Some CognoDB instances might not support this either, so just continue
            console.log('📦 Database: CognoDB (version info not available)');
        }

        // Check node count
        const count = await database.runQuery('MATCH (n) RETURN COUNT(n) as total');
        console.log('📊 Total nodes:', count[0].get('total'));

        // Get node type distribution
        const typeCount = await database.runQuery(`
            MATCH (n) 
            RETURN labels(n)[0] as type, COUNT(n) as count 
            ORDER BY count DESC
        `);
        console.log('\n📊 Node type distribution:');
        if (typeCount.length > 0) {
            typeCount.forEach(record => {
                console.log(`  ${record.get('type')}: ${record.get('count')}`);
            });
        }

        console.log('\n✨ All tests passed! Connection is working perfectly.');
        console.log('💡 Database is ready for seeding with: npm run seed');

    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        console.log('\n💡 Troubleshooting tips:');
        console.log('1. Check your .env file for correct credentials');
        console.log('2. Verify your CognoDB instance is running');
        console.log('3. Make sure your connection URI starts with bolt+s://');
        console.log('4. Check your internet connection');
        console.log('5. Ensure your password is correct (copy it from CognoDB console)');
        process.exit(1);
    } finally {
        await database.close();
    }
}

testConnection();