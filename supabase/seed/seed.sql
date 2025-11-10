-- Insert test users for development
-- Organizer user
INSERT INTO users (email, password_hash, first_name, last_name, role, status, consent_date, consent_version)
VALUES ('organizer@test.com', 'dummy_hash', 'Jan', 'Kowalski', 'organizer', 'approved', NOW(), '1.0');

-- Admin user
INSERT INTO users (email, password_hash, first_name, last_name, role, status, consent_date, consent_version)
VALUES ('admin@test.com', 'dummy_hash', 'Admin', 'User', 'admin', 'approved', NOW(), '1.0');

-- Player user
INSERT INTO users (email, password_hash, first_name, last_name, role, status, consent_date, consent_version)
VALUES ('player@test.com', 'dummy_hash', 'Player', 'User', 'player', 'approved', NOW(), '1.0');

-- Insert test players
INSERT INTO players (first_name, last_name, position, skill_rate, date_of_birth)
VALUES
  ('Robert', 'Lewandowski', 'forward', 10, '1988-08-21'),
  ('Kylian', 'Mbappe', 'forward', 9, '1998-12-20'),
  ('Lionel', 'Messi', 'forward', 10, '1987-06-24'),
  ('Cristiano', 'Ronaldo', 'forward', 9, '1985-02-05'),
  ('Neymar', 'Jr', 'forward', 8, '1992-02-05'),
  ('Kevin', 'De Bruyne', 'midfielder', 9, '1991-06-28'),
  ('Luka', 'Modric', 'midfielder', 9, '1985-09-09'),
  ('Toni', 'Kroos', 'midfielder', 8, '1990-01-04'),
  ('Sergio', 'Ramos', 'defender', 9, '1986-03-30'),
  ('Virgil', 'van Dijk', 'defender', 9, '1991-07-08'),
  ('Marcelo', 'Vieira', 'defender', 8, '1988-05-12'),
  ('Thibaut', 'Courtois', 'goalkeeper', 9, '1992-05-11'),
  ('Manuel', 'Neuer', 'goalkeeper', 9, '1986-03-27'),
  ('Alisson', 'Becker', 'goalkeeper', 8, '1992-10-02'),
  ('Ederson', 'Moraes', 'goalkeeper', 8, '1993-08-17');
