// API Configuration - Works for both local and production
// When deployed, this automatically uses the same domain
const API_BASE_URL = '/api';

// State
let currentPage = 'dashboard';

// DOM Elements
const appContent = document.getElementById('app-content');

// Helper function to format duration
function formatDuration(seconds) {
    if (!seconds || seconds === 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
}

// Navigation
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPage = btn.dataset.page;
        await loadPage(currentPage);
    });
});

// Page Loading
async function loadPage(page) {
    showLoading();
    try {
        switch (page) {
            case 'dashboard':
                await loadDashboard();
                break;
            case 'recommendations':
                await loadRecommendations();
                break;
            case 'artists':
                await loadArtists();
                break;
            case 'stats':
                await loadStats();
                break;
            default:
                showError('Page not found');
        }
    } catch (error) {
        console.error('Error loading page:', error);
        showError('Failed to load content. Please try again.');
    }
}

// Loading/Error States
function showLoading() {
    appContent.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading...</p>
        </div>
    `;
}

function showError(message) {
    appContent.innerHTML = `
        <div class="error-message">
            <strong>⚠️ Error:</strong> ${message}
        </div>
    `;
}

function showEmpty(message = 'No data available') {
    appContent.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">📭</div>
            <h2>${message}</h2>
            <p>Check back later for updates</p>
        </div>
    `;
}

// ==================== DASHBOARD ====================
async function loadDashboard() {
    try {
        const [usersRes, songsRes, recRes] = await Promise.all([
            fetch(`${API_BASE_URL}/users`),
            fetch(`${API_BASE_URL}/songs/popular?limit=5`),
            fetch(`${API_BASE_URL}/recommendations/user_1?limit=5`)
        ]);

        const users = await usersRes.json();
        const songs = await songsRes.json();
        const recs = await recRes.json();

        const userCount = users.success ? users.data.length : 0;
        const songCount = songs.success ? songs.data.length : 0;
        const recCount = recs.success ? recs.data.length : 0;

        appContent.innerHTML = `
            <h2>🎵 Welcome to Music Discovery</h2>
            <p style="color: #666; margin-bottom: 30px;">Discover new music through connections and relationships</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="number">${userCount}</div>
                    <div class="label">Active Users</div>
                </div>
                <div class="stat-card">
                    <div class="number">${songCount}</div>
                    <div class="label">Popular Songs</div>
                </div>
                <div class="stat-card">
                    <div class="number">${recCount}</div>
                    <div class="label">Recommendations</div>
                </div>
                <div class="stat-card">
                    <div class="number">✅</div>
                    <div class="label">Database Connected</div>
                </div>
            </div>

            ${songs.success && songs.data.length > 0 ? `
                <div style="margin-top: 30px;">
                    <h3>🔥 Popular Songs</h3>
                    <div class="grid">
                        ${songs.data.map(song => `
                            <div class="card">
                                <div class="card-title">${song.title || 'Unknown'}</div>
                                <div class="card-subtitle">${song.artistName || 'Unknown Artist'}</div>
                                <div class="card-meta">
                                    <span>⭐ ${song.popularity || 0}</span>
                                    <span>🎵 ${song.genres && song.genres.length > 0 ? song.genres.join(', ') : 'No genres'}</span>
                                    <span>⏱️ ${formatDuration(song.duration)}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div style="margin-top: 30px;">
                <h3>💡 Get Started</h3>
                <div style="display: flex; gap: 15px; flex-wrap: wrap; margin-top: 15px;">
                    <button onclick="navigateTo('recommendations')" style="padding: 12px 24px; background: linear-gradient(135deg, #0288d1 0%, #4fc3f7 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1rem;">
                        Get Recommendations
                    </button>
                    <button onclick="navigateTo('artists')" style="padding: 12px 24px; background: linear-gradient(135deg, #0288d1 0%, #4fc3f7 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 1rem;">
                        Explore Artists
                    </button>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Dashboard error:', error);
        showError('Unable to load dashboard. Please check your connection.');
    }
}

// ==================== RECOMMENDATIONS ====================
async function loadRecommendations() {
    try {
        const userId = 'user_1';

        const [personalizedRes, collaborativeRes] = await Promise.all([
            fetch(`${API_BASE_URL}/recommendations/${userId}?limit=10`),
            fetch(`${API_BASE_URL}/recommendations/collaborative/${userId}?limit=10`)
        ]);

        const personalized = await personalizedRes.json();
        const collaborative = await collaborativeRes.json();

        appContent.innerHTML = `
            <h2>🎯 Personalized Recommendations</h2>
            <p style="color: #666; margin-bottom: 20px;">Discover new music based on your listening patterns</p>

            ${personalized.success && personalized.data.length > 0 ? `
                <h3>🎵 Based on Your Taste</h3>
                <div class="grid">
                    ${personalized.data.map(song => `
                        <div class="card">
                            <div class="card-title">${song.title || 'Unknown'}</div>
                            <div class="card-subtitle">${song.artistName || 'Unknown Artist'}</div>
                            <div class="card-meta">
                                <span>⭐ Match: ${song.matchScore || 0}</span>
                                <span>🎵 ${song.genres && song.genres.length > 0 ? song.genres.join(', ') : 'No genres'}</span>
                                <span>⏱️ ${formatDuration(song.duration)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>No personalized recommendations available</p>'}

            ${collaborative.success && collaborative.data.length > 0 ? `
                <h3 style="margin-top: 30px;">👥 Collaborative Recommendations</h3>
                <div class="grid">
                    ${collaborative.data.map(song => `
                        <div class="card">
                            <div class="card-title">${song.title || 'Unknown'}</div>
                            <div class="card-subtitle">${song.artistName || 'Unknown Artist'}</div>
                            <div class="card-meta">
                                <span>👤 User Match: ${song.userMatchScore || 0}</span>
                                <span>⏱️ ${formatDuration(song.duration)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    } catch (error) {
        console.error('Recommendations error:', error);
        showError('Unable to load recommendations. Please try again.');
    }
}

// ==================== ARTISTS ====================
async function loadArtists() {
    try {
        const [topArtistsRes, pathRes] = await Promise.all([
            fetch(`${API_BASE_URL}/artists/top?limit=10`),
            fetch(`${API_BASE_URL}/artists/artist_1/path/artist_5`)
        ]);

        const topArtists = await topArtistsRes.json();
        const path = await pathRes.json();

        appContent.innerHTML = `
            <h2>🎤 Artist Network</h2>
            <p style="color: #666; margin-bottom: 20px;">Explore connections and collaborations between artists</p>

            ${topArtists.success && topArtists.data && topArtists.data.length > 0 ? `
                <h3>🏆 Top Artists</h3>
                <div class="grid">
                    ${topArtists.data.map(artist => `
                        <div class="card">
                            <div class="card-title">${artist.name || 'Unknown Artist'}</div>
                            <div class="card-subtitle">${artist.country || 'Unknown'} • ${artist.genre || 'No genre'}</div>
                            <div class="card-meta">
                                <span>🎵 ${typeof artist.songCount === 'number' ? artist.songCount : 0} songs</span>
                                <span>👂 ${typeof artist.listenerCount === 'number' ? artist.listenerCount : 0} listeners</span>
                                <span>🤝 ${typeof artist.collaborationCount === 'number' ? artist.collaborationCount : 0} collaborations</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<p>No artists found</p>'}

            ${path.success && path.data && path.data.path ? `
                <h3 style="margin-top: 30px;">🔗 Collaboration Path: Radiohead → Flying Lotus</h3>
                <div class="path-visualization">
                    <div style="display: flex; align-items: center; flex-wrap: wrap; padding: 15px; justify-content: center;">
                        ${path.data.path.map((node, index) => `
                            ${index > 0 ? '<span class="path-arrow">→</span>' : ''}
                            <span class="path-node">${node.name}</span>
                            ${index < path.data.path.length - 1 && path.data.collaborations && path.data.collaborations[index] ?
                `<span style="color: #999; margin: 0 8px; font-size: 0.8rem;">(${path.data.collaborations[index].year || '?'})</span>` : ''
            }
                        `).join('')}
                    </div>
                    <div style="margin-top: 10px; color: #666; font-size: 0.9rem; text-align: center;">
                        ${path.data.degrees} degrees of separation
                    </div>
                </div>
            ` : ''}
        `;
    } catch (error) {
        console.error('Artists error:', error);
        showError('Unable to load artists. Please try again.');
    }
}

// ==================== STATISTICS ====================
async function loadStats() {
    try {
        const statsRes = await fetch(`${API_BASE_URL}/stats`);

        if (!statsRes.ok) {
            throw new Error(`HTTP error! status: ${statsRes.status}`);
        }

        const stats = await statsRes.json();

        if (!stats.success) {
            throw new Error(stats.error || 'Failed to load statistics');
        }

        const nodeTypes = stats.data?.nodes || {};
        const relTypes = stats.data?.relationships || {};
        const totalNodes = stats.data?.totalNodes || 0;
        const totalRels = stats.data?.totalRelationships || 0;

        const hasNodeData = Object.keys(nodeTypes).length > 0;
        const hasRelData = Object.keys(relTypes).length > 0;

        appContent.innerHTML = `
            <h2>📊 Graph Statistics</h2>
            <p style="color: #666; margin-bottom: 20px;">Overview of the music discovery graph database</p>

            <div class="stats-grid">
                <div class="stat-card">
                    <div class="number">${totalNodes}</div>
                    <div class="label">Total Nodes</div>
                </div>
                <div class="stat-card">
                    <div class="number">${totalRels}</div>
                    <div class="label">Total Relationships</div>
                </div>
                <div class="stat-card">
                    <div class="number">✅</div>
                    <div class="label">Database Online</div>
                </div>
            </div>

            <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px;">
                    <h4>📦 Node Types</h4>
                    ${hasNodeData ? `
                        <ul style="list-style: none; padding: 0; margin-top: 10px;">
                            ${Object.entries(nodeTypes).map(([type, count]) => `
                                <li style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                                    <span>${type}</span>
                                    <span style="font-weight: bold; color: #0288d1;">${count}</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : `
                        <p style="color: #999; text-align: center; padding: 20px 0;">
                            No node data available. Please seed the database.
                        </p>
                    `}
                </div>

                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px;">
                    <h4>🔗 Relationship Types</h4>
                    ${hasRelData ? `
                        <ul style="list-style: none; padding: 0; margin-top: 10px;">
                            ${Object.entries(relTypes).map(([type, count]) => `
                                <li style="padding: 8px 0; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
                                    <span>${type}</span>
                                    <span style="font-weight: bold; color: #4fc3f7;">${count}</span>
                                </li>
                            `).join('')}
                        </ul>
                    ` : `
                        <p style="color: #999; text-align: center; padding: 20px 0;">
                            No relationship data available. Please seed the database.
                        </p>
                    `}
                </div>
            </div>

            <div style="margin-top: 30px; background: #f8f9fa; padding: 20px; border-radius: 12px;">
                <h4>💡 Why a Graph Database?</h4>
                <p style="color: #666; line-height: 1.6; margin-top: 10px;">
                    <strong>Music discovery</strong> is inherently about connections:
                </p>
                <ul style="color: #666; line-height: 1.8; margin-top: 10px; padding-left: 20px;">
                    <li>🎵 Users listen to songs → Songs belong to albums → Albums released by artists</li>
                    <li>🤝 Artists collaborate with other artists</li>
                    <li>🎯 Songs share genres with other songs</li>
                    <li>🧩 Recommendations require traversing multiple relationship paths</li>
                </ul>
                <p style="color: #666; line-height: 1.6; margin-top: 15px;">
                    <strong>Graph databases</strong> make these queries natural and performant compared to relational joins.
                </p>
            </div>
        `;
    } catch (error) {
        console.error('Stats error:', error);
        showError(`Unable to load statistics: ${error.message}`);
    }
}

// Navigation helper
function navigateTo(page) {
    const btn = document.querySelector(`.nav-btn[data-page="${page}"]`);
    if (btn) {
        btn.click();
    }
}

// Initial load
document.addEventListener('DOMContentLoaded', async () => {
    await loadPage('dashboard');
});