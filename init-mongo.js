// Script de inicialización de MongoDB
db = db.getSiblingDB('anime_tournament');

// Crear colecciones con validación de esquema
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'password_hash'],
      properties: {
        _id: { bsonType: 'objectId' },
        username: { bsonType: 'string', description: 'Username único' },
        email: { bsonType: 'string', description: 'Email único' },
        password_hash: { bsonType: 'string' },
        created_at: { bsonType: 'date', description: 'Fecha de creación' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('anime_openings', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'anime_title'],
      properties: {
        _id: { bsonType: 'objectId' },
        title: { bsonType: 'string' },
        anime_title: { bsonType: 'string' },
        anime_slug: { bsonType: 'string' },
        year: { bsonType: 'int' },
        season: { bsonType: 'string' },
        artist: { bsonType: 'string' },
        thumbnail_url: { bsonType: 'string' },
        youtube_url: { bsonType: 'string' },
        video_url: { bsonType: 'string' },
        video_resolution: { bsonType: 'int' },
        type: { enum: ['OP', 'ED'] },
        sequence: { bsonType: 'int' },
        source: { bsonType: 'string', enum: ['animethemes', 'user'] },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('tournaments')
;

db.createCollection('tournament_participants', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tournament_id', 'opening_id'],
      properties: {
        _id: { bsonType: 'objectId' },
        tournament_id: { bsonType: 'objectId' },
        opening_id: { bsonType: 'objectId' },
        seed: { bsonType: 'int' },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('matches', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['tournament_id', 'round', 'match_number'],
      properties: {
        _id: { bsonType: 'objectId' },
        tournament_id: { bsonType: 'objectId' },
        round: { bsonType: 'int' },
        match_number: { bsonType: 'int' },
        participant1_id: { bsonType: 'objectId' },
        participant2_id: { bsonType: 'objectId' },
        winner_id: { bsonType: 'objectId' },
        status: { enum: ['pending', 'in_progress', 'completed'] },
        created_at: { bsonType: 'date' },
        updated_at: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('votes', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['match_id', 'participant_id'],
      properties: {
        _id: { bsonType: 'objectId' },
        match_id: { bsonType: 'objectId' },
        participant_id: { bsonType: 'objectId' },
        user_id: { bsonType: 'objectId' },
        created_at: { bsonType: 'date' }
      }
    }
  }
});

// Crear índices
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });

db.anime_openings.createIndex({ anime_slug: 1 });
db.anime_openings.createIndex({ title: 1 });

db.tournaments.createIndex({ created_by: 1 });
db.tournaments.createIndex({ created_at: -1 });

db.tournament_participants.createIndex({ tournament_id: 1 });
db.tournament_participants.createIndex({ opening_id: 1 });
db.tournament_participants.createIndex({ tournament_id: 1, opening_id: 1 }, { unique: true });

db.matches.createIndex({ tournament_id: 1 });
db.matches.createIndex({ tournament_id: 1, round: 1 });
db.matches.createIndex({ winner_id: 1 });

db.votes.createIndex({ match_id: 1 });
db.votes.createIndex({ user_id: 1 });

print('MongoDB initialized successfully!');
