# 🎵 Music Discovery Application

A graph database-powered music discovery application built with CognoDB. Discover new music through connections and relationships between users, songs, artists, albums, and genres.

**Live Demo:** [https://music-discovery-app-z4m7.onrender.com/](https://music-discovery-app-z4m7.onrender.com/)

---

## 📋 Table of Contents

1. [🎯 Use Case](#-use-case)
2. [🤔 Why a Graph Database?](#-why-a-graph-database)
3. [📊 Data Model](#-data-model)
4. [🔍 Key Queries](#-key-queries)
5. [🚀 Setup Instructions](#-setup-instructions)
6. [📸 Screenshots](#-screenshots)
7. [🌐 Deployment Guide](#-deployment-guide)
8. [🎥 Video Demo](#-video-demo)
9. [🛠️ Tech Stack](#️-tech-stack)
10. [📁 Project Structure](#-project-structure)
11. [✅ Requirements Checklist](#-requirements-checklist)
12. [🐛 Troubleshooting](#-troubleshooting)
13. [📧 Contact](#-contact)

---

## 🎯 Use Case

**Music Discovery** helps users find new music through connections and relationships in the music graph. The application demonstrates how graph databases excel at handling complex relationship queries that would be awkward or inefficient in traditional relational databases.

### The Problem

In today's music streaming world, users struggle to discover new music that matches their taste. Traditional recommendation systems often fail because they don't understand the complex relationships between:

- Users and their listening habits
- Songs and their genres
- Artists and their collaborations
- Users with similar tastes

### The Solution

This application uses a graph database to model these relationships naturally, providing:

1. **Personalized Recommendations** - Based on listening patterns and genre preferences
2. **Artist Discovery** - Explore collaborations between artists
3. **Similar Users** - Find users with similar music taste
4. **Music Graph Insights** - Visualize the connections between songs, artists, and genres

### Key Features

| Feature | Description | Graph Query Used |
|---------|-------------|------------------|
| **Personalized Recommendations** | Find songs based on genres you like | 3-hop traversal: User→Songs→Genres→Songs |
| **Collaborative Filtering** | Find what similar users are listening to | Pattern matching with shared songs |
| **Artist Network** | Explore collaborations between artists | Shortest path with variable length |
| **Connected Songs** | Find songs connected through any relationship | Multi-type relationship traversal |
| **Graph Statistics** | Visualize database structure | Node and relationship counts |

### User Stories

1. **As a music lover**, I want to discover new songs similar to what I already like
2. **As a curious listener**, I want to see how artists are connected through collaborations
3. **As a data explorer**, I want to understand the relationships in the music graph
4. **As a casual user**, I want to find popular songs and trending artists

---

## 🤔 Why a Graph Database?

### The Music Graph Explained

Music discovery is inherently about **connections and relationships**:
Users → listen to → Songs → belong to → Albums → released by → Artists
Songs → have → Genres
Artists → collaborate with → Artists
Artists → influenced by → Artists


### Graph vs Relational: Real-World Example

**Problem:** "Find songs similar to what Alice Johnson listens to"

#### Relational SQL Approach (Would require 4 complex queries)

```sql
-- Step 1: Find songs Alice listens to
WITH alice_songs AS (
    SELECT song_id FROM listening_history 
    JOIN users ON users.id = listening_history.user_id 
    WHERE users.name = 'Alice Johnson'
),
-- Step 2: Find genres of those songs
alice_genres AS (
    SELECT DISTINCT genre_id FROM song_genres 
    WHERE song_id IN (SELECT song_id FROM alice_songs)
),
-- Step 3: Find songs with those genres
candidate_songs AS (
    SELECT DISTINCT song_id FROM song_genres 
    WHERE genre_id IN (SELECT genre_id FROM alice_genres)
    AND song_id NOT IN (SELECT song_id FROM alice_songs)
),
-- Step 4: Get song details and rank
SELECT songs.title, artists.name, COUNT(DISTINCT genre_id) as match_score
FROM candidate_songs
JOIN songs ON songs.id = candidate_songs.song_id
JOIN albums ON albums.id = songs.album_id
JOIN artists ON artists.id = albums.artist_id
JOIN song_genres ON song_genres.song_id = songs.id
GROUP BY songs.title, artists.name
ORDER BY match_score DESC
LIMIT 10;
```

-- When to Use a Graph Database
Use a Graph Database when:
-Data is highly connected (social networks, recommendations)
-Relationships are as important as the data
-You need to traverse relationships (multi-hop queries)
-Your schema is evolving (new relationship types)

--Use a Relational Database when:
-Data is tabular and relationships are simple
-You need strict ACID transactions
-Your queries are mostly CRUD operations
-You have complex reporting/analytics needs

--Node Types and Properties
Node Type-Properties-Description-Example
User-id(string)-name(string)-email(string)-joined_date(date)-preferences(array)-Music listeners-AliceJohnson, alice@example.com
Song-id(string)-title(string)-duration(int)-release_year(int)-popularity(int)-Individual songs-Paranoid Android, 382 seconds
Artist-id(string)-name(string)-country(string)-formed_year(int)-genre(string)-Music artists-Radiohead, UK, 1985
Album-id(string)-title(string)-release_year(int)-Music albums-OK Computer, 1997
Genre-id(string)-name(string)-Music genres-Alternative Rock

--Relationship Types
Relationship-From → To-Properties-Description-Example
LISTENED_TO-User → Song-timestamp(string),count(int)-User listened to a song-Alice listened to Paranoid Android 5 times
BELONGS_TO-Song → Album--Song belongs to an album-Paranoid Android belongs to OK Computer
RELEASED_BY-Album → Artist---Album released by an artist-OK Computer released by Radiohead
HAS_GENRE-Song → Genre--Song has a genre-Paranoid Android has Alternative Rock
COLLABORATED_WITH	Artist → Artist	year (int)	Artists collaborated	Radiohead collaborated with Thom Yorke in 1997
INFLUENCED_BY	Artist → Artist	-	Artist influenced by another	Thom Yorke influenced by Bjork


# Key Quiries

1. Multi-Hop Traversal: Personalized Recommendations (3 hops)
What it does: Finds songs that share genres with songs the user already likes, ranked by number of matching genres.

MATCH (u:User {id: $userId})-[:LISTENED_TO]->(s:Song)
MATCH (s)-[:HAS_GENRE]->(g:Genre)
MATCH (g)<-[:HAS_GENRE]-(rec:Song)
WHERE rec <> s
MATCH (rec)-[:BELONGS_TO]->(:Album)-[:RELEASED_BY]->(art:Artist)
RETURN DISTINCT rec.id as songId, rec.title as title,
       art.name as artistName,
       COUNT(DISTINCT g) as matchScore
ORDER BY matchScore DESC
LIMIT $limit

# Why it matters: This is the core recommendation algorithm that finds new music based on taste.

2. Query Relational DB Would Find Awkward: Artist Collaboration Path
What it does: Finds the shortest collaboration path between two artists

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

# Why it's awkward in SQL: Would require recursive CTEs or multiple queries with self-joins to find paths of variable length.

3. Connected Songs (Multi-Hop with Multiple Relationship Types)
What it does: Finds songs connected through any path using multiple relationship types.

MATCH (start:Song {id: $songId})
MATCH path = shortestPath(
    (start)-[:BELONGS_TO|:RELEASED_BY|:COLLABORATED_WITH|:HAS_GENRE*1..${maxHops}]-(connected:Song)
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

# Why it's powerful: Shows the interconnected nature of the music graph.

4. Collaborative Filtering
What it does: Finds what similar users are listening to.

MATCH (u1:User {id: $userId})-[:LISTENED_TO]->(s:Song)
MATCH (s)<-[:LISTENED_TO]-(u2:User)
WHERE u1 <> u2
MATCH (u2)-[:LISTENED_TO]->(rec:Song)
WHERE NOT (u1)-[:LISTENED_TO]->(rec)
MATCH (rec)-[:BELONGS_TO]->(:Album)-[:RELEASED_BY]->(art:Artist)
RETURN rec.id as songId, rec.title as title,
       art.name as artistName,
       COUNT(DISTINCT u2) as userMatchScore
ORDER BY userMatchScore DESC

# Why it's useful: Finds what people with similar taste are listening to.

5. Database Statistics
What it does: Counts all nodes and relationships in the database.

-- Node counts
MATCH (n) 
RETURN labels(n)[0] as type, COUNT(n) as count
ORDER BY count DESC

-- Relationship counts
MATCH ()-[r]->()
RETURN type(r) as type, COUNT(r) as count
ORDER BY count DESC


# 🚀 Setup Instructions

## Prerequisites
Before you begin, ensure you have:

Requirement	Version	Check Command
Node.js	v16 or higher	node --version
npm	v8 or higher	npm --version
Git	Latest	git --version
CognoDB Account	Free tier	No credit card required

# Step 1: Create CognoDB Instance
-Go to CognoDB Console
-Open: https://console.cognodb.com/signup
-Click "Sign Up"
-Create Account
-Enter your email and password
-Verify your email (if required)
-No credit card required for free tier
-Create a Free Instance
-Click "Create Instance"
-Select "Free (c0)" tier
-Pick a region close to you
-Click "Create"
-Wait ~1 minute for provisioning
-Save Connection Details ⚠️ IMPORTANT
-Copy the connection URI: bolt+s://your-instance-id.databases.cognodb.cloud
-Note the username: cognodb
-Copy the password immediately - it's shown only once!
-Store these in a safe place

# Step 2: Clone the Repository
-git clone https://github.com/jessmendozatoledo/music-discovery-app.git
-cd music-discovery-app

# Step 3: Install Backend Dependencies
-cd backend
-npm install
-cd frontend
-npm install

# Step 4: Configure Environment Variables
# Create .env file
cp .env.example .env

# Or create manually:
echo "NEO4J_URI=bolt+s://your-instance.databases.cognodb.cloud" > .env
echo "NEO4J_USER=cognodb" >> .env
echo "NEO4J_PASSWORD=your-password" >> .env
echo "PORT=3000" >> .env

# .env sample 
NEO4J_URI=bolt+s://db-300ac091.bravo.databases.cognodb.com
NEO4J_USER=cognodb
NEO4J_PASSWORD=YourGeneratedPasswordHere
PORT=3000

# Step 5: Test Database Connection
npm run test

# Expected output:
✅ Connected to CognoDB successfully
✅ Test query successful: CognoDB Connected!
📊 Total nodes: 0
✨ All tests passed!

# Step 6: Seed the Database
npm run seed

# Expected output:
🌱 Starting database seeding...
✅ Database seeded successfully!
📊 Database Statistics:
  User: 6
  Song: 14
  Artist: 8
  Album: 8
  Genre: 8

  # Step 7: Start the Application
  npm start for backend and npm run dev for frontend.

  # Expected output:
  ==================================================
🎵 Music Discovery API
==================================================
🚀 Server running on http://localhost:3000
📊 Health: http://localhost:3000/health
✅ Database: Connected

📝 Available Endpoints:
  GET /api/users
  GET /api/users/:userId
  GET /api/songs/popular
  GET /api/songs/:songId/connected
  GET /api/artists/top
  GET /api/artists/:artist1/path/:artist2
  GET /api/recommendations/:userId
  GET /api/recommendations/collaborative/:userId
  GET /api/stats

🌐 Frontend available at: http://localhost:3000
=================================================


##### FOR THE DOCUMENTATION AND THE SCREENSHOTS OF THE APPLICATION ITSELF PLEASE REFER TO THE `docs` FOLDER 



# Deployment guide:
choose a free tier of any platform like vercel, render, netlify, etc, but i use render.

# Step 1: Push Code to GitHub
git init
git add .
git commit -m "Initial commit - Music Discovery App"
git remote add origin https://github.com/yourusername/music-discovery-app.git
git push -u origin main


# Step 2: Create Render Account
Go to https://render.com
Click "Sign Up" (use GitHub)
Authorize Render to access your repositories

# Step 3: Deploy Backend
Click "New +" → "Web Service"
Connect your GitHub repository
Configure:
Name: music-discovery-app
Environment: Node
Build Command: cd backend && npm install
Start Command: cd backend && npm start
Plan: Free

# Step 4: Add Environment Variables:
NEO4J_URI=bolt+s://your-instance.databases.cognodb.cloud
NEO4J_USER=cognodb
NEO4J_PASSWORD=your-password
PORT=3000

# Step 5: Click " Create Web Service"
# Step 6: Your app will be available at the URL provided by Render
✅ Backend: (example) https://your-backend.onrender.com
✅ Frontend: (example) https://your-frontend.onrender.com 


# The Video Demo walkthrough of this link

# The tech stack 
backend: node.js and express.js, dotenv, CORS
frontend: html, css, javascript, fetch API, Vanilla JS
database: Neo4j
Development: Nodemon, Git, npm

# Project Structure

music-discovery-app/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── models/
│   │   │   ├── user.js
│   │   │   ├── song.js
│   │   │   └── artist.js
│   │   ├── services/
│   │   │   ├── recommendationService.js
│   │   │   └── queryService.js
│   │   ├── routes/
│   │   │   ├── users.js
│   │   │   ├── songs.js
│   │   │   ├── artists.js
│   │   │   └── recommendations.js
│   │   └── app.js
│   ├── scripts/
│   │   ├── seedData.js
│   │   └── testConnection.js
│   ├── .env
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── styles/
│   │   └── main.css
│   └── scripts/
│       └── app.js
│
├── docs/
│   └── data-model.png
│
├── screenshots/
│   ├── dashboard.png
│   ├── recommendations.png
│   ├── artists.png
│   ├── stats.png
│   └── path.png
│
├── .gitignore
└── README.md