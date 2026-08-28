const express = require('express');
const router = express.Router();
const recommendationService = require('../services/recommendationService');

// Get personalized recommendations for a user
router.get('/personalized/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit } = req.query;
        const recommendations = await recommendationService.getPersonalizedRecommendations(
            userId,
            parseInt(limit) || 10
        );
        res.json({ success: true, data: recommendations });
    } catch (error) {
        console.error('Error getting personalized recommendations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get collaborative recommendations
router.get('/collaborative/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit } = req.query;
        const recommendations = await recommendationService.getCollaborativeRecommendations(
            userId,
            parseInt(limit) || 10
        );
        res.json({ success: true, data: recommendations });
    } catch (error) {
        console.error('Error getting collaborative recommendations:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get similar artists
router.get('/similar-artists/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { limit } = req.query;
        const artists = await recommendationService.findSimilarArtists(
            userId,
            parseInt(limit) || 5
        );
        res.json({ success: true, data: artists });
    } catch (error) {
        console.error('Error finding similar artists:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get listening history
router.get('/history/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await recommendationService.getUserListeningHistory(userId);
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Error getting listening history:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;