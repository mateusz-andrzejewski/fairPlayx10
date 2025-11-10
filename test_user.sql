-- Insert test organizer user
INSERT INTO users (email, password_hash, first_name, last_name, role, status, consent_date, consent_version)
VALUES ('organizer@test.com', 'dummy_hash', 'Jan', 'Kowalski', 'organizer', 'approved', NOW(), '1.0');

-- Show all users
SELECT id, email, first_name, last_name, role, status FROM users;
