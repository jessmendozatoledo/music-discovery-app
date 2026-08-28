const database = require('../config/database');

class UserModel {
    async createUser(userData) {
        const query = `
            CREATE (u:User {
                id: $id,
                name: $name,
                email: $email,
                joined_date: $joined_date,
                preferences: $preferences
            })
            RETURN u.id as id, u.name as name, u.email as email, u.joined_date as joined_date
        `;
        const params = {
            id: userData.id || `user_${Date.now()}`,
            name: userData.name,
            email: userData.email,
            joined_date: userData.joined_date || new Date().toISOString().split('T')[0],
            preferences: userData.preferences || []
        };

        const records = await database.runQuery(query, params);
        return records[0] ? {
            id: records[0].get('id'),
            name: records[0].get('name'),
            email: records[0].get('email'),
            joined_date: records[0].get('joined_date')
        } : null;
    }

    async getUserById(userId) {
        const query = `
            MATCH (u:User {id: $userId})
            OPTIONAL MATCH (u)-[l:LISTENED_TO]->(s:Song)
            RETURN u.id as id, u.name as name, u.email as email, u.joined_date as joined_date,
                   COLLECT(DISTINCT s.id) as listenedSongs
        `;
        const params = { userId };
        const records = await database.runQuery(query, params);

        if (records.length === 0) return null;
        return {
            id: records[0].get('id'),
            name: records[0].get('name'),
            email: records[0].get('email'),
            joined_date: records[0].get('joined_date'),
            listenedSongs: records[0].get('listenedSongs')
        };
    }

    async getAllUsers() {
        const query = `
            MATCH (u:User)
            RETURN u.id as id, u.name as name, u.email as email, u.joined_date as joined_date
            ORDER BY u.joined_date DESC
        `;
        const records = await database.runQuery(query);
        return records.map(record => ({
            id: record.get('id'),
            name: record.get('name'),
            email: record.get('email'),
            joined_date: record.get('joined_date')
        }));
    }
}

module.exports = new UserModel();