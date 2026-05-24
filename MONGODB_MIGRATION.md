# MongoDB Migration Guide

## Overview
Migración exitosa de MySQL a MongoDB. El proyecto ahora usa MongoDB Atlas (cloud).

## Modelos Mongoose

### User
```javascript
{ _id, username, email, password_hash, createdAt, updatedAt }
```

### AnimeOpening
```javascript
{ _id, title, anime_title, anime_slug, year, season, artist, thumbnail_url, video_url, video_resolution, type (OP|ED), sequence, source, timestamps }
```

### Tournament
```javascript
{ _id, name, size (8|16|32), filterType (OP|ED|both), status (planning|active|completed), created_by, participants: [{ opening_id, seed }], timestamps }
```

### Match
```javascript
{ _id, tournament_id, round, match_number, participant1_id, participant2_id, winner_id, status (pending|in_progress|completed), timestamps }
```

### Vote
```javascript
{ _id, match_id, participant_id, user_id, createdAt }
```

### Room
```javascript
{ _id, tournament_id, invite_code (unique, 8 chars), current_match_id, status (waiting|voting|results), connected_users: [ObjectId], timestamps }
```

## Migraciones de Consultas SQL a Mongoose

### SELECT
```javascript
const tournament = await Tournament.findById(id).populate('created_by', 'username email')
```

### INSERT
```javascript
const tournament = await Tournament.create({ name, description })
```

### UPDATE
```javascript
await Tournament.findByIdAndUpdate(id, { name }, { new: true })
```

### DELETE
```javascript
await Tournament.findByIdAndDelete(id)
```

## Referencias

- [MongoDB Docs](https://docs.mongodb.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
