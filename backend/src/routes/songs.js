const express = require('express');
const router = express.Router();
const songModel = require('../models/song');
const queryService = require('../services/queryService');

// Get popular songs
router.get('/popular', async (req, res) => {
    try {
        const { limit } = req.query;
        const songs = await songModel.getPopularSongs(parseInt(limit) || 10);
        res.json({ success: true, data: songs });
    } catch (error) {
        console.error('Error fetching popular songs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get song by ID with details
router.get('/:songId', async (req, res) => {
    try {
        const { songId } = req.params;
        const song = await songModel.getSongWithDetails(songId);
        if (!song) {
            return res.status(404).json({ success: false, error: 'Song not found' });
        }
        res.json({ success: true, data: song });
    } catch (error) {
        console.error('Error fetching song:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new song
router.post('/', async (req, res) => {
    try {
        const { title, duration, release_year, popularity } = req.body;
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }
        const song = await songModel.createSong({
            title,
            duration,
            release_year,
            popularity
        });
        res.status(201).json({ success: true, data: song });
    } catch (error) {
        console.error('Error creating song:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get connected songs (multi-hop traversal)
router.get('/:songId/connected', async (req, res) => {
    try {
        const { songId } = req.params;
        const { maxHops } = req.query;
        const connected = await queryService.findConnectedSongs(
            songId,
            parseInt(maxHops) || 3
        );
        res.json({ success: true, data: connected });
    } catch (error) {
        console.error('Error finding connected songs:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;