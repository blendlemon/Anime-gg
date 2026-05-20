-- Usuarios
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Openings de anime
CREATE TABLE anime_openings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  anime_title VARCHAR(255) NOT NULL,
  year INT,
  artist VARCHAR(255),
  thumbnail_url VARCHAR(500),
  youtube_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Torneos
CREATE TABLE tournaments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('planning', 'active', 'completed') DEFAULT 'planning',
  created_by INT NOT NULL,
  start_date DATETIME,
  end_date DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Participantes del torneo
CREATE TABLE tournament_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tournament_id INT NOT NULL,
  opening_id INT NOT NULL,
  seed INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
  FOREIGN KEY (opening_id) REFERENCES anime_openings(id),
  UNIQUE KEY unique_participant (tournament_id, opening_id)
);

-- Matches del torneo
CREATE TABLE matches (
  id INT PRIMARY KEY AUTO_INCREMENT,
  tournament_id INT NOT NULL,
  round INT NOT NULL,
  match_number INT NOT NULL,
  participant1_id INT,
  participant2_id INT,
  winner_id INT,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
  FOREIGN KEY (participant1_id) REFERENCES tournament_participants(id),
  FOREIGN KEY (participant2_id) REFERENCES tournament_participants(id),
  FOREIGN KEY (winner_id) REFERENCES tournament_participants(id)
);

-- Votos en matches
CREATE TABLE votes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  match_id INT NOT NULL,
  participant_id INT NOT NULL,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id),
  FOREIGN KEY (participant_id) REFERENCES tournament_participants(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
