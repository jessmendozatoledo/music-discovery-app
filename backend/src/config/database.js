const neo4j = require('neo4j-driver');
require('dotenv').config();

class Database {
    constructor() {
        this.driver = null;
        this.isConnected = false;
    }

    async connect() {
        try {
            const uri = process.env.NEO4J_URI;
            const user = process.env.NEO4J_USER;
            const password = process.env.NEO4J_PASSWORD;

            if (!uri || !user || !password) {
                throw new Error('Missing database credentials in .env file');
            }

            this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

            await this.driver.verifyConnectivity();
            this.isConnected = true;
            console.log('✅ Connected to CognoDB successfully');
            console.log(`📡 Connected to: ${uri}`);

            return this.driver;
        } catch (error) {
            console.error('❌ Failed to connect to CognoDB:', error.message);
            this.isConnected = false;
            throw error;
        }
    }

    async runQuery(query, params = {}) {
        if (!this.isConnected || !this.driver) {
            throw new Error('Database not connected. Call connect() first.');
        }

        const session = this.driver.session();
        try {
            const result = await session.run(query, params);
            return result.records;
        } catch (error) {
            console.error('Query execution failed:', error.message);
            throw error;
        } finally {
            await session.close();
        }
    }

    async close() {
        if (this.driver) {
            await this.driver.close();
            this.isConnected = false;
            console.log('🔌 Disconnected from CognoDB');
        }
    }
}

const database = new Database();
module.exports = database;