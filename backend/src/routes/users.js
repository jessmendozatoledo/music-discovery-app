const express = require('express');
const router = express.Router();
const userModel = require('../models/user');
const recommendationService = require('../services/recommendationService');

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user by ID with listening history
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await userModel.getUserById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const history = await recommendationService.getUserListeningHistory(userId);
        res.json({
            success: true,
            data: { ...user, listeningHistory: history }
        });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new user
router.post('/', async (req, res) => {
    try {
        const { name, email, preferences } = req.body;
        if (!name || !email) {
            return res.status(400).json({
                success: false,
                error: 'Name and email are required'
            });
        }
        const user = await userModel.createUser({ name, email, preferences });
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user recommendations
router.get('/:userId/recommendations', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit } = req.query;
        const recommendations = await recommendationService.getPersonalizedRecommendations(
            userId,
            parseInt(limit) || 10
        );
        res.json({ success: true, data: recommendations });
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get similar users
router.get('/:userId/similar', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit } = req.query;
        const similarUsers = await recommendationService.findSimilarUsers(
            userId,
            parseInt(limit) || 5
        );
        res.json({ success: true, data: similarUsers });
    } catch (error) {
        console.error('Error finding similar users:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;