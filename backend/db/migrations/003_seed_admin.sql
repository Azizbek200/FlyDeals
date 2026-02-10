-- Seed default admin user (change password after first login!)
-- Email: admin@flydeals.com / Password: admin123
INSERT INTO admins (email, password_hash)
VALUES ('admin@flydeals.com', '$2a$10$I3DO9.a0bkM1hoUPLeH8LeotwzMRzJIN1.c2x/hiaXkPGnWkIYuuy')
ON CONFLICT (email) DO NOTHING;
