const express = require('express');
const router = express.Router();
const artistModel = require('../models/artist');
const queryService = require('../services/queryService');

// Get top artists
router.get('/top', async (req, res) => {
    try {
        const { limit } = req.query;
        const artists = await artistModel.getTopArtists(parseInt(limit) || 10);
        res.json({ success: true, data: artists });
    } catch (error) {
        console.error('Error fetching top artists:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get artist by ID with collaborations
router.get('/:artistId', async (req, res) => {
    try {
        const { artistId } = req.params;
        const artist = await artistModel.getArtistWithCollaborations(artistId);
        if (!artist) {
            return res.status(404).json({ success: false, error: 'Artist not found' });
        }
        res.json({ success: true, data: artist });
    } catch (error) {
        console.error('Error fetching artist:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create new artist
router.post('/', async (req, res) => {
    try {
        const { name, country, formed_year, genre } = req.body;
        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }
        const artist = await artistModel.createArtist({
            name,
            country,
            formed_year,
            genre
        });
        res.status(201).json({ success: true, data: artist });
    } catch (error) {
        console.error('Error creating artist:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Find collaboration path between two artists
router.get('/:artist1Id/path/:artist2Id', async (req, res) => {
    try {
        const { artist1Id, artist2Id } = req.params;
        const path = await artistModel.findCollaborationPath(artist1Id, artist2Id);
        if (!path) {
            return res.status(404).json({
                success: false,
                error: 'No path found between these artists'
            });
        }
        res.json({ success: true, data: path });
    } catch (error) {
        console.error('Error finding collaboration path:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get influence chains
router.get('/:artistId/influences', async (req, res) => {
    try {
        const { artistId } = req.params;
        const { maxDepth } = req.query;
        const chains = await queryService.findInfluenceChains(
            artistId,
            parseInt(maxDepth) || 4
        );
        res.json({ success: true, data: chains });
    } catch (error) {
        console.error('Error finding influence chains:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;