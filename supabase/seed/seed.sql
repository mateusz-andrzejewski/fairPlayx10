-- Development seed data for dashboard views without relying on mocks

-- Ensure core players are available
INSERT INTO players (id, first_name, last_name, position, skill_rate, date_of_birth, created_at, updated_at, deleted_at)
VALUES
  (555, 'Dev', 'Administrator', 'midfielder', 8, '1995-04-12', NOW() - INTERVAL '210 days', NOW(), NULL),
  (556, 'Anna', 'Striker', 'forward', 9, '1998-08-21', NOW() - INTERVAL '160 days', NOW(), NULL),
  (557, 'Bartek', 'Keeper', 'goalkeeper', 8, '1992-02-10', NOW() - INTERVAL '240 days', NOW(), NULL),
  (558, 'Alicja', 'Defender', 'defender', 7, '1996-06-18', NOW() - INTERVAL '190 days', NOW(), NULL),
  (559, 'Michał', 'Playmaker', 'midfielder', 8, '1994-11-05', NOW() - INTERVAL '175 days', NOW(), NULL)
ON CONFLICT (id) DO UPDATE
SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  position = EXCLUDED.position,
  skill_rate = EXCLUDED.skill_rate,
  date_of_birth = EXCLUDED.date_of_birth,
  deleted_at = NULL,
  updated_at = NOW();

-- Ensure dev admin user exists
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  role,
  status,
  consent_date,
  consent_version,
  player_id,
  created_at,
  updated_at,
  deleted_at
)
VALUES (
  9999,
  'dev.admin@fairplay.local',
  'dev-mode-password',
  'Dev',
  'Administrator',
  'admin',
  'approved',
  NOW() - INTERVAL '45 days',
  '1.0',
  555,
  NOW() - INTERVAL '45 days',
  NOW(),
  NULL
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  player_id = EXCLUDED.player_id,
  consent_date = EXCLUDED.consent_date,
  consent_version = EXCLUDED.consent_version,
  deleted_at = NULL,
  updated_at = NOW();

-- Sample upcoming events for dashboard
INSERT INTO events (
  id,
  name,
  location,
  event_datetime,
  max_places,
  optional_fee,
  status,
  current_signups_count,
  organizer_id,
  created_at,
  updated_at,
  deleted_at
)
VALUES
  (
    301,
    'Trening Drużynowy',
    'Hala Sportowa',
    NOW() + INTERVAL '2 days',
    20,
    0,
    'active',
    3,
    9999,
    NOW() - INTERVAL '14 days',
    NOW(),
    NULL
  ),
  (
    302,
    'Sparing Weekendowy',
    'Stadion Miejski',
    NOW() + INTERVAL '5 days',
    22,
    15,
    'active',
    2,
    9999,
    NOW() - INTERVAL '10 days',
    NOW(),
    NULL
  ),
  (
    303,
    'Turniej FairPlay',
    'Centrum Sportowe',
    NOW() + INTERVAL '12 days',
    32,
    25,
    'active',
    1,
    9999,
    NOW() - INTERVAL '30 days',
    NOW(),
    NULL
  )
ON CONFLICT (id) DO UPDATE
SET
  name = EXCLUDED.name,
  location = EXCLUDED.location,
  event_datetime = EXCLUDED.event_datetime,
  max_places = EXCLUDED.max_places,
  optional_fee = EXCLUDED.optional_fee,
  status = EXCLUDED.status,
  current_signups_count = EXCLUDED.current_signups_count,
  organizer_id = EXCLUDED.organizer_id,
  deleted_at = NULL,
  updated_at = NOW();

-- Event signups matching seeded events
INSERT INTO event_signups (id, event_id, player_id, signup_timestamp, status, resignation_timestamp)
VALUES
  (2001, 301, 555, NOW() - INTERVAL '3 days', 'confirmed', NULL),
  (2002, 301, 556, NOW() - INTERVAL '4 days', 'confirmed', NULL),
  (2003, 301, 557, NOW() - INTERVAL '5 days', 'confirmed', NULL),
  (2004, 302, 556, NOW() - INTERVAL '2 days', 'confirmed', NULL),
  (2005, 302, 558, NOW() - INTERVAL '2 days', 'confirmed', NULL),
  (2006, 303, 559, NOW() - INTERVAL '1 day', 'confirmed', NULL)
ON CONFLICT (id) DO UPDATE
SET
  event_id = EXCLUDED.event_id,
  player_id = EXCLUDED.player_id,
  signup_timestamp = EXCLUDED.signup_timestamp,
  status = EXCLUDED.status,
  resignation_timestamp = EXCLUDED.resignation_timestamp;
