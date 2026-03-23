-- ============================================================
-- FRINDER DATABASE SCHEMA
-- Complete 22-table schema for Frinder friendship platform
-- ============================================================

-- ============================================================
-- 1. COUNTRIES (Lookup)
-- ============================================================
CREATE TABLE countries (
  country_id INT AUTO_INCREMENT PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL,
  iso_code CHAR(2) NOT NULL UNIQUE,
  continent VARCHAR(50),
  flag_emoji VARCHAR(10),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO countries (country_name, iso_code, continent, flag_emoji) VALUES
('Bangladesh','BD','Asia','🇧🇩'),
('United States','US','Americas','🇺🇸'),
('United Kingdom','GB','Europe','🇬🇧'),
('India','IN','Asia','🇮🇳'),
('Canada','CA','Americas','🇨🇦'),
('Australia','AU','Oceania','🇦🇺'),
('Germany','DE','Europe','🇩🇪'),
('France','FR','Europe','🇫🇷'),
('Japan','JP','Asia','🇯🇵'),
('Brazil','BR','Americas','🇧🇷'),
('South Korea','KR','Asia','🇰🇷'),
('Nigeria','NG','Africa','🇳🇬'),
('South Africa','ZA','Africa','🇿🇦'),
('Mexico','MX','Americas','🇲🇽'),
('Italy','IT','Europe','🇮🇹'),
('Spain','ES','Europe','🇪🇸'),
('Pakistan','PK','Asia','🇵🇰'),
('China','CN','Asia','🇨🇳'),
('Indonesia','ID','Asia','🇮🇩'),
('Turkey','TR','Asia','🇹🇷'),
('Egypt','EG','Africa','🇪🇬'),
('Argentina','AR','Americas','🇦🇷'),
('Poland','PL','Europe','🇵🇱'),
('Netherlands','NL','Europe','🇳🇱'),
('Sweden','SE','Europe','🇸🇪'),
('Norway','NO','Europe','🇳🇴'),
('Denmark','DK','Europe','🇩🇰'),
('Portugal','PT','Europe','🇵🇹'),
('Greece','GR','Europe','🇬🇷'),
('Thailand','TH','Asia','🇹🇭'),
('Vietnam','VN','Asia','🇻🇳'),
('Malaysia','MY','Asia','🇲🇾'),
('Philippines','PH','Asia','🇵🇭'),
('Singapore','SG','Asia','🇸🇬'),
('UAE','AE','Asia','🇦🇪'),
('Saudi Arabia','SA','Asia','🇸🇦'),
('Kenya','KE','Africa','🇰🇪'),
('Ghana','GH','Africa','🇬🇭'),
('Ethiopia','ET','Africa','🇪🇹'),
('Colombia','CO','Americas','🇨🇴'),
('Chile','CL','Americas','🇨🇱'),
('Peru','PE','Americas','🇵🇪'),
('Russia','RU','Europe','🇷🇺'),
('Ukraine','UA','Europe','🇺🇦'),
('Czech Republic','CZ','Europe','🇨🇿'),
('Hungary','HU','Europe','🇭🇺'),
('Romania','RO','Europe','🇷🇴'),
('New Zealand','NZ','Oceania','🇳🇿'),
('Ireland','IE','Europe','🇮🇪'),
('Switzerland','CH','Europe','🇨🇭');

-- ============================================================
-- 2. LANGUAGES (Lookup)
-- ============================================================
CREATE TABLE languages (
  language_id INT AUTO_INCREMENT PRIMARY KEY,
  language_name VARCHAR(100) NOT NULL,
  iso_code VARCHAR(10) NOT NULL UNIQUE,
  native_name VARCHAR(100)
) ENGINE=InnoDB;

INSERT INTO languages (language_name, iso_code, native_name) VALUES
('English','en','English'),
('Bengali','bn','Bengali'),
('Hindi','hi','Hindi'),
('Spanish','es','Espanol'),
('French','fr','Francais'),
('German','de','Deutsch'),
('Japanese','ja','Japanese'),
('Korean','ko','Korean'),
('Portuguese','pt','Portugues'),
('Arabic','ar','Arabic'),
('Chinese (Mandarin)','zh','Chinese'),
('Russian','ru','Russian'),
('Italian','it','Italiano'),
('Turkish','tr','Turkce'),
('Dutch','nl','Nederlands'),
('Swedish','sv','Svenska'),
('Polish','pl','Polski'),
('Indonesian','id','Bahasa Indonesia'),
('Thai','th','Thai'),
('Vietnamese','vi','Tieng Viet'),
('Urdu','ur','Urdu'),
('Swahili','sw','Kiswahili'),
('Greek','el','Greek'),
('Norwegian','no','Norsk'),
('Danish','da','Dansk');

-- ============================================================
-- 3. INTERESTS (Lookup)
-- ============================================================
CREATE TABLE interests (
  interest_id INT AUTO_INCREMENT PRIMARY KEY,
  interest_name VARCHAR(100) NOT NULL,
  category VARCHAR(50),
  icon VARCHAR(10)
) ENGINE=InnoDB;

INSERT INTO interests (interest_name, category, icon) VALUES
('Gaming','Technology',''),
('Music','Arts',''),
('Travel','Lifestyle',''),
('Photography','Arts',''),
('Cooking','Lifestyle',''),
('Reading','Education',''),
('Fitness','Sports',''),
('Art and Design','Arts',''),
('Movies and TV','Entertainment',''),
('Coding','Technology',''),
('Science','Education',''),
('Sports','Sports',''),
('Hiking','Sports',''),
('Dancing','Arts',''),
('Writing','Arts',''),
('Anime and Manga','Entertainment',''),
('Fashion','Lifestyle',''),
('Entrepreneurship','Business',''),
('Philosophy','Education',''),
('Environmental','Lifestyle',''),
('Pets and Animals','Lifestyle',''),
('Food and Dining','Lifestyle',''),
('Language Learning','Education',''),
('Volunteering','Community',''),
('Board Games','Entertainment',''),
('Yoga and Meditation','Wellness',''),
('Astronomy','Science',''),
('History','Education',''),
('Podcasts','Media',''),
('Cycling','Sports','');

-- ============================================================
-- 4. USERS (Core)
-- ============================================================
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('Male','Female','Other','Prefer not to say') NOT NULL,
  country_id INT,
  city VARCHAR(100),
  bio TEXT,
  profile_picture VARCHAR(255),
  cover_photo VARCHAR(255),
  education VARCHAR(150),
  profession VARCHAR(150),
  email_verified TINYINT(1) DEFAULT 0,
  account_status ENUM('incomplete','pending','verified','rejected','suspended') DEFAULT 'incomplete',
  is_online TINYINT(1) DEFAULT 0,
  last_seen DATETIME,
  failed_attempts INT DEFAULT 0,
  locked_until DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (country_id) REFERENCES countries(country_id) ON DELETE SET NULL,
  INDEX idx_status (account_status),
  INDEX idx_country (country_id),
  INDEX idx_online (is_online)
) ENGINE=InnoDB;

-- ============================================================
-- 5. EMAIL OTPs (Security)
-- ============================================================
CREATE TABLE email_otps (
  otp_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  otp_code VARCHAR(6) NOT NULL,
  purpose ENUM('register','login','reset') NOT NULL,
  expires_at DATETIME NOT NULL,
  is_used TINYINT(1) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_purpose (user_id, purpose)
) ENGINE=InnoDB;

-- ============================================================
-- 6. USER VERIFICATION (Security)
-- ============================================================
CREATE TABLE user_verification (
  verification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  selfie_path VARCHAR(255),
  document_path VARCHAR(255),
  document_type ENUM('national_id','passport','driving_license','student_id','ssn'),
  gps_lat DECIMAL(10,8),
  gps_lng DECIMAL(11,8),
  gps_timestamp DATETIME,
  location_mismatch TINYINT(1) DEFAULT 0,
  verification_score INT DEFAULT 0,
  fraud_score INT DEFAULT 0,
  admin_notes TEXT,
  reviewed_at DATETIME,
  reviewed_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 7. LOGIN SESSIONS (Security)
-- ============================================================
CREATE TABLE login_sessions (
  session_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_token VARCHAR(128) NOT NULL UNIQUE,
  ip_address VARCHAR(45),
  device_info VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_token (session_token),
  INDEX idx_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- 8. USER INTERESTS (Junction)
-- ============================================================
CREATE TABLE user_interests (
  ui_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  interest_id INT NOT NULL,
  UNIQUE KEY unique_user_interest (user_id, interest_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (interest_id) REFERENCES interests(interest_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 9. USER LANGUAGES (Junction)
-- ============================================================
CREATE TABLE user_languages (
  ul_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  language_id INT NOT NULL,
  proficiency ENUM('Native','Fluent','Intermediate','Beginner') NOT NULL,
  is_native TINYINT(1) DEFAULT 0,
  UNIQUE KEY unique_user_language (user_id, language_id),
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (language_id) REFERENCES languages(language_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 10. FRIEND REQUESTS (Relationship)
-- ============================================================
CREATE TABLE friend_requests (
  request_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  message VARCHAR(255),
  status ENUM('pending','accepted','declined','cancelled') DEFAULT 'pending',
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  UNIQUE KEY unique_request (sender_id, receiver_id),
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_receiver (receiver_id),
  INDEX idx_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- 11. FRIENDS (Relationship)
-- ============================================================
CREATE TABLE friends (
  friendship_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id_1 INT NOT NULL,
  user_id_2 INT NOT NULL,
  status ENUM('active','blocked') DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_friendship (user_id_1, user_id_2),
  FOREIGN KEY (user_id_1) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id_2) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 12. MESSAGES (Activity)
-- ============================================================
CREATE TABLE messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  message_type ENUM('text','image','emoji') DEFAULT 'text',
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_read TINYINT(1) DEFAULT 0,
  read_at DATETIME,
  FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_conversation (sender_id, receiver_id, sent_at)
) ENGINE=InnoDB;

-- ============================================================
-- 13. POSTS (Content)
-- ============================================================
CREATE TABLE posts (
  post_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  content TEXT,
  image_path VARCHAR(255),
  visibility ENUM('friends','public') DEFAULT 'friends',
  like_count INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_posts (user_id),
  INDEX idx_feed_order (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- 14. POST LIKES (Junction)
-- ============================================================
CREATE TABLE post_likes (
  like_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 15. POST COMMENTS (Content)
-- ============================================================
CREATE TABLE post_comments (
  comment_id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  comment_text TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_post_comments (post_id)
) ENGINE=InnoDB;

-- ============================================================
-- 16. EVENTS (Activity)
-- ============================================================
CREATE TABLE events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  event_type ENUM('group','call','meetup') NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location VARCHAR(200),
  cover_image VARCHAR(255),
  scheduled_at DATETIME,
  max_attendees INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 17. EVENT ATTENDEES (Junction)
-- ============================================================
CREATE TABLE event_attendees (
  attendee_id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  user_id INT NOT NULL,
  status ENUM('invited','accepted','declined') DEFAULT 'invited',
  responded_at DATETIME,
  UNIQUE KEY unique_attendee (event_id, user_id),
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 18. REPORTS (Safety)
-- ============================================================
CREATE TABLE reports (
  report_id INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT NOT NULL,
  reported_user_id INT NOT NULL,
  reason ENUM('spam','fake_account','harassment','inappropriate_content','impersonation','other') NOT NULL,
  description VARCHAR(500),
  status ENUM('pending','reviewed','resolved') DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reported_user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 19. BLOCKED USERS (Safety)
-- ============================================================
CREATE TABLE blocked_users (
  block_id INT AUTO_INCREMENT PRIMARY KEY,
  blocker_id INT NOT NULL,
  blocked_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_block (blocker_id, blocked_id),
  FOREIGN KEY (blocker_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (blocked_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 20. USER BADGES (Gamification)
-- ============================================================
CREATE TABLE user_badges (
  badge_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  badge_type VARCHAR(50) NOT NULL,
  badge_label VARCHAR(100),
  earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- 21. USER ACTIVITY (Audit)
-- ============================================================
CREATE TABLE user_activity (
  activity_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_user_activity (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- 22. ADMIN USERS (Admin)
-- ============================================================
CREATE TABLE admin_users (
  admin_id INT AUTO_INCREMENT PRIMARY KEY,
  admin_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('superadmin','moderator') DEFAULT 'moderator',
  last_login DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO admin_users (admin_name, email, password_hash, role) VALUES
('Frinder Admin', 'admin@frinder.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin');

-- ============================================================
-- DEMO USERS
-- ============================================================
INSERT INTO users (username, email, password_hash, full_name, date_of_birth, gender, country_id, city, bio, account_status, email_verified, is_online) VALUES
('alex_chen','alex@demo.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Alex Chen','1998-03-15','Male',9,'Tokyo','Anime lover, coder, and ramen enthusiast. Always up for a good conversation!','verified',1,1),
('sofia_rivera','sofia@demo.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Sofia Rivera','2000-07-22','Female',4,'Mumbai','Traveler and photographer. Exploring the world one city at a time','verified',1,0),
('james_okafor','james@demo.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','James Okafor','1997-11-08','Male',12,'Lagos','Music producer and football fan. Connecting cultures through sound','verified',1,1),
('priya_sharma','priya@demo.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Priya Sharma','1999-05-30','Female',4,'Delhi','Bookworm. Yoga practitioner. Looking for intellectual friendships','verified',1,0),
('lucas_muller','lucas@demo.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Lucas Muller','1996-09-12','Male',7,'Berlin','Software engineer by day, board games by night','verified',1,1),
('aya_nakamura','aya@demo.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Aya Nakamura','2001-02-14','Female',9,'Osaka','Fashion and K-pop fan. Let us exchange languages!','verified',1,0),
('khan_tariq','tariq@demo.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Tariq Khan','1995-08-20','Male',1,'Dhaka','Tech entrepreneur and cricket fan. Founder of dreams','verified',1,1),
('emma_johnson','emma@demo.com','$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','Emma Johnson','2000-12-01','Female',2,'New York','Artist and activist. Making the world more colorful','verified',1,0);

INSERT INTO user_verification (user_id, verification_score, fraud_score) VALUES
(1,100,0),(2,100,0),(3,100,0),(4,100,0),
(5,100,0),(6,100,0),(7,100,0),(8,100,0);

INSERT INTO user_interests (user_id, interest_id) VALUES
(1,1),(1,10),(1,16),(1,9),(1,12),
(2,3),(2,4),(2,22),(2,9),(2,17),
(3,2),(3,12),(3,1),(3,24),(3,8),
(4,6),(4,26),(4,20),(4,23),(4,19),
(5,10),(5,25),(5,1),(5,11),(5,18),
(6,17),(6,16),(6,13),(6,23),(6,14),
(7,10),(7,18),(7,12),(7,1),(7,11),
(8,8),(8,6),(8,24),(8,15),(8,20);

INSERT INTO user_languages (user_id, language_id, proficiency, is_native) VALUES
(1,1,'Fluent',0),(1,7,'Native',1),(1,11,'Fluent',0),
(2,1,'Native',1),(2,4,'Fluent',0),(2,3,'Native',1),
(3,1,'Native',1),(3,22,'Native',1),(3,5,'Intermediate',0),
(4,1,'Fluent',0),(4,3,'Native',1),(4,21,'Native',1),
(5,1,'Fluent',0),(5,6,'Native',1),(5,16,'Intermediate',0),
(6,7,'Native',1),(6,1,'Fluent',0),(6,8,'Intermediate',0),
(7,1,'Fluent',0),(7,2,'Native',1),(7,21,'Native',1),
(8,1,'Native',1),(8,5,'Intermediate',0),(8,4,'Beginner',0);

INSERT INTO friends (user_id_1, user_id_2, status) VALUES
(1,3,'active'),(1,7,'active'),(2,4,'active'),(3,5,'active'),(6,7,'active');

INSERT INTO posts (user_id, content, visibility, like_count) VALUES
(1,'Just finished an incredible anime marathon session. Anyone else watching Frieren? The storytelling is absolutely breathtaking!','public',12),
(2,'Golden hour in Mumbai never disappoints. Every sunset here tells a different story','friends',8),
(3,'New beat just dropped! Mixing Afrobeats with electronic sounds. The fusion of cultures in music is what makes it magical','public',24),
(4,'Reading The Midnight Library for the third time. Some books just keep revealing new layers','friends',6),
(7,'Excited to announce we just crossed 100 users on our startup! The journey of a thousand miles begins with one step','public',19);

INSERT INTO post_likes (post_id, user_id) VALUES
(1,3),(1,7),(1,2),(2,1),(2,4),(3,1),(3,7),(3,5),(3,2),(3,8),(5,1),(5,3),(5,6);

INSERT INTO post_comments (post_id, user_id, comment_text) VALUES
(1,7,'Frieren is on another level! The pacing is so different from other anime'),
(1,2,'I just started it! The art style is stunning'),
(3,5,'This is fire!! Send me the SoundCloud link'),
(3,1,'Love when different cultures blend in music. This is art!'),
(5,6,'Congratulations! Small milestones are what build empires');

INSERT INTO messages (sender_id, receiver_id, content, is_read) VALUES
(1,7,'Hey Tariq! Saw your post about the startup. Congrats man!',1),
(7,1,'Thanks Alex! It has been a wild journey. You coding these days?',1),
(1,7,'Yeah working on a game engine project. Would love your input sometime!',0),
(3,1,'Alex! When are we gaming together? Been ages',0),
(2,4,'Priya! Which book are you reading now? Need recommendations',1),
(4,2,'The Midnight Library by Matt Haig. Absolutely beautiful. You?',1);

INSERT INTO events (creator_id, event_type, title, description, location, scheduled_at, max_attendees) VALUES
(7,'meetup','Dhaka Tech Meetup','Monthly tech enthusiasts meetup. Talks on AI and startups!','Dhaka, Bangladesh','2026-04-01 18:00:00',50),
(1,'group','Anime Discussion Club','A group for anime fans to discuss seasonal anime weekly','Online',NULL,NULL),
(3,'call','Music Collab Session','Lets jam together! Open to all musicians','Online','2026-03-25 20:00:00',10);

INSERT INTO event_attendees (event_id, user_id, status) VALUES
(1,1,'accepted'),(1,5,'accepted'),(1,6,'invited'),
(2,6,'accepted'),(2,4,'invited'),
(3,1,'accepted'),(3,5,'invited');

INSERT INTO user_badges (user_id, badge_type, badge_label) VALUES
(1,'first_friend','First Friend!'),
(1,'10_friends','Social Butterfly'),
(3,'5_countries','World Explorer'),
(7,'first_friend','First Friend!'),
(7,'post_star','Post Star');