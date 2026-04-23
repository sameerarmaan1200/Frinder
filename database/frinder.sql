-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 17, 2026 at 01:23 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `frinder`
--

-- --------------------------------------------------------

--
-- Table structure for table `admin_users`
--

CREATE TABLE `admin_users` (
  `admin_id` int(11) NOT NULL,
  `admin_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('superadmin','moderator') DEFAULT 'moderator',
  `last_login` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_users`
--

INSERT INTO `admin_users` (`admin_id`, `admin_name`, `email`, `password_hash`, `role`, `last_login`, `created_at`) VALUES
(1, 'Frinder Admin', 'admin@frinder.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'superadmin', NULL, '2026-03-25 01:30:32'),
(2, 'Sameer Admin', 'kabeermailkturkey2022@gmail.com', '$2y$10$txhCK5a6K1x88nThqCVQbuIXfSwnkS4OMiEi2MNFgw0UvdmCPZjJi', 'superadmin', '2026-04-15 00:31:38', '2026-03-29 22:48:26'),
(3, 'Aditya Admin', 'aditya.b.tanmoy2023@gmail.com', '$2y$10$2A3bgQHyQ4oJlCgmi9XCfOpTtARSBZUy4PSdZB30hXxQBX0COguiK', 'superadmin', '2026-03-30 19:03:57', '2026-03-29 22:48:26'),
(4, 'Abs Dihan Admin', 'absdihan0070@gmail.com', '$2y$10$ZX.r0Vki6RqB5FDyoKH2sOoUdoNgE4G/wDQIt3IMQ01RpQ7db96Ty', 'superadmin', '2026-03-30 19:07:23', '2026-03-29 22:48:26');

-- --------------------------------------------------------

--
-- Table structure for table `blocked_users`
--

CREATE TABLE `blocked_users` (
  `block_id` int(11) NOT NULL,
  `blocker_id` int(11) NOT NULL,
  `blocked_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `countries`
--

CREATE TABLE `countries` (
  `country_id` int(11) NOT NULL,
  `country_name` varchar(100) NOT NULL,
  `iso_code` char(2) NOT NULL,
  `continent` varchar(50) DEFAULT NULL,
  `flag_emoji` varchar(10) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `countries`
--

INSERT INTO `countries` (`country_id`, `country_name`, `iso_code`, `continent`, `flag_emoji`, `created_at`) VALUES
(1, 'Bangladesh', 'BD', 'Asia', '🇧🇩', '2026-03-25 01:30:30'),
(2, 'United States', 'US', 'Americas', '🇺🇸', '2026-03-25 01:30:30'),
(3, 'United Kingdom', 'GB', 'Europe', '🇬🇧', '2026-03-25 01:30:30'),
(4, 'India', 'IN', 'Asia', '🇮🇳', '2026-03-25 01:30:30'),
(5, 'Canada', 'CA', 'Americas', '🇨🇦', '2026-03-25 01:30:30'),
(6, 'Australia', 'AU', 'Oceania', '🇦🇺', '2026-03-25 01:30:30'),
(7, 'Germany', 'DE', 'Europe', '🇩🇪', '2026-03-25 01:30:30'),
(8, 'France', 'FR', 'Europe', '🇫🇷', '2026-03-25 01:30:30'),
(9, 'Japan', 'JP', 'Asia', '🇯🇵', '2026-03-25 01:30:30'),
(10, 'Brazil', 'BR', 'Americas', '🇧🇷', '2026-03-25 01:30:30'),
(11, 'South Korea', 'KR', 'Asia', '🇰🇷', '2026-03-25 01:30:30'),
(12, 'Nigeria', 'NG', 'Africa', '🇳🇬', '2026-03-25 01:30:30'),
(13, 'South Africa', 'ZA', 'Africa', '🇿🇦', '2026-03-25 01:30:30'),
(14, 'Mexico', 'MX', 'Americas', '🇲🇽', '2026-03-25 01:30:30'),
(15, 'Italy', 'IT', 'Europe', '🇮🇹', '2026-03-25 01:30:30'),
(16, 'Spain', 'ES', 'Europe', '🇪🇸', '2026-03-25 01:30:30'),
(17, 'Pakistan', 'PK', 'Asia', '🇵🇰', '2026-03-25 01:30:30'),
(18, 'China', 'CN', 'Asia', '🇨🇳', '2026-03-25 01:30:30'),
(19, 'Indonesia', 'ID', 'Asia', '🇮🇩', '2026-03-25 01:30:30'),
(20, 'Turkey', 'TR', 'Asia', '🇹🇷', '2026-03-25 01:30:30'),
(21, 'Egypt', 'EG', 'Africa', '🇪🇬', '2026-03-25 01:30:30'),
(22, 'Argentina', 'AR', 'Americas', '🇦🇷', '2026-03-25 01:30:30'),
(23, 'Poland', 'PL', 'Europe', '🇵🇱', '2026-03-25 01:30:30'),
(24, 'Netherlands', 'NL', 'Europe', '🇳🇱', '2026-03-25 01:30:30'),
(25, 'Sweden', 'SE', 'Europe', '🇸🇪', '2026-03-25 01:30:30'),
(26, 'Norway', 'NO', 'Europe', '🇳🇴', '2026-03-25 01:30:30'),
(27, 'Denmark', 'DK', 'Europe', '🇩🇰', '2026-03-25 01:30:30'),
(28, 'Portugal', 'PT', 'Europe', '🇵🇹', '2026-03-25 01:30:30'),
(29, 'Greece', 'GR', 'Europe', '🇬🇷', '2026-03-25 01:30:30'),
(30, 'Thailand', 'TH', 'Asia', '🇹🇭', '2026-03-25 01:30:30'),
(31, 'Vietnam', 'VN', 'Asia', '🇻🇳', '2026-03-25 01:30:30'),
(32, 'Malaysia', 'MY', 'Asia', '🇲🇾', '2026-03-25 01:30:30'),
(33, 'Philippines', 'PH', 'Asia', '🇵🇭', '2026-03-25 01:30:30'),
(34, 'Singapore', 'SG', 'Asia', '🇸🇬', '2026-03-25 01:30:30'),
(35, 'UAE', 'AE', 'Asia', '🇦🇪', '2026-03-25 01:30:30'),
(36, 'Saudi Arabia', 'SA', 'Asia', '🇸🇦', '2026-03-25 01:30:30'),
(37, 'Kenya', 'KE', 'Africa', '🇰🇪', '2026-03-25 01:30:30'),
(38, 'Ghana', 'GH', 'Africa', '🇬🇭', '2026-03-25 01:30:30'),
(39, 'Ethiopia', 'ET', 'Africa', '🇪🇹', '2026-03-25 01:30:30'),
(40, 'Colombia', 'CO', 'Americas', '🇨🇴', '2026-03-25 01:30:30'),
(41, 'Chile', 'CL', 'Americas', '🇨🇱', '2026-03-25 01:30:30'),
(42, 'Peru', 'PE', 'Americas', '🇵🇪', '2026-03-25 01:30:30'),
(43, 'Russia', 'RU', 'Europe', '🇷🇺', '2026-03-25 01:30:30'),
(44, 'Ukraine', 'UA', 'Europe', '🇺🇦', '2026-03-25 01:30:30'),
(45, 'Czech Republic', 'CZ', 'Europe', '🇨🇿', '2026-03-25 01:30:30'),
(46, 'Hungary', 'HU', 'Europe', '🇭🇺', '2026-03-25 01:30:30'),
(47, 'Romania', 'RO', 'Europe', '🇷🇴', '2026-03-25 01:30:30'),
(48, 'New Zealand', 'NZ', 'Oceania', '🇳🇿', '2026-03-25 01:30:30'),
(49, 'Ireland', 'IE', 'Europe', '🇮🇪', '2026-03-25 01:30:30'),
(50, 'Switzerland', 'CH', 'Europe', '🇨🇭', '2026-03-25 01:30:30');

-- --------------------------------------------------------

--
-- Table structure for table `email_otps`
--

CREATE TABLE `email_otps` (
  `otp_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `otp_code` varchar(64) NOT NULL,
  `purpose` enum('register','login','reset','reset_token') NOT NULL,
  `expires_at` datetime NOT NULL,
  `is_used` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `email_otps`
--

INSERT INTO `email_otps` (`otp_id`, `user_id`, `otp_code`, `purpose`, `expires_at`, `is_used`, `created_at`) VALUES
(1, 194, '300655', 'login', '2026-03-25 02:37:12', 1, '2026-03-25 02:32:12'),
(2, 193, '181015', 'login', '2026-03-25 02:40:48', 0, '2026-03-25 02:35:48'),
(3, 194, '521017', 'login', '2026-03-27 21:54:57', 1, '2026-03-27 21:49:57'),
(4, 194, '707190', 'login', '2026-03-29 22:58:35', 1, '2026-03-29 22:53:35'),
(5, 194, '772620', 'login', '2026-03-30 00:22:01', 1, '2026-03-30 00:17:01'),
(6, 194, '905630', 'login', '2026-03-30 00:36:18', 1, '2026-03-30 00:31:18'),
(7, 194, '492375', 'login', '2026-03-30 00:48:22', 1, '2026-03-30 00:43:22'),
(8, 194, '219771', 'login', '2026-03-30 01:50:06', 1, '2026-03-30 01:45:06'),
(9, 194, '747698', 'login', '2026-03-30 02:58:19', 1, '2026-03-30 02:53:19'),
(10, 194, '232640', 'login', '2026-03-30 18:57:57', 1, '2026-03-30 18:52:57'),
(11, 195, '879115', 'register', '2026-04-02 16:41:28', 1, '2026-04-02 16:31:28'),
(12, 195, '279155', 'login', '2026-04-02 16:38:53', 1, '2026-04-02 16:33:53'),
(13, 194, '990023', 'login', '2026-04-03 16:09:08', 1, '2026-04-03 16:04:08'),
(14, 194, '266730', 'login', '2026-04-07 01:09:09', 1, '2026-04-07 01:04:09'),
(15, 194, '135673', 'login', '2026-04-07 01:10:18', 1, '2026-04-07 01:05:18'),
(16, 194, '211503', 'reset', '2026-04-07 01:29:23', 1, '2026-04-07 01:14:23'),
(17, 194, '966c70', 'reset_token', '2026-04-07 01:24:56', 1, '2026-04-07 01:14:56'),
(18, 194, '897227', 'reset', '2026-04-07 01:30:53', 1, '2026-04-07 01:15:53'),
(19, 194, '2574fe', 'reset_token', '2026-04-07 01:26:26', 1, '2026-04-07 01:16:26'),
(20, 194, '891109', 'login', '2026-04-07 01:27:48', 1, '2026-04-07 01:22:48'),
(21, 194, '358735', 'login', '2026-04-08 00:10:11', 1, '2026-04-08 00:05:11'),
(22, 194, '188066', 'login', '2026-04-08 00:12:07', 1, '2026-04-08 00:07:07'),
(23, 194, '867728', 'login', '2026-04-08 00:48:11', 1, '2026-04-08 00:43:11'),
(24, 194, '653875', 'login', '2026-04-08 01:12:29', 1, '2026-04-08 01:07:29'),
(25, 194, '793376', 'login', '2026-04-08 01:33:33', 1, '2026-04-08 01:28:33'),
(26, 194, '247109', 'login', '2026-04-08 02:24:11', 1, '2026-04-08 02:19:11'),
(27, 194, '273092', 'login', '2026-04-08 02:27:39', 1, '2026-04-08 02:22:39'),
(28, 194, '234104', 'login', '2026-04-08 02:30:26', 1, '2026-04-08 02:25:26'),
(29, 194, '733289', 'login', '2026-04-08 20:29:39', 1, '2026-04-08 20:24:39'),
(30, 194, '732054', 'login', '2026-04-08 20:30:52', 1, '2026-04-08 20:25:52'),
(32, 194, '600527', 'login', '2026-04-09 01:46:04', 1, '2026-04-09 01:41:04'),
(33, 194, '378123', 'login', '2026-04-09 02:17:37', 1, '2026-04-09 02:12:37'),
(34, 194, '712772', 'login', '2026-04-09 02:34:35', 1, '2026-04-09 02:29:35'),
(35, 194, '772942', 'login', '2026-04-10 19:00:32', 1, '2026-04-10 18:55:32'),
(36, 194, '787979', 'login', '2026-04-10 19:01:49', 1, '2026-04-10 18:56:49'),
(37, 194, '569891', 'login', '2026-04-10 19:06:32', 1, '2026-04-10 19:01:32'),
(38, 194, '630288', 'login', '2026-04-10 19:30:52', 1, '2026-04-10 19:25:52'),
(39, 194, '447511', 'login', '2026-04-10 19:32:11', 1, '2026-04-10 19:27:11'),
(40, 194, '972992', 'login', '2026-04-10 19:41:31', 1, '2026-04-10 19:36:31'),
(41, 194, '578833', 'login', '2026-04-10 19:47:00', 1, '2026-04-10 19:42:00'),
(42, 194, '197971', 'login', '2026-04-10 19:56:43', 1, '2026-04-10 19:51:43'),
(43, 194, '136954', 'reset', '2026-04-10 20:27:12', 1, '2026-04-10 20:12:12'),
(44, 194, 'a123209dd7c96307f7ca5a1b7528ebe59e0c7592d948c03d43a056dd9387faad', 'reset_token', '2026-04-10 16:22:43', 1, '2026-04-10 20:12:43'),
(45, 194, '587875', 'reset', '2026-04-10 20:28:44', 1, '2026-04-10 20:13:44'),
(46, 194, '5587884374c542e22b89fd3dbb0d8eeaec917f19fefc1d8b61eb571b766057dc', 'reset_token', '2026-04-10 16:24:03', 1, '2026-04-10 20:14:03'),
(47, 194, '115240', 'reset', '2026-04-10 20:36:10', 1, '2026-04-10 20:21:10'),
(48, 194, '3c8d0073ecab12051222ca94eaf26aa1cdda567816e67f72c11ff89ebb9435ac', 'reset_token', '2026-04-10 16:31:27', 1, '2026-04-10 20:21:27'),
(49, 194, '554516', 'reset', '2026-04-10 21:55:25', 1, '2026-04-10 21:40:25'),
(50, 194, '773305', 'reset', '2026-04-10 17:50:54', 1, '2026-04-10 21:40:54'),
(51, 194, '293768', 'reset', '2026-04-10 22:21:29', 1, '2026-04-10 22:06:29'),
(52, 194, '241410', 'reset', '2026-04-10 18:17:07', 1, '2026-04-10 22:07:07'),
(53, 194, '487514', 'reset', '2026-04-10 22:34:08', 1, '2026-04-10 22:19:08'),
(54, 194, '671380', 'login', '2026-04-11 00:52:26', 1, '2026-04-11 00:47:26'),
(55, 194, '213993', 'reset', '2026-04-11 01:05:17', 1, '2026-04-11 00:50:17'),
(56, 194, '737187', 'login', '2026-04-11 00:57:28', 1, '2026-04-11 00:52:28'),
(57, 199, '134948', 'register', '2026-04-11 01:51:05', 1, '2026-04-11 01:36:05'),
(58, 200, '589679', 'register', '2026-04-11 02:14:32', 1, '2026-04-11 01:59:32'),
(59, 201, '758731', 'register', '2026-04-11 02:24:01', 1, '2026-04-11 02:09:01'),
(60, 202, '565597', 'register', '2026-04-11 02:33:58', 1, '2026-04-11 02:18:58'),
(61, 203, '775012', 'register', '2026-04-11 19:31:21', 1, '2026-04-11 19:16:21'),
(62, 194, '124812', 'login', '2026-04-11 19:31:25', 1, '2026-04-11 19:26:25'),
(63, 204, '495884', 'register', '2026-04-11 20:13:51', 1, '2026-04-11 19:58:51'),
(64, 204, '320423', 'login', '2026-04-11 20:05:37', 1, '2026-04-11 20:00:37'),
(65, 204, '114152', 'reset', '2026-04-11 20:16:59', 1, '2026-04-11 20:01:59'),
(66, 204, '685427', 'login', '2026-04-11 20:08:16', 1, '2026-04-11 20:03:16'),
(67, 194, '727340', 'login', '2026-04-11 23:44:35', 1, '2026-04-11 23:39:35'),
(68, 205, '490879', 'register', '2026-04-17 17:25:58', 1, '2026-04-17 17:10:58'),
(69, 205, '342124', 'login', '2026-04-17 17:17:55', 1, '2026-04-17 17:12:55'),
(70, 205, '715899', 'reset', '2026-04-17 17:34:09', 1, '2026-04-17 17:19:09'),
(71, 205, '639810', 'login', '2026-04-17 17:25:08', 1, '2026-04-17 17:20:08');

-- --------------------------------------------------------

--
-- Table structure for table `events`
--

CREATE TABLE `events` (
  `event_id` int(11) NOT NULL,
  `creator_id` int(11) NOT NULL,
  `event_type` enum('group','call','meetup') NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `location` varchar(200) DEFAULT NULL,
  `cover_image` varchar(255) DEFAULT NULL,
  `scheduled_at` datetime DEFAULT NULL,
  `max_attendees` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `events`
--

INSERT INTO `events` (`event_id`, `creator_id`, `event_type`, `title`, `description`, `location`, `cover_image`, `scheduled_at`, `max_attendees`, `created_at`) VALUES
(1, 7, 'meetup', 'Dhaka Tech Meetup', 'Monthly tech enthusiasts meetup. Talks on AI and startups!', 'Dhaka, Bangladesh', NULL, '2026-04-01 18:00:00', 50, '2026-03-25 01:30:33'),
(2, 1, 'group', 'Anime Discussion Club', 'A group for anime fans to discuss seasonal anime weekly', 'Online', NULL, NULL, NULL, '2026-03-25 01:30:33'),
(3, 3, 'call', 'Music Collab Session', 'Let\'s jam together! Open to all musicians 🎵', 'Online', NULL, '2026-03-25 20:00:00', 10, '2026-03-25 01:30:33');

-- --------------------------------------------------------

--
-- Table structure for table `event_attendees`
--

CREATE TABLE `event_attendees` (
  `attendee_id` int(11) NOT NULL,
  `event_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('invited','accepted','declined') DEFAULT 'invited',
  `responded_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `event_attendees`
--

INSERT INTO `event_attendees` (`attendee_id`, `event_id`, `user_id`, `status`, `responded_at`) VALUES
(1, 1, 1, 'accepted', NULL),
(2, 1, 5, 'accepted', NULL),
(3, 1, 6, 'invited', NULL),
(4, 2, 6, 'accepted', NULL),
(5, 2, 4, 'invited', NULL),
(6, 3, 1, 'accepted', NULL),
(7, 3, 5, 'invited', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `friends`
--

CREATE TABLE `friends` (
  `friendship_id` int(11) NOT NULL,
  `user_id_1` int(11) NOT NULL,
  `user_id_2` int(11) NOT NULL,
  `status` enum('active','blocked') DEFAULT 'active',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `friends`
--

INSERT INTO `friends` (`friendship_id`, `user_id_1`, `user_id_2`, `status`, `created_at`) VALUES
(1, 1, 3, 'active', '2026-03-25 01:30:33'),
(2, 1, 7, 'active', '2026-03-25 01:30:33'),
(3, 2, 4, 'active', '2026-03-25 01:30:33'),
(4, 3, 5, 'active', '2026-03-25 01:30:33'),
(5, 6, 7, 'active', '2026-03-25 01:30:33'),
(6, 194, 195, 'active', '2026-04-03 16:14:22'),
(7, 194, 204, 'active', '2026-04-11 23:40:31');

-- --------------------------------------------------------

--
-- Table structure for table `friend_requests`
--

CREATE TABLE `friend_requests` (
  `request_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `message` varchar(255) DEFAULT NULL,
  `status` enum('pending','accepted','declined','cancelled') DEFAULT 'pending',
  `sent_at` datetime DEFAULT current_timestamp(),
  `responded_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `friend_requests`
--

INSERT INTO `friend_requests` (`request_id`, `sender_id`, `receiver_id`, `message`, `status`, `sent_at`, `responded_at`) VALUES
(1, 194, 192, NULL, 'pending', '2026-03-29 22:54:57', NULL),
(2, 194, 193, NULL, 'pending', '2026-03-29 22:55:00', NULL),
(3, 195, 9, NULL, 'pending', '2026-04-02 16:34:34', NULL),
(4, 195, 188, NULL, 'pending', '2026-04-02 16:34:40', NULL),
(5, 195, 194, NULL, 'accepted', '2026-04-02 16:34:42', '2026-04-03 16:14:21'),
(6, 194, 9, NULL, 'pending', '2026-04-07 01:12:17', NULL),
(7, 194, 197, NULL, 'pending', '2026-04-07 01:12:21', NULL),
(8, 194, 34, NULL, 'pending', '2026-04-07 01:12:22', NULL),
(9, 194, 189, NULL, 'pending', '2026-04-10 20:02:13', NULL),
(10, 194, 188, NULL, 'pending', '2026-04-11 00:48:44', NULL),
(11, 204, 194, NULL, 'accepted', '2026-04-11 20:01:39', '2026-04-11 23:40:31'),
(12, 204, 9, NULL, 'pending', '2026-04-11 20:01:48', NULL),
(13, 205, 188, NULL, 'pending', '2026-04-17 17:14:04', NULL),
(14, 205, 9, NULL, 'pending', '2026-04-17 17:16:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `interests`
--

CREATE TABLE `interests` (
  `interest_id` int(11) NOT NULL,
  `interest_name` varchar(100) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `icon` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `interests`
--

INSERT INTO `interests` (`interest_id`, `interest_name`, `category`, `icon`) VALUES
(1, 'Gaming', 'Technology', '🎮'),
(2, 'Music', 'Arts', '🎵'),
(3, 'Travel', 'Lifestyle', '✈️'),
(4, 'Photography', 'Arts', '📸'),
(5, 'Cooking', 'Lifestyle', '🍳'),
(6, 'Reading', 'Education', '📚'),
(7, 'Fitness', 'Sports', '💪'),
(8, 'Art & Design', 'Arts', '🎨'),
(9, 'Movies & TV', 'Entertainment', '🎬'),
(10, 'Coding & Dev', 'Technology', '💻'),
(11, 'Science', 'Education', '🔬'),
(12, 'Sports', 'Sports', '⚽'),
(13, 'Hiking', 'Sports', '🥾'),
(14, 'Dancing', 'Arts', '💃'),
(15, 'Writing', 'Arts', '✍️'),
(16, 'Anime & Manga', 'Entertainment', '🌸'),
(17, 'Fashion', 'Lifestyle', '👗'),
(18, 'Entrepreneurship', 'Business', '🚀'),
(19, 'Philosophy', 'Education', '🧠'),
(20, 'Environmental', 'Lifestyle', '🌿'),
(21, 'Pets & Animals', 'Lifestyle', '🐾'),
(22, 'Food & Dining', 'Lifestyle', '🍜'),
(23, 'Language Learning', 'Education', '🌐'),
(24, 'Volunteering', 'Community', '🤝'),
(25, 'Board Games', 'Entertainment', '🎲'),
(26, 'Yoga & Meditation', 'Wellness', '🧘'),
(27, 'Astronomy', 'Science', '🔭'),
(28, 'History', 'Education', '🏛️'),
(29, 'Podcasts', 'Media', '🎙️'),
(30, 'Cycling', 'Sports', '🚴');

-- --------------------------------------------------------

--
-- Table structure for table `languages`
--

CREATE TABLE `languages` (
  `language_id` int(11) NOT NULL,
  `language_name` varchar(100) NOT NULL,
  `iso_code` varchar(10) NOT NULL,
  `native_name` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `languages`
--

INSERT INTO `languages` (`language_id`, `language_name`, `iso_code`, `native_name`) VALUES
(1, 'English', 'en', 'English'),
(2, 'Bengali', 'bn', 'বাংলা'),
(3, 'Hindi', 'hi', 'हिन्दी'),
(4, 'Spanish', 'es', 'Español'),
(5, 'French', 'fr', 'Français'),
(6, 'German', 'de', 'Deutsch'),
(7, 'Japanese', 'ja', '日本語'),
(8, 'Korean', 'ko', '한국어'),
(9, 'Portuguese', 'pt', 'Português'),
(10, 'Arabic', 'ar', 'العربية'),
(11, 'Chinese (Mandarin)', 'zh', '中文'),
(12, 'Russian', 'ru', 'Русский'),
(13, 'Italian', 'it', 'Italiano'),
(14, 'Turkish', 'tr', 'Türkçe'),
(15, 'Dutch', 'nl', 'Nederlands'),
(16, 'Swedish', 'sv', 'Svenska'),
(17, 'Polish', 'pl', 'Polski'),
(18, 'Indonesian', 'id', 'Bahasa Indonesia'),
(19, 'Thai', 'th', 'ภาษาไทย'),
(20, 'Vietnamese', 'vi', 'Tiếng Việt'),
(21, 'Urdu', 'ur', 'اردو'),
(22, 'Swahili', 'sw', 'Kiswahili'),
(23, 'Greek', 'el', 'Ελληνικά'),
(24, 'Norwegian', 'no', 'Norsk'),
(25, 'Danish', 'da', 'Dansk');

-- --------------------------------------------------------

--
-- Table structure for table `login_sessions`
--

CREATE TABLE `login_sessions` (
  `session_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `session_token` char(64) NOT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `device_info` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `expires_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_sessions`
--

INSERT INTO `login_sessions` (`session_id`, `user_id`, `session_token`, `ip_address`, `device_info`, `created_at`, `expires_at`) VALUES
(23, 194, '0bbce5384f992dd7d2055916ea7e451400e663bda476b1c655cca3b5b3784f4a', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 00:52:50', '2026-05-10 20:52:50'),
(24, 194, '6b0ba21d8382e5ffdf23a3d420800a369c833c008cbef3c48b41e4254b485756', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 19:27:11', '2026-05-11 15:27:11'),
(26, 204, '5464328097ef30a98a3b1eca16acfef35222e2fbbcbbbe0e0629fba6af6eea60', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 20:03:50', '2026-05-11 16:03:50'),
(27, 194, '72eaaa0a9c88ab80bab9b388069ded658c335f60073031704bcab18ef95d953e', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36', '2026-04-11 23:40:20', '2026-05-11 19:40:20'),
(29, 205, 'df0a3ee18430e4fadae704f5d17afc84ef4990c4bde0c5fcc5d5632a9ff5c59b', '::1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', '2026-04-17 17:20:43', '2026-05-17 13:20:43');

-- --------------------------------------------------------

--
-- Table structure for table `messages`
--

CREATE TABLE `messages` (
  `message_id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_size` int(11) DEFAULT NULL,
  `file_mime` varchar(100) DEFAULT NULL,
  `message_type` enum('text','image','emoji','video','doc') DEFAULT 'text',
  `sent_at` datetime DEFAULT current_timestamp(),
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `messages`
--

INSERT INTO `messages` (`message_id`, `sender_id`, `receiver_id`, `content`, `file_path`, `file_name`, `file_size`, `file_mime`, `message_type`, `sent_at`, `is_read`, `read_at`) VALUES
(1, 1, 7, 'Hey Tariq! Saw your post about the startup. Congrats man! 🎉', NULL, NULL, NULL, NULL, 'text', '2026-03-25 01:30:33', 1, NULL),
(2, 7, 1, 'Thanks Alex! It\'s been a wild journey. You coding these days?', NULL, NULL, NULL, NULL, 'text', '2026-03-25 01:30:33', 1, NULL),
(3, 1, 7, 'Yeah working on a game engine project. Would love your input sometime!', NULL, NULL, NULL, NULL, 'text', '2026-03-25 01:30:33', 0, NULL),
(4, 3, 1, 'Alex! When are we gaming together? Been ages 🎮', NULL, NULL, NULL, NULL, 'text', '2026-03-25 01:30:33', 0, NULL),
(5, 2, 4, 'Priya! Which book are you reading now? Need recommendations 📚', NULL, NULL, NULL, NULL, 'text', '2026-03-25 01:30:33', 1, NULL),
(6, 4, 2, 'The Midnight Library by Matt Haig. Absolutely beautiful. You?', NULL, NULL, NULL, NULL, 'text', '2026-03-25 01:30:33', 1, NULL),
(7, 194, 195, 'hi', NULL, NULL, NULL, NULL, 'text', '2026-04-03 16:16:23', 0, NULL),
(8, 194, 195, 'Screenshot_2026-04-03_205642.png', 'messages/194_195_1775502650_e6ed7668.png', 'Screenshot_2026-04-03_205642.png', 13940, 'image/png', 'image', '2026-04-07 01:10:50', 0, NULL),
(9, 194, 195, 'hi', NULL, NULL, NULL, NULL, 'text', '2026-04-09 02:40:09', 0, NULL),
(10, 194, 195, 'Doc3.pdf', 'messages/194_195_1775680966_534cfd88.pdf', 'Doc3.pdf', 27254, 'application/pdf', 'doc', '2026-04-09 02:42:46', 0, NULL),
(11, 194, 195, '10395606-hd_1080_1920_24fps__1___1_.mp4', 'messages/194_195_1775829431_ad1cffb1.mp4', '10395606-hd_1080_1920_24fps__1___1_.mp4', 7602376, 'video/mp4', 'video', '2026-04-10 19:57:11', 0, NULL),
(12, 205, 188, 'Tumi ki ar valo hobe na ?', NULL, NULL, NULL, NULL, 'text', '2026-04-17 17:14:19', 0, NULL),
(13, 205, 188, 'Doc3.pdf', 'messages/205_188_1776424496_672e4f21.pdf', 'Doc3.pdf', 27254, 'application/pdf', 'doc', '2026-04-17 17:14:56', 0, NULL),
(14, 205, 9, 'transparent-naruto-detailed-digital-artwork-of-person-with-anime-1710891337093.webp', 'messages/205_9_1776424723_0c697cd6.webp', 'transparent-naruto-detailed-digital-artwork-of-person-with-anime-1710891337093.webp', 42162, 'image/webp', 'image', '2026-04-17 17:18:43', 0, NULL),
(15, 205, 9, 'valo hoi jao', NULL, NULL, NULL, NULL, 'text', '2026-04-17 17:18:54', 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `visibility` enum('friends','public') DEFAULT 'friends',
  `like_count` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`post_id`, `user_id`, `content`, `image_path`, `visibility`, `like_count`, `created_at`) VALUES
(1, 1, 'Just finished an incredible anime marathon session 🎌 Anyone else watching Frieren? The storytelling is absolutely breathtaking!', NULL, 'public', 14, '2026-03-25 01:30:33'),
(2, 2, 'Golden hour in Mumbai never disappoints 📸✨ Every sunset here tells a different story', NULL, 'friends', 8, '2026-03-25 01:30:33'),
(3, 3, 'New beat just dropped! Mixing Afrobeats with electronic sounds 🎵🌍 The fusion of cultures in music is what makes it magical', NULL, 'public', 25, '2026-03-25 01:30:33'),
(4, 4, 'Reading \"The Midnight Library\" for the third time. Some books just keep revealing new layers 📚', NULL, 'friends', 6, '2026-03-25 01:30:33'),
(5, 7, 'Excited to announce we just crossed 100 users on our startup! The journey of a thousand miles begins with one step 🚀', NULL, 'public', 20, '2026-03-25 01:30:33'),
(6, 194, 'hi', 'post_194_1775681145.png', 'friends', 1, '2026-04-09 02:45:45'),
(7, 194, 'HIIIIII', NULL, 'friends', 1, '2026-04-10 19:59:58');

-- --------------------------------------------------------

--
-- Table structure for table `post_comments`
--

CREATE TABLE `post_comments` (
  `comment_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `comment_text` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post_comments`
--

INSERT INTO `post_comments` (`comment_id`, `post_id`, `user_id`, `comment_text`, `created_at`) VALUES
(1, 1, 7, 'Frieren is on another level! The pacing is so different from other anime', '2026-03-25 01:30:33'),
(2, 1, 2, 'I just started it! The art style is stunning', '2026-03-25 01:30:33'),
(3, 3, 5, 'This is fire!! Send me the SoundCloud link 🔥', '2026-03-25 01:30:33'),
(4, 3, 1, 'Love when different cultures blend in music. This is art!', '2026-03-25 01:30:33'),
(5, 5, 6, 'Congratulations! 🎉 Small milestones are what build empires', '2026-03-25 01:30:33'),
(6, 1, 205, 'Valo hobe na ?', '2026-04-17 17:13:53');

-- --------------------------------------------------------

--
-- Table structure for table `post_likes`
--

CREATE TABLE `post_likes` (
  `like_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `post_likes`
--

INSERT INTO `post_likes` (`like_id`, `post_id`, `user_id`, `created_at`) VALUES
(1, 1, 3, '2026-03-25 01:30:33'),
(2, 1, 7, '2026-03-25 01:30:33'),
(3, 1, 2, '2026-03-25 01:30:33'),
(4, 2, 1, '2026-03-25 01:30:33'),
(5, 2, 4, '2026-03-25 01:30:33'),
(6, 3, 1, '2026-03-25 01:30:33'),
(7, 3, 7, '2026-03-25 01:30:33'),
(8, 3, 5, '2026-03-25 01:30:33'),
(9, 3, 2, '2026-03-25 01:30:33'),
(10, 3, 8, '2026-03-25 01:30:33'),
(11, 5, 1, '2026-03-25 01:30:33'),
(12, 5, 3, '2026-03-25 01:30:33'),
(13, 5, 6, '2026-03-25 01:30:33'),
(16, 6, 194, '2026-04-09 02:45:59'),
(18, 1, 194, '2026-04-10 20:00:39'),
(20, 5, 194, '2026-04-10 20:00:59'),
(21, 3, 194, '2026-04-10 20:01:10'),
(22, 7, 194, '2026-04-11 01:14:07'),
(23, 1, 205, '2026-04-17 17:13:39');

-- --------------------------------------------------------

--
-- Table structure for table `post_reactions`
--

CREATE TABLE `post_reactions` (
  `reaction_id` int(11) NOT NULL,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `emoji` varchar(10) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `post_reactions`
--

INSERT INTO `post_reactions` (`reaction_id`, `post_id`, `user_id`, `emoji`, `created_at`) VALUES
(2, 3, 194, '❤️', '2026-04-08 20:46:38'),
(3, 6, 194, '😂', '2026-04-08 20:46:13'),
(4, 1, 194, '❤️', '2026-04-08 20:46:19'),
(5, 5, 194, '😂', '2026-04-10 14:01:05'),
(6, 7, 194, '👍', '2026-04-10 19:14:12'),
(7, 1, 205, '😢', '2026-04-17 11:13:33');

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

CREATE TABLE `reports` (
  `report_id` int(11) NOT NULL,
  `reporter_id` int(11) NOT NULL,
  `reported_user_id` int(11) NOT NULL,
  `reason` enum('spam','fake_account','harassment','inappropriate_content','impersonation','other') NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `status` enum('pending','reviewed','resolved') DEFAULT 'pending',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reports`
--

INSERT INTO `reports` (`report_id`, `reporter_id`, `reported_user_id`, `reason`, `description`, `status`, `created_at`) VALUES
(1, 194, 7, 'harassment', NULL, 'resolved', '2026-04-11 23:41:46');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('Male','Female','Other','Prefer not to say') NOT NULL,
  `country_id` int(11) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `cover_photo` varchar(255) DEFAULT NULL,
  `education` varchar(150) DEFAULT NULL,
  `profession` varchar(150) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `account_status` enum('incomplete','pending','verified','rejected','suspended') DEFAULT 'incomplete',
  `is_online` tinyint(1) DEFAULT 0,
  `last_seen` datetime DEFAULT NULL,
  `failed_attempts` int(11) DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `full_name`, `date_of_birth`, `gender`, `country_id`, `city`, `bio`, `profile_picture`, `cover_photo`, `education`, `profession`, `email_verified`, `account_status`, `is_online`, `last_seen`, `failed_attempts`, `locked_until`, `created_at`) VALUES
(1, 'alex_chen', 'alex@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alex Chen', '1998-03-15', 'Male', 9, 'Tokyo', 'Anime lover, coder, and ramen enthusiast 🍜 Always up for a good conversation!', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 2, NULL, '2026-03-25 01:30:32'),
(2, 'sofia_rivera', 'sofia@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sofia Rivera', '2000-07-22', 'Female', 4, 'Mumbai', 'Traveler & photographer 📸 Exploring the world one city at a time', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 01:30:32'),
(3, 'james_okafor', 'james@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'James Okafor', '1997-11-08', 'Male', 12, 'Lagos', 'Music producer & football fan ⚽ Connecting cultures through sound', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 01:30:32'),
(4, 'priya_sharma', 'priya@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Priya Sharma', '1999-05-30', 'Female', 4, 'Delhi', 'Bookworm 📚 Yoga practitioner 🧘 Looking for intellectual friendships', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 01:30:32'),
(5, 'lucas_müller', 'lucas@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lucas Müller', '1996-09-12', 'Male', 7, 'Berlin', 'Software engineer by day, board games by night 🎲', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 01:30:32'),
(6, 'aya_nakamura', 'aya@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aya Nakamura', '2001-02-14', 'Female', 9, 'Osaka', 'Fashion & K-pop fan 💙 Let\'s exchange languages!', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 01:30:32'),
(7, 'khan_tariq', 'tariq@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tariq Khan', '1995-08-20', 'Male', 1, 'Dhaka', 'Tech entrepreneur & cricket fan 🏏 Founder of dreams', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 01:30:32'),
(8, 'emma_johnson', 'emma@demo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emma Johnson', '2000-12-01', 'Female', 2, 'New York', 'Artist & activist 🎨 Making the world more colorful', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 01:30:32'),
(9, 'dihu', 'absdihan0070@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Abu bokkor siddique Dihan', '2004-12-10', 'Male', 1, 'Chattogram', 'selectively social frank', NULL, NULL, 'bsc in computer science', 'engineer', 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 01:36:47'),
(10, 'michael_w', 'm.williams.88@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael Williams', '1988-04-12', 'Male', 2, 'Chicago', 'Avid hiker and software developer. Always looking for the next adventure.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(11, 'sarah_jenkins', 'sjenkins_photo@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah Jenkins', '1992-09-25', 'Female', 3, 'Manchester', 'Wedding photographer by day, amateur baker by night.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(12, 'amit_patel91', 'amit.patel1991@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Amit Patel', '1991-11-03', 'Male', 4, 'Mumbai', 'Fintech enthusiast. Coffee is my primary fuel source.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(13, 'chloe.davies', 'chloe.davies.art@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Chloe Davies', '1996-02-14', 'Female', 5, 'Toronto', 'Digital artist and cat mom. I talk about movies too much.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(14, 'j_garcia_mx', 'jgarcia.dev@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Javier Garcia', '1994-07-08', 'Male', 14, 'Mexico City', 'Building apps and playing guitar. Let us chat about tech.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(15, 'emma_louise_89', 'emmalou89@hotmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emma Robinson', '1989-12-01', 'Female', 6, 'Melbourne', 'Primary school teacher. Love reading historical fiction and gardening.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(16, 'kenji_t', 'kenji.tanaka.jp@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kenji Tanaka', '1995-05-19', 'Male', 9, 'Osaka', 'Graphic designer. Street photography is my passion. Ramen connoisseur.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(17, 'lucia_silva', 'lucia_s_99@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lucia Silva', '1999-08-30', 'Female', 10, 'Rio de Janeiro', 'Medical student. Beach lover and volleyball player.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(18, 'david_miller_tech', 'davidm.tech@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David Miller', '1985-01-22', 'Male', 2, 'Austin', 'Cybersecurity consultant. I love taking things apart to see how they work.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(19, 'hassan.ali.bd', 'hassan.ali92@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hassan Ali', '1992-06-15', 'Male', 1, 'Sylhet', 'Freelance writer. Exploring the history of Bengal. Tea over coffee.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(20, 'rachel_green', 'rachel.g.fashion@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rachel Green', '1993-03-05', 'Female', 2, 'New York', 'Fashion buyer. Always on the hunt for vintage finds.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(21, 'oliver_wright', 'owright_88@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Oliver Wright', '1988-10-17', 'Male', 3, 'Edinburgh', 'Architect. Sketching old buildings and drinking stout.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(22, 'priya.das', 'priya.das.writes@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Priya Das', '1997-12-11', 'Female', 4, 'Kolkata', 'Journalism grad. Poetry, politics, and indie music.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(23, 'marcus_j', 'marcus_jones_90@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marcus Jones', '1990-02-28', 'Male', 2, 'Atlanta', 'Sports physiotherapist. Weekend warrior. Go Falcons!', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(24, 'sofia.martinez', 'smartinez.arq@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sofia Martinez', '1994-11-20', 'Female', 16, 'Madrid', 'Interior designer. Minimalist living and sustainable architecture.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(25, 'thomas_weber', 'tweber.berlin@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Thomas Weber', '1987-05-04', 'Male', 7, 'Munich', 'Automotive engineer. Spending weekends hiking the Alps.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(26, 'aisha_k', 'aisha.k.95@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aisha Khan', '1995-08-16', 'Female', 17, 'Lahore', 'Food blogger. Documenting the best street food in the city.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(27, 'daniel.lee.92', 'danlee1992@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Daniel Lee', '1992-04-09', 'Male', 11, 'Seoul', 'UI/UX Designer. Synthwave enthusiast and mechanical keyboard builder.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(28, 'isabella_rossi', 'isabella.rossi@hotmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Isabella Rossi', '1998-01-25', 'Female', 15, 'Milan', 'Marketing executive. Passionate about art history and good wine.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(29, 'james.taylor.uk', 'jtaylor_finance@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'James Taylor', '1986-07-14', 'Male', 3, 'London', 'Accountant by day, jazz drummer by night.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(30, 'mia_clarkson', 'mia.clarkson.99@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mia Clarkson', '1999-10-02', 'Female', 6, 'Sydney', 'Marine biology student. Ocean conservation is my life.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(31, 'ahmed_syed', 'ahmed_syed_tech@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ahmed Syed', '1993-12-18', 'Male', 35, 'Dubai', 'Cloud architect. Love trying out new gadgets and traveling.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(32, 'natalie_brown', 'natalie_b_art@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Natalie Brown', '1991-03-22', 'Female', 5, 'Vancouver', 'Illustrator and comic book artist. Always drawing.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(33, 'carlos_m', 'carlos.mendoza.88@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos Mendoza', '1988-06-07', 'Male', 14, 'Guadalajara', 'Chef and restaurateur. Bringing traditional recipes to the modern world.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(34, 'fatima_rahman', 'fatima.r.96@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Fatima Rahman', '1996-09-11', 'Female', 1, 'Chattogram', 'Software QA engineer. Weekend baker and book club host.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(35, 'ryan_cooper', 'ryan.cooper.fitness@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ryan Cooper', '1990-02-19', 'Male', 2, 'Denver', 'Personal trainer. Let us talk about macros and mountain biking.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(36, 'yuki_saito', 'yuki.saito.music@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Yuki Saito', '1997-11-27', 'Female', 9, 'Kyoto', 'Classical pianist. Exploring the intersection of traditional and modern music.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(37, 'kevin_nguyen', 'k_nguyen_92@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kevin Nguyen', '1992-08-05', 'Male', 2, 'Seattle', 'Data scientist. I love numbers, statistics, and making perfect espresso.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(38, 'anna_kowalski', 'anna.k.poland@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Anna Kowalski', '1994-12-14', 'Female', 23, 'Warsaw', 'History teacher. Documenting local history and folklore.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(39, 'leo_ferrari', 'leo.ferrari.auto@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Leo Ferrari', '1989-04-30', 'Male', 15, 'Turin', 'Classic car restorer. Oil on my hands, peace in my mind.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(40, 'zara_ali_uk', 'zara.ali.london@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Zara Ali', '1995-07-21', 'Female', 3, 'Birmingham', 'HR Manager. Diversity and inclusion advocate. Plant parent.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(41, 'nicolas_dubois', 'ndubois.fr@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nicolas Dubois', '1987-10-08', 'Male', 8, 'Lyon', 'Sommelier and food critic. Seeking the perfect pairing.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(42, 'kavya_nair', 'kavya.nair.dev@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Kavya Nair', '1998-05-12', 'Female', 4, 'Bangalore', 'Full stack developer. Open source contributor. Board game geek.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(43, 'samuel_jackson', 's.jackson.91@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Samuel Jackson', '1991-01-19', 'Male', 2, 'Los Angeles', 'Video editor and aspiring filmmaker. Living for the cut.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(44, 'olivia_smith', 'olivia_smith_writes@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Olivia Smith', '1993-06-25', 'Female', 5, 'Montreal', 'Copywriter by day, aspiring novelist by night.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(45, 'chen_wei', 'c_wei_tech@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Chen Wei', '1990-09-03', 'Male', 18, 'Shanghai', 'Hardware engineer. Building the devices of tomorrow.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(46, 'maria_santos', 'msantos.br@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maria Santos', '1996-12-28', 'Female', 10, 'Sao Paulo', 'Event planner. Organizing chaos into beautiful moments.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(47, 'william_turner', 'w_turner.uk@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'William Turner', '1985-03-11', 'Male', 3, 'Liverpool', 'High school science teacher. Trying to make chemistry fun.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(48, 'grace_kim', 'grace.kim.94@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Grace Kim', '1994-08-07', 'Female', 2, 'San Francisco', 'Product manager in ed-tech. Passionate about accessible learning.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(49, 'diego_ruiz', 'druiz.es@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Diego Ruiz', '1992-02-15', 'Male', 16, 'Barcelona', 'Urban planner. Advocating for more green spaces in the city.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(50, 'amanda_lee', 'alee.music@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Amanda Lee', '1997-04-22', 'Female', 6, 'Brisbane', 'Indie pop singer-songwriter. Touring local venues and making noise.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(51, 'omar_farooq', 'omar.f.89@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Omar Farooq', '1989-11-09', 'Male', 21, 'Cairo', 'Archaeologist. Digging up the past to understand the future.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(52, 'sophie_martin', 'smartin.fr@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sophie Martin', '1995-01-30', 'Female', 8, 'Paris', 'Art gallery curator. Surrounded by beauty every day.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(53, 'joshua_hall', 'jhall_fitness@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Joshua Hall', '1991-06-04', 'Male', 2, 'Miami', 'Yoga instructor. Finding balance on and off the mat.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(54, 'emily_chen', 'echen_98@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emily Chen', '1998-10-18', 'Female', 5, 'Toronto', 'Computer science student. Looking for study buddies and hackathon partners.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(55, 'lucas_silva', 'lsilva.pt@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lucas Silva', '1986-05-25', 'Male', 28, 'Lisbon', 'Surfer and oceanographer. Protecting the waves I ride.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(56, 'hannah_scott', 'hannah.scott.87@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hannah Scott', '1987-12-08', 'Female', 3, 'Glasgow', 'Veterinarian. Animal lover and advocate for rescue dogs.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(57, 'aryan_gupta', 'agupta.tech@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aryan Gupta', '1993-07-12', 'Male', 4, 'Delhi', 'App developer. Trying to build the next big thing. Let us network.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(58, 'victoria_king', 'vking_writes@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Victoria King', '1990-03-19', 'Female', 2, 'Boston', 'Freelance journalist. Asking questions and telling stories.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(59, 'matteo_bianchi', 'mbianchi.it@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Matteo Bianchi', '1994-09-02', 'Male', 15, 'Rome', 'Barista and coffee roaster. Let me teach you about espresso.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(60, 'julia_muller', 'jmuller.de@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Julia Muller', '1996-01-14', 'Female', 7, 'Hamburg', 'Logistics coordinator. Organization is my superpower.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(61, 'benjamin_clark', 'bclark_95@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Benjamin Clark', '1995-06-21', 'Male', 6, 'Perth', 'Environmental scientist. Working on sustainable energy solutions.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(62, 'camila_rodriguez', 'crodriguez.ar@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Camila Rodriguez', '1992-11-05', 'Female', 22, 'Buenos Aires', 'Tango dancer and instructor. Living life with passion.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(63, 'anthony_ward', 'award_finance@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Anthony Ward', '1985-08-29', 'Male', 3, 'Leeds', 'Financial advisor. Helping people plan for their future.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(64, 'natalia_ivanova', 'nivanova.ru@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Natalia Ivanova', '1988-02-10', 'Female', 43, 'Moscow', 'Ballet instructor. Discipline and grace in everything.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(65, 'daniel_garcia', 'dgarcia_89@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Daniel Garcia', '1989-07-24', 'Male', 2, 'Houston', 'Oil and gas engineer. Texas born and raised.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(66, 'lili_zhang', 'lzhang.cn@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lili Zhang', '1997-03-08', 'Female', 18, 'Beijing', 'E-commerce specialist. Analyzing trends and consumer behavior.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(67, 'jacob_evans', 'jevans_music@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jacob Evans', '1993-10-15', 'Male', 5, 'Calgary', 'Sound engineer. I make things sound good.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(68, 'elena_popa', 'epopa.ro@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Elena Popa', '1990-12-03', 'Female', 47, 'Bucharest', 'Dentist. Keeping smiles bright. Love hiking in the Carpathians.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(69, 'michael_chang', 'mchang.sg@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael Chang', '1986-05-18', 'Male', 34, 'Singapore', 'Supply chain manager. Keeping the global economy moving.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(70, 'ava_robinson', 'arobinson_96@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ava Robinson', '1996-09-27', 'Female', 2, 'Philadelphia', 'Social worker. Advocating for vulnerable youth.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(71, 'lucas_andersson', 'landersson.se@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lucas Andersson', '1991-04-11', 'Male', 25, 'Stockholm', 'Game developer. Currently building an indie RPG.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(72, 'charlotte_baker', 'cbaker_art@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charlotte Baker', '1987-11-22', 'Female', 3, 'Bristol', 'Ceramic artist. Making beautiful things out of mud.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(73, 'tariq_mahmood', 'tmahmood.pk@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Tariq Mahmood', '1994-01-05', 'Male', 17, 'Karachi', 'Textile engineer. Innovative fabrics and sustainable production.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(74, 'olivia_thomas', 'othomas_92@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Olivia Thomas', '1992-06-19', 'Female', 6, 'Adelaide', 'Winemaker. Turning grapes into liquid poetry.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(75, 'william_harris', 'wharris_tech@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'William Harris', '1989-08-31', 'Male', 2, 'Seattle', 'Database administrator. Keeping data safe and accessible.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(76, 'sophia_wagner', 'swagner.de@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sophia Wagner', '1995-03-14', 'Female', 7, 'Frankfurt', 'Investment banker. Fast-paced life, but I always make time for yoga.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(77, 'alexander_ivanov', 'aivanov.ru@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alexander Ivanov', '1985-10-26', 'Male', 43, 'St. Petersburg', 'Software architect. Solving complex problems with elegant code.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(78, 'mia_roberts', 'mroberts_88@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mia Roberts', '1988-02-09', 'Female', 5, 'Ottawa', 'Policy analyst. Working to make government more efficient.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(79, 'ethan_martin', 'emartin_photo@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ethan Martin', '1993-07-21', 'Male', 2, 'Portland', 'Landscape photographer. Chasing the perfect light.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(80, 'isabella_silva', 'isilva.br@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Isabella Silva', '1997-12-04', 'Female', 10, 'Salvador', 'Capoeira instructor. Keeping traditions alive through movement.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(81, 'james_wilson', 'jwilson_90@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'James Wilson', '1990-05-17', 'Male', 3, 'Cardiff', 'Rugby coach. Building character through sports.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(82, 'amelia_jones', 'ajones_writes@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Amelia Jones', '1994-09-28', 'Female', 6, 'Hobart', 'Travel blogger. Exploring the hidden corners of the world.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(83, 'lucas_garcia', 'lgarcia.es@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lucas Garcia', '1986-01-12', 'Male', 16, 'Valencia', 'Marine biologist. Studying Mediterranean ecosystems.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(84, 'harper_davis', 'hdavis_87@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Harper Davis', '1987-06-23', 'Female', 2, 'Atlanta', 'Public relations specialist. Managing crises and building brands.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(85, 'mohammed_ali', 'mali.ae@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mohammed Ali', '1991-11-06', 'Male', 35, 'Abu Dhabi', 'Civil engineer. Building the skyline of tomorrow.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(86, 'evelyn_white', 'ewhite_design@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Evelyn White', '1996-04-19', 'Female', 5, 'Halifax', 'Graphic designer. Minimalism and typography are my jams.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(87, 'jackson_taylor', 'jtaylor_95@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jackson Taylor', '1995-08-01', 'Male', 2, 'Denver', 'Snowboard instructor. Living for the winter months.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(88, 'abigail_moore', 'amoore.uk@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Abigail Moore', '1989-02-14', 'Female', 3, 'Belfast', 'Museum curator. Preserving history for future generations.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(89, 'sebastian_weber', 'sweber.de@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sebastian Weber', '1992-07-27', 'Male', 7, 'Cologne', 'Brewmaster. Crafting the perfect pilsner.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(90, 'emily_harris', 'eharris_93@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emily Harris', '1993-12-09', 'Female', 6, 'Darwin', 'Wildlife rescuer. Every animal deserves a second chance.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(91, 'mateo_lopez', 'mlopez.mx@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mateo Lopez', '1988-05-20', 'Male', 14, 'Monterrey', 'Industrial designer. Making functional things beautiful.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(92, 'chloe_clark', 'cclark_photo@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Chloe Clark', '1997-10-03', 'Female', 2, 'Nashville', 'Music photographer. Capturing the energy of live shows.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(93, 'jack_lewis', 'jlewis.uk@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jack Lewis', '1985-03-16', 'Male', 3, 'Newcastle', 'Electrician. Keeping the lights on. Amateur astronomer.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(94, 'madison_walker', 'mwalker_86@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Madison Walker', '1986-08-28', 'Female', 5, 'Winnipeg', 'Meteorologist. Fascinated by extreme weather phenomena.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(95, 'julian_perez', 'jperez.co@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Julian Perez', '1991-01-09', 'Male', 40, 'Bogota', 'Coffee exporter. Connecting local farmers with global markets.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(96, 'avery_hall', 'ahall_tech@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Avery Hall', '1994-06-22', 'Female', 2, 'San Jose', 'UX Researcher. Understanding how humans interact with technology.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(97, 'david_schmidt', 'dschmidt.de@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David Schmidt', '1989-11-04', 'Male', 7, 'Stuttgart', 'Mechanical engineer. Precision and performance.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(98, 'lily_young', 'lyoung_98@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lily Young', '1998-04-17', 'Female', 6, 'Gold Coast', 'Surf instructor. Life is better in a bikini.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(99, 'wyatt_allen', 'wallen_music@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Wyatt Allen', '1995-09-29', 'Male', 2, 'New Orleans', 'Jazz saxophonist. Music is the universal language.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(100, 'zoe_hernandez', 'zhernandez.es@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Zoe Hernandez', '1987-02-11', 'Female', 16, 'Seville', 'Flamenco dancer. Expressing emotion through rhythm.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(101, 'carter_king', 'cking_85@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carter King', '1985-07-24', 'Male', 5, 'Edmonton', 'Geologist. The earth has a fascinating story to tell.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(102, 'penelope_wright', 'pwright_design@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Penelope Wright', '1992-12-06', 'Female', 3, 'Oxford', 'Book designer. Judging books by their covers is literally my job.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(103, 'luke_scott', 'lscott.au@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Luke Scott', '1990-05-19', 'Male', 6, 'Alice Springs', 'Tour guide. Showing people the beauty of the Outback.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(104, 'riley_green', 'rgreen_97@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Riley Green', '1997-10-31', 'Female', 2, 'Austin', 'Vegan chef. Proving that plant-based food can be amazing.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(105, 'gabriel_silva', 'gsilva.br@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Gabriel Silva', '1993-03-14', 'Male', 10, 'Belo Horizonte', 'Software developer. Passionate about open source and community.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(106, 'nora_baker', 'nbaker_edu@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nora Baker', '1988-08-26', 'Female', 5, 'Victoria', 'Special education teacher. Every child learns differently.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(107, 'isaac_adams', 'iadams_91@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Isaac Adams', '1991-01-08', 'Male', 3, 'Nottingham', 'Pharmacist. Health is wealth.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(108, 'hazel_nelson', 'hnelson_art@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hazel Nelson', '1996-06-20', 'Female', 2, 'Santa Fe', 'Potter. Finding peace at the wheel.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(109, 'christian_carter', 'ccarter.za@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Christian Carter', '1989-11-02', 'Male', 13, 'Cape Town', 'Wildlife photographer. Capturing the spirit of Africa.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(110, 'ellie_mitchell', 'emitchell_94@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ellie Mitchell', '1994-04-15', 'Female', 6, 'Canberra', 'Civil servant. Trying to make a positive impact.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(111, 'aaron_perez', 'aperez.mx@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aaron Perez', '1990-09-27', 'Male', 14, 'Cancun', 'Scuba instructor. Life is better underwater.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(112, 'stella_roberts', 'sroberts_tech@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Stella Roberts', '1987-02-09', 'Female', 2, 'San Diego', 'Biotech researcher. Working on the next breakthrough.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(113, 'charles_turner', 'cturner.uk@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charles Turner', '1985-07-22', 'Male', 3, 'Southampton', 'Naval architect. Designing ships and dreaming of the sea.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(114, 'maya_phillips', 'mphillips_92@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Maya Phillips', '1992-12-04', 'Female', 5, 'Quebec City', 'French translator. Language connects us all.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(115, 'cameron_campbell', 'ccampbell.au@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cameron Campbell', '1995-05-17', 'Male', 6, 'Perth', 'Mining engineer. Working in remote locations.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(116, 'lucy_parker', 'lparker_writes@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lucy Parker', '1988-10-29', 'Female', 3, 'Brighton', 'Freelance copywriter. Word nerd and coffee addict.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(117, 'adrian_evans', 'aevans.us@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Adrian Evans', '1991-03-12', 'Male', 2, 'Phoenix', 'Real estate agent. Helping people find their dream homes.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(118, 'anna_edwards', 'aedwards_96@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Anna Edwards', '1996-08-24', 'Female', 5, 'Halifax', 'Marine biologist. Studying whale migration patterns.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(119, 'thomas_collins', 'tcollins.uk@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Thomas Collins', '1989-01-06', 'Male', 3, 'Bristol', 'Aerospace engineer. Reach for the stars.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(120, 'samantha_stewart', 'sstewart_design@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Samantha Stewart', '1994-06-19', 'Female', 2, 'Minneapolis', 'Interior decorator. Creating spaces that inspire.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(121, 'ian_sanchez', 'isanchez.mx@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ian Sanchez', '1986-11-01', 'Male', 14, 'Tijuana', 'Logistics manager. Keeping the supply chain moving.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(122, 'ruby_morris', 'rmorris_90@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ruby Morris', '1990-04-14', 'Female', 6, 'Adelaide', 'Registered nurse. Caring for others is my calling.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(123, 'dominic_rogers', 'drogers.au@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Dominic Rogers', '1993-09-26', 'Male', 6, 'Hobart', 'Chef. Passionate about local, seasonal ingredients.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(124, 'claire_reed', 'creed_photo@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Claire Reed', '1987-02-08', 'Female', 3, 'York', 'Portrait photographer. Capturing real emotion.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(125, 'jeremiah_cook', 'jcook.us@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jeremiah Cook', '1995-07-22', 'Male', 2, 'Detroit', 'Automotive designer. Dreaming up the cars of the future.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(126, 'audrey_morgan', 'amorgan_92@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Audrey Morgan', '1992-12-04', 'Female', 5, 'Victoria', 'Historian. The past has so much to teach us.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(127, 'evan_bell', 'ebell.uk@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Evan Bell', '1989-05-17', 'Male', 3, 'Leicester', 'Sound technician. Making sure the band sounds great.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(128, 'skylar_murphy', 'smurphy_edu@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Skylar Murphy', '1996-10-29', 'Female', 2, 'Charlotte', 'Kindergarten teacher. Shaping the minds of tomorrow.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(129, 'jason_bailey', 'jbailey.ca@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jason Bailey', '1985-03-12', 'Male', 5, 'Regina', 'Agricultural scientist. Working to improve crop yields.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(130, 'bella_rivera', 'brivera_88@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bella Rivera', '1988-08-24', 'Female', 14, 'Puebla', 'Art therapist. Healing through creativity.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(131, 'gavin_cooper', 'gcooper.au@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Gavin Cooper', '1991-01-06', 'Male', 6, 'Darwin', 'Helicopter pilot. Seeing the world from above.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(132, 'naomi_richardson', 'nrichardson_tech@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Naomi Richardson', '1994-06-19', 'Female', 2, 'Atlanta', 'Network engineer. Keeping everyone connected.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(133, 'nicholas_cox', 'ncox.uk@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nicholas Cox', '1986-11-01', 'Male', 3, 'Nottingham', 'Brewery owner. Craft beer is my life.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(134, 'eliana_howard', 'ehoward_97@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Eliana Howard', '1997-04-14', 'Female', 5, 'Toronto', 'Fashion designer. Sustainable and ethical fashion advocate.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(135, 'brayden_ward', 'bward.us@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Brayden Ward', '1990-09-26', 'Male', 2, 'Dallas', 'Financial analyst. Making sense of the markets.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(136, 'aria_torres', 'atorres_writes@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aria Torres', '1993-02-08', 'Female', 14, 'Merida', 'Travel writer. Exploring ancient ruins.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(137, 'christian_peterson', 'cpeterson.ca@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Christian Peterson', '1989-07-22', 'Male', 5, 'London', 'Paramedic. Fast-paced and rewarding work.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(138, 'layla_gray', 'lgray_85@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Layla Gray', '1985-12-04', 'Female', 3, 'Aberdeen', 'Geophysicist. Studying the earth from the inside out.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(139, 'hunter_ramirez', 'hramirez.us@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hunter Ramirez', '1992-05-17', 'Male', 2, 'Las Vegas', 'Event manager. Creating unforgettable experiences.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(140, 'aubrey_james', 'ajames_design@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aubrey James', '1995-10-29', 'Female', 6, 'Brisbane', 'Landscape architect. Designing beautiful outdoor spaces.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(141, 'julian_watson', 'jwatson.uk@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Julian Watson', '1987-03-12', 'Male', 3, 'Swansea', 'Marine engineer. Keeping ships running smoothly.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(142, 'zoey_brooks', 'zbrooks_91@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Zoey Brooks', '1991-08-24', 'Female', 2, 'Orlando', 'Theme park designer. Making magic happen.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(143, 'aaron_kelly', 'akelly.au@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Aaron Kelly', '1996-01-06', 'Male', 6, 'Newcastle', 'Surfboard shaper. Crafting the perfect ride.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(144, 'lillian_sanders', 'lsanders_edu@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lillian Sanders', '1988-06-19', 'Female', 5, 'Kingston', 'University professor. Inspiring the next generation.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(145, 'charles_price', 'cprice.uk@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charles Price', '1993-11-01', 'Male', 3, 'Plymouth', 'Oceanographer. The sea is my laboratory.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(146, 'hannah_bennett', 'hbennett_94@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hannah Bennett', '1994-04-14', 'Female', 2, 'Indianapolis', 'Marketing director. Building brands that matter.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(147, 'thomas_wood', 'twood.ca@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Thomas Wood', '1989-09-26', 'Male', 5, 'Sudbury', 'Mining geologist. Finding the resources we need.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(148, 'addison_barnes', 'abarnes_photo@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Addison Barnes', '1992-02-08', 'Female', 6, 'Geelong', 'Sports photographer. Capturing the action.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(149, 'caleb_ross', 'cross.us@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Caleb Ross', '1986-07-22', 'Male', 2, 'Columbus', 'Software engineer. Coding is my craft.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(150, 'mia_henderson', 'mhenderson_85@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mia Henderson', '1985-12-04', 'Female', 3, 'Dundee', 'Biomedical scientist. Working towards a healthier future.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(151, 'nathan_coleman', 'ncoleman.uk@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nathan Coleman', '1991-05-17', 'Male', 3, 'Preston', 'Civil engineer. Designing safe and efficient infrastructure.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(152, 'audrey_jenkins', 'ajenkins_writes@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Audrey Jenkins', '1996-10-29', 'Female', 5, 'Windsor', 'Technical writer. Making complex things easy to understand.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(153, 'isaiah_perry', 'iperry.au@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Isaiah Perry', '1988-03-12', 'Male', 6, 'Townsville', 'Park ranger. Protecting our natural spaces.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(154, 'evelyn_powell', 'epowell_92@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Evelyn Powell', '1992-08-24', 'Female', 2, 'Milwaukee', 'Data analyst. Finding the story in the numbers.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(155, 'ryan_long', 'rlong.us@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ryan Long', '1987-01-06', 'Male', 2, 'Salt Lake City', 'Ski instructor. Life is better on the slopes.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(156, 'lily_patterson', 'lpatterson_edu@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lily Patterson', '1994-06-19', 'Female', 3, 'Lancaster', 'High school math teacher. Making algebra accessible.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(157, 'andrew_hughes', 'ahughes.ca@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Andrew Hughes', '1989-11-01', 'Male', 5, 'Oshawa', 'Manufacturing engineer. Optimizing production processes.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(158, 'charlotte_flores', 'cflores_95@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charlotte Flores', '1995-04-14', 'Female', 14, 'Tijuana', 'Bilingual speech therapist. Helping people communicate.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(159, 'joshua_washington', 'jwashington.us@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Joshua Washington', '1990-09-26', 'Male', 2, 'Richmond', 'City planner. Shaping the future of our urban spaces.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(160, 'amelia_butler', 'abutler_design@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Amelia Butler', '1986-02-08', 'Female', 6, 'Cairns', 'Graphic designer. Bringing brands to life visually.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(161, 'luke_simmons', 'lsimmons.uk@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Luke Simmons', '1993-07-22', 'Male', 3, 'Sunderland', 'Web developer. Building the digital world.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(162, 'harper_foster', 'hfoster_89@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Harper Foster', '1989-12-04', 'Female', 5, 'St. Johns', 'Marine biologist. Studying the cold water ecosystems.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(163, 'jack_gonzales', 'jgonzales.mx@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jack Gonzales', '1991-05-17', 'Male', 14, 'Leon', 'Shoe designer. Blending traditional craftsmanship with modern style.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(164, 'evelyn_bryant', 'ebryant_92@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Evelyn Bryant', '1992-10-29', 'Female', 2, 'Omaha', 'Actuary. Managing risk and predicting the future.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10');
INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `full_name`, `date_of_birth`, `gender`, `country_id`, `city`, `bio`, `profile_picture`, `cover_photo`, `education`, `profession`, `email_verified`, `account_status`, `is_online`, `last_seen`, `failed_attempts`, `locked_until`, `created_at`) VALUES
(165, 'connor_alexander', 'calexander.au@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Connor Alexander', '1987-03-12', 'Male', 6, 'Ballarat', 'Brewery manager. Crafting the perfect pint.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(166, 'mia_russell', 'mrussell_writes@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mia Russell', '1996-08-24', 'Female', 3, 'Oxford', 'PhD student in literature. Lost in old books.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(167, 'nathan_griffin', 'ngriffin.ca@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nathan Griffin', '1988-01-06', 'Male', 5, 'Kitchener', 'Hardware engineer. Making things that compute.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(168, 'audrey_hayes', 'ahayes_85@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Audrey Hayes', '1985-06-19', 'Female', 2, 'Raleigh', 'Clinical researcher. Finding new treatments for old diseases.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(169, 'isaiah_myers', 'imyers.us@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Isaiah Myers', '1994-11-01', 'Male', 2, 'Tulsa', 'Petroleum engineer. Working in the energy sector.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(170, 'ella_ford', 'eford_edu@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ella Ford', '1990-04-14', 'Female', 3, 'Cambridge', 'History professor. Teaching the lessons of the past.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(171, 'caleb_hamilton', 'chamilton.uk@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Caleb Hamilton', '1989-09-26', 'Male', 3, 'Edinburgh', 'Financial analyst. Managing investments and portfolios.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(172, 'lily_graham', 'lgraham_95@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lily Graham', '1995-02-08', 'Female', 6, 'Hobart', 'Marine biologist. Studying the Great Barrier Reef.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(173, 'andrew_sullivan', 'asullivan.au@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Andrew Sullivan', '1986-07-22', 'Male', 6, 'Geelong', 'Architect. Designing sustainable and beautiful homes.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(174, 'charlotte_wallace', 'cwallace_design@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charlotte Wallace', '1991-12-04', 'Female', 5, 'Vancouver', 'Interior designer. Making spaces feel like home.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(175, 'joshua_woods', 'jwoods.ca@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Joshua Woods', '1997-05-17', 'Male', 5, 'Calgary', 'Software developer. Coding the future.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(176, 'amelia_cole', 'acole_88@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Amelia Cole', '1988-10-29', 'Female', 2, 'Austin', 'Marketing manager. Creative thinker and problem solver.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(177, 'luke_west', 'lwest.us@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Luke West', '1992-03-12', 'Male', 2, 'Denver', 'Outdoor enthusiast. Hiking, climbing, and exploring.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(178, 'harper_jordan', 'hjordan_writes@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Harper Jordan', '1996-08-24', 'Female', 3, 'Manchester', 'Journalist. Telling the stories that matter.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(179, 'jack_owens', 'jowens.uk@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jack Owens', '1987-01-06', 'Male', 3, 'Liverpool', 'Teacher. Helping students reach their full potential.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(180, 'evelyn_reynolds', 'ereynolds_94@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Evelyn Reynolds', '1994-06-19', 'Female', 6, 'Brisbane', 'Graphic designer. Passionate about typography and layout.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(181, 'connor_fisher', 'cfisher.au@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Connor Fisher', '1989-11-01', 'Male', 6, 'Perth', 'Engineer. Solving problems with elegant solutions.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(182, 'mia_ellis', 'mellis_edu@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mia Ellis', '1995-04-14', 'Female', 5, 'Montreal', 'Researcher. Uncovering new knowledge.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(183, 'nathan_harrison', 'nharrison.ca@outlook.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Nathan Harrison', '1990-09-26', 'Male', 5, 'Toronto', 'Data scientist. Finding patterns in complex data.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(184, 'audrey_gibson', 'agibson_photo@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Audrey Gibson', '1986-02-08', 'Female', 2, 'Seattle', 'Photographer. Capturing moments in time.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(185, 'isaiah_mcdonald', 'imcdonald.us@icloud.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Isaiah McDonald', '1993-07-22', 'Male', 2, 'Chicago', 'Financial advisor. Helping people plan for the future.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(186, 'ella_cruz', 'ecruz_91@yahoo.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ella Cruz', '1991-12-04', 'Female', 14, 'Mexico City', 'Architect. Designing sustainable and beautiful spaces.', NULL, NULL, NULL, NULL, 1, 'verified', 1, NULL, 0, NULL, '2026-03-25 02:21:10'),
(187, 'caleb_marshall', 'cmarshall.uk@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Caleb Marshall', '1988-05-17', 'Male', 3, 'London', 'Software developer. Building the tools we use every day.', NULL, NULL, NULL, NULL, 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:21:10'),
(188, 'Bye', 'gi@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Hi', '2027-04-22', 'Prefer not to say', 1, '', '', NULL, NULL, '', '', 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:23:40'),
(189, 'Raisul', 'mdraisulislam2040@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Md. Raisul Islam', '2002-02-08', 'Male', 1, 'Chittagong', '', NULL, NULL, 'Bsc. CSE', 'Lecturer', 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:24:13'),
(190, 'Bishal999r', 'bishal999r@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bishal Dev Nath', '2004-01-01', 'Male', 1, 'Chattogram', '', NULL, NULL, 'B.Sc. in CSE', 'Student', 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:24:53'),
(191, 'gazi_shahid', 'shahidshahidur30@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Md Shahidur Rahaman', '2005-01-03', 'Prefer not to say', 1, 'Chittagong', '', NULL, NULL, 'B.Sc. in CSE', 'Student', 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:25:22'),
(192, 'shubaha_tanaz', 'shubahatanaz@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Shubaha Tanaz', '2004-02-12', 'Female', 1, 'Chittagong', 'Meh', NULL, NULL, 'BSc Computer Science', 'Student', 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:26:10'),
(193, 'Juli', 'julijobaidakhanam@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jobaida khanam juli', '2003-08-14', 'Female', 1, 'Chottogram', '', NULL, NULL, '', '', 1, 'verified', 0, NULL, 0, NULL, '2026-03-25 02:27:05'),
(194, 'Ahad', 'ahadmalikking2022@gmail.com', '$2y$10$l0c7ZK.43kOuqg066tDqaOF/sQnQ3IOc2nbGUdxYA.lGAw2YWswVS', 'Ahad malik', '2000-03-25', 'Male', 1, 'Dhaka', 'Student', 'avatar_194_1774804099.jpg', NULL, 'BSc in CSE', 'Student', 1, 'verified', 1, '2026-04-11 23:40:20', 0, NULL, '2026-03-25 02:27:34'),
(195, 'ameer', 'worldisbeautiful2000@gmail.com', '$2y$10$KZSNGa1745KNDl9UJ1Wmy.v0FnytH1HBjhQ0.pbd1Jw27vB9ijiz2', 'Ameer khan', '2000-06-14', 'Male', 1, 'dhaka', 'student', 'avatar_195_1775126585.jpg', NULL, 'Bsc in cse', 'student', 1, 'pending', 0, '2026-04-02 16:43:43', 0, NULL, '2026-04-02 16:31:27'),
(196, 'shakehua', 'shakehua@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Anastasiia', '2005-03-15', 'Female', 44, 'Kyiv', '', NULL, NULL, 'bachelor Philology', 'Translator', 1, 'verified', 0, NULL, 0, NULL, '2026-04-02 16:37:45'),
(198, 'Literary', 'hesap181814@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sıla Satiroglu', '2003-02-28', 'Female', 20, 'Ankara', 'I like reading, some old movies,some rpg games and music', NULL, NULL, 'Bsc in law', 'Student', 1, 'verified', 0, NULL, 0, NULL, '2026-04-02 16:39:00'),
(199, 'karan', 'kakokar310@parsitv.com', '$2y$10$SUFRvQgbOOhSUrXymt5mS.GhlQyMB/nWBUFaCPsvNB3qDzmXgfJHO', 'karan kapoor', '0000-00-00', 'Male', 5, 'Vancouver', NULL, NULL, NULL, NULL, NULL, 1, '', 0, NULL, 0, NULL, '2026-04-11 01:36:04'),
(200, 'karann', '7te7mfxupe@ruutukf.com', '$2y$10$zCGMRvZompTgkWTHWvESUO2oVuK.H7pzpUAcYRfIbAIcjzm/nT.Q.', 'karan kapoor', '2000-05-20', 'Male', 5, 'usa', 'doctor', NULL, NULL, 'mbbs', 'doctor', 1, 'verified', 0, NULL, 0, NULL, '2026-04-11 01:59:32'),
(201, 'karant', 'az2uyetr@contaco.org', '$2y$10$bPZAle4uyBFobqcxtz8IOuP7iW6Yw9fDLINRMsJGGQf4uogDEpsm.', 'karan karn', '2000-12-20', 'Male', 4, 'USA', 'DOCTOR', NULL, NULL, 'MBBS', 'DOCTOR', 1, '', 0, NULL, 0, NULL, '2026-04-11 02:09:01'),
(202, 'johan', 'ngaz0jtug@pippoc.com', '$2y$10$F5o98ovbKPja4WwbqRBYROuTiYK5m9gnSyinJHyVWyfBSHj7yKwri', 'john cena', '2000-12-05', 'Male', 5, 'Canada', 'doctor', NULL, NULL, 'mbbs', 'doctor', 1, '', 0, NULL, 0, NULL, '2026-04-11 02:18:58'),
(203, 'abull', 'milzqsl@emailgen.uk', '$2y$10$6oHWFo.H7/t/JXIKeaOB9u21XzVArp.T/agZBHzXdXgPk7c4neaHu', 'abul', '2003-05-08', 'Male', NULL, 'usa', NULL, NULL, NULL, NULL, NULL, 1, '', 0, NULL, 0, NULL, '2026-04-11 19:16:20'),
(204, 'zarif', 'minalhawp@aliban.org', '$2y$10$vkDfOfh7VRzCzxTZrXujo.Ar/gQ7H9x.SAITKurw0lE.YamG68XZq', 'zarif hoque', '0000-00-00', 'Male', 27, 'denmark', 'student', 'selfies/204_selfie_1775916018.jpg', NULL, 'bsc in math', 'teacher', 1, '', 1, '2026-04-11 20:03:50', 0, NULL, '2026-04-11 19:58:51'),
(205, 'shows', 'mil4occ@freeimghost.org', '$2y$10$SaiDL3Oy6uP0xOkjZwDjSuuprbx2XAf/f16HcMDEOM3HyJd/PIJ02', 'Robert shows', '2000-10-10', 'Male', 27, 'denmark', 'Manus', 'avatar_205_1776424901.jpg', NULL, 'Bsc in EEE', 'engineer', 1, '', 1, '2026-04-17 17:20:43', 0, NULL, '2026-04-17 17:10:58');

-- --------------------------------------------------------

--
-- Table structure for table `user_activity`
--

CREATE TABLE `user_activity` (
  `activity_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_activity`
--

INSERT INTO `user_activity` (`activity_id`, `user_id`, `action`, `details`, `ip_address`, `created_at`) VALUES
(1, 194, 'login', 'Login from IP: ::1', '::1', '2026-03-25 02:33:03'),
(2, 194, 'profile_update', '', '::1', '2026-03-25 02:34:18'),
(3, 194, 'logout', '', '::1', '2026-03-25 02:34:38'),
(4, 194, 'login', 'Login from IP: ::1', '::1', '2026-03-27 21:50:38'),
(5, 194, 'profile_update', '', '::1', '2026-03-27 21:51:01'),
(6, 194, 'logout', '', '::1', '2026-03-27 21:51:44'),
(7, 194, 'login', 'Login from IP: ::1', '::1', '2026-03-29 22:54:17'),
(8, 194, 'friend_request_sent', 'To user 192', '::1', '2026-03-29 22:54:57'),
(9, 194, 'friend_request_sent', 'To user 193', '::1', '2026-03-29 22:55:00'),
(10, 194, 'profile_update', '', '::1', '2026-03-29 22:57:46'),
(11, 194, 'profile_update', '', '::1', '2026-03-29 23:08:19'),
(12, 194, 'logout', '', '::1', '2026-03-29 23:59:59'),
(13, 194, 'login', 'Login from IP: ::1', '::1', '2026-03-30 00:17:25'),
(14, 194, 'login', 'Login from IP: ::1', '::1', '2026-03-30 00:31:42'),
(15, 194, 'login', 'Login from IP: ::1', '::1', '2026-03-30 00:43:43'),
(16, 194, 'logout', '', '::1', '2026-03-30 01:37:27'),
(17, 194, 'login', 'Login from IP: ::1', '::1', '2026-03-30 01:45:37'),
(18, 194, 'logout', '', '::1', '2026-03-30 02:02:47'),
(19, 194, 'login', 'Login from IP: ::1', '::1', '2026-03-30 02:53:43'),
(20, 194, 'logout', '', '::1', '2026-03-30 09:13:57'),
(21, 194, 'login', 'Login from IP: ::1', '::1', '2026-03-30 18:53:33'),
(22, 194, 'logout', '', '::1', '2026-03-30 18:54:49'),
(23, 195, 'register', 'New user registered: ameer', '::1', '2026-04-02 16:31:27'),
(24, 195, 'login', 'Login from IP: ::1', '::1', '2026-04-02 16:34:22'),
(25, 195, 'friend_request_sent', 'To user 9', '::1', '2026-04-02 16:34:34'),
(26, 195, 'friend_request_sent', 'To user 188', '::1', '2026-04-02 16:34:40'),
(27, 195, 'friend_request_sent', 'To user 194', '::1', '2026-04-02 16:34:42'),
(28, 195, 'profile_update', '', '::1', '2026-04-02 16:43:05'),
(29, 195, 'profile_update', '', '::1', '2026-04-02 16:43:07'),
(30, 195, 'logout', '', '::1', '2026-04-02 16:43:43'),
(31, 194, 'login', 'Login from IP: ::1', '::1', '2026-04-03 16:04:57'),
(32, 194, 'friend_request_accepted', 'Request 5', '::1', '2026-04-03 16:14:22'),
(33, 194, 'login', 'Login from IP: ::1', '::1', '2026-04-07 01:07:11'),
(34, 194, 'friend_request_sent', 'To user 9', '::1', '2026-04-07 01:12:17'),
(35, 194, 'friend_request_sent', 'To user 197', '::1', '2026-04-07 01:12:21'),
(36, 194, 'friend_request_sent', 'To user 34', '::1', '2026-04-07 01:12:22'),
(37, 194, 'logout', '', '::1', '2026-04-07 01:12:58'),
(38, 194, 'password_reset_requested', 'Reset OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-07 01:14:29'),
(39, 194, 'password_reset_requested', 'Reset OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-07 01:15:59'),
(40, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-08 00:05:18'),
(41, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-08 00:07:13'),
(42, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-08 00:43:15'),
(43, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-08 01:07:33'),
(44, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-08 01:28:38'),
(45, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-08 02:19:16'),
(46, 194, 'login_success', 'Login OTP verified successfully', '::1', '2026-04-08 02:19:42'),
(47, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-08 02:22:44'),
(48, 194, 'login_success', 'Login OTP verified successfully', '::1', '2026-04-08 02:23:05'),
(49, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-08 02:25:31'),
(50, 194, 'login_success', 'Login OTP verified successfully', '::1', '2026-04-08 02:25:48'),
(51, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-08 20:24:45'),
(52, 194, 'login_success', 'Login OTP verified from ::1', '::1', '2026-04-08 20:25:17'),
(53, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-08 20:25:57'),
(54, 194, 'login_success', 'Login OTP verified from ::1', '::1', '2026-04-08 20:26:27'),
(55, 194, 'reset_password', 'Password reset successful', '::1', '2026-04-09 01:38:33'),
(56, 194, 'login_failed', 'Wrong password (attempt 1)', '::1', '2026-04-09 01:40:51'),
(57, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-09 01:41:10'),
(58, 194, 'login_success', 'Login OTP verified from ::1', '::1', '2026-04-09 01:41:26'),
(59, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-09 02:12:42'),
(60, 194, 'login_success', 'Login OTP verified from ::1', '::1', '2026-04-09 02:13:11'),
(61, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-09 02:29:39'),
(62, 194, 'login_success', 'Login OTP verified from ::1', '::1', '2026-04-09 02:29:54'),
(63, 194, 'logout', 'User logged out successfully', '::1', '2026-04-09 03:09:40'),
(64, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 18:55:39'),
(65, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 18:56:54'),
(66, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 19:01:37'),
(67, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 19:25:57'),
(68, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 19:27:16'),
(69, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 19:36:36'),
(70, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 19:42:04'),
(71, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 19:51:48'),
(72, 194, 'otp_fail', 'Wrong login OTP', '::1', '2026-04-10 19:52:16'),
(73, 194, 'login_success', 'Logged in from ::1', '::1', '2026-04-10 19:52:40'),
(74, 194, 'friend_request_sent', 'To user 189', '::1', '2026-04-10 20:02:13'),
(75, 194, 'logout', 'User logged out successfully', '::1', '2026-04-10 20:03:31'),
(76, 194, 'password_reset_requested', 'Reset OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 20:12:17'),
(77, 194, 'reset_otp_verified', 'Password reset OTP verified', '::1', '2026-04-10 20:12:43'),
(78, 194, 'password_reset_requested', 'Reset OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 20:13:49'),
(79, 194, 'reset_otp_verified', 'Password reset OTP verified', '::1', '2026-04-10 20:14:03'),
(80, 194, 'password_reset_requested', 'Reset OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 20:21:14'),
(81, 194, 'reset_otp_verified', 'Password reset OTP verified', '::1', '2026-04-10 20:21:27'),
(82, 194, 'password_reset_requested', 'Reset OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 21:40:31'),
(83, 194, 'reset_otp_verified', 'Password reset OTP verified', '::1', '2026-04-10 21:40:54'),
(84, 194, 'password_reset_requested', 'Reset OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 22:06:35'),
(85, 194, 'reset_otp_verified', 'Password reset OTP verified', '::1', '2026-04-10 22:07:07'),
(86, 194, 'password_reset_requested', 'Reset OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-10 22:19:10'),
(87, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-11 00:47:31'),
(88, 194, 'login_success', 'Logged in from ::1', '::1', '2026-04-11 00:48:05'),
(89, 194, 'friend_request_sent', 'To user 188', '::1', '2026-04-11 00:48:44'),
(90, 194, 'password_reset_requested', 'Reset OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-11 00:50:22'),
(91, 194, 'otp_fail', 'Wrong reset OTP', '::1', '2026-04-11 00:50:37'),
(92, 194, 'reset_otp_verified', 'Password reset OTP verified', '::1', '2026-04-11 00:50:57'),
(93, 194, 'password_reset_completed', 'Password reset successfully', '::1', '2026-04-11 00:51:39'),
(94, 194, 'login_failed', 'Wrong password (attempt 1)', '::1', '2026-04-11 00:52:16'),
(95, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-11 00:52:32'),
(96, 194, 'login_success', 'Logged in from ::1', '::1', '2026-04-11 00:52:50'),
(97, 199, 'register', 'New user registered: karan', '::1', '2026-04-11 01:36:04'),
(98, 199, 'register_otp_sent', 'OTP sent for register to kakokar310@parsitv.com', '::1', '2026-04-11 01:36:10'),
(99, 199, 'email_verified', 'Registration OTP verified successfully', '::1', '2026-04-11 01:36:38'),
(100, 200, 'register', 'New user registered: karann', '::1', '2026-04-11 01:59:32'),
(101, 200, 'register_otp_sent', 'OTP sent for register to 7te7mfxupe@ruutukf.com', '::1', '2026-04-11 01:59:37'),
(102, 200, 'email_verified', 'Registration OTP verified successfully', '::1', '2026-04-11 01:59:54'),
(103, 201, 'register', 'New user registered: karant', '::1', '2026-04-11 02:09:01'),
(104, 201, 'register_otp_sent', 'OTP sent for register to az2uyetr@contaco.org', '::1', '2026-04-11 02:09:06'),
(105, 201, 'email_verified', 'Registration OTP verified successfully', '::1', '2026-04-11 02:09:30'),
(106, 202, 'register', 'New user registered: johan', '::1', '2026-04-11 02:18:58'),
(107, 202, 'register_otp_sent', 'OTP sent for register to ngaz0jtug@pippoc.com', '::1', '2026-04-11 02:19:03'),
(108, 202, 'email_verified', 'Registration OTP verified successfully', '::1', '2026-04-11 02:19:42'),
(109, 203, 'register', 'New user registered: abull', '::1', '2026-04-11 19:16:20'),
(110, 203, 'register_otp_sent', 'OTP sent for register to milzqsl@emailgen.uk', '::1', '2026-04-11 19:16:27'),
(111, 203, 'otp_fail', 'Wrong register OTP', '::1', '2026-04-11 19:18:33'),
(112, 203, 'email_verified', 'Registration OTP verified successfully', '::1', '2026-04-11 19:18:45'),
(113, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-11 19:26:30'),
(114, 194, 'login_success', 'Logged in from ::1', '::1', '2026-04-11 19:27:11'),
(115, 204, 'register', 'New user registered: zarif', '::1', '2026-04-11 19:58:51'),
(116, 204, 'register_otp_sent', 'OTP sent for register to minalhawp@aliban.org', '::1', '2026-04-11 19:58:56'),
(117, 204, 'email_verified', 'Registration OTP verified successfully', '::1', '2026-04-11 19:59:42'),
(118, 204, 'login_otp_sent', 'OTP sent to minalhawp@aliban.org', '::1', '2026-04-11 20:00:41'),
(119, 204, 'login_success', 'Logged in from ::1', '::1', '2026-04-11 20:01:05'),
(120, 204, 'friend_request_sent', 'To user 194', '::1', '2026-04-11 20:01:39'),
(121, 204, 'friend_request_sent', 'To user 9', '::1', '2026-04-11 20:01:48'),
(122, 204, 'password_reset_requested', 'Reset OTP sent to minalhawp@aliban.org', '::1', '2026-04-11 20:02:04'),
(123, 204, 'reset_otp_verified', 'Password reset OTP verified', '::1', '2026-04-11 20:02:32'),
(124, 204, 'password_reset_completed', 'Password reset successfully', '::1', '2026-04-11 20:03:00'),
(125, 204, 'login_otp_sent', 'OTP sent to minalhawp@aliban.org', '::1', '2026-04-11 20:03:21'),
(126, 204, 'login_success', 'Logged in from ::1', '::1', '2026-04-11 20:03:50'),
(127, 194, 'login_otp_sent', 'OTP sent to ahadmalikking2022@gmail.com', '::1', '2026-04-11 23:39:41'),
(128, 194, 'login_success', 'Logged in from ::1', '::1', '2026-04-11 23:40:20'),
(129, 194, 'friend_request_accepted', 'Request 11', '::1', '2026-04-11 23:40:31'),
(130, 194, 'report', 'Reported user 7 for harassment', '::1', '2026-04-11 23:41:46'),
(131, 205, 'register', 'New user registered: shows', '::1', '2026-04-17 17:10:58'),
(132, 205, 'register_otp_sent', 'OTP sent for register to mil4occ@freeimghost.org', '::1', '2026-04-17 17:11:04'),
(133, 205, 'email_verified', 'Registration OTP verified successfully', '::1', '2026-04-17 17:11:30'),
(134, 205, 'login_otp_sent', 'OTP sent to mil4occ@freeimghost.org', '::1', '2026-04-17 17:12:59'),
(135, 205, 'login_success', 'Logged in from ::1', '::1', '2026-04-17 17:13:25'),
(136, 205, 'friend_request_sent', 'To user 188', '::1', '2026-04-17 17:14:04'),
(137, 205, 'friend_request_sent', 'To user 9', '::1', '2026-04-17 17:16:06'),
(138, 205, 'password_reset_requested', 'Reset OTP sent to mil4occ@freeimghost.org', '::1', '2026-04-17 17:19:15'),
(139, 205, 'reset_otp_verified', 'Password reset OTP verified', '::1', '2026-04-17 17:19:36'),
(140, 205, 'password_reset_completed', 'Password reset successfully', '::1', '2026-04-17 17:19:53'),
(141, 205, 'login_otp_sent', 'OTP sent to mil4occ@freeimghost.org', '::1', '2026-04-17 17:20:15'),
(142, 205, 'login_success', 'Logged in from ::1', '::1', '2026-04-17 17:20:43'),
(143, 205, 'profile_update', '', '::1', '2026-04-17 17:21:41');

-- --------------------------------------------------------

--
-- Table structure for table `user_badges`
--

CREATE TABLE `user_badges` (
  `badge_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `badge_type` varchar(50) NOT NULL,
  `badge_label` varchar(100) DEFAULT NULL,
  `earned_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_badges`
--

INSERT INTO `user_badges` (`badge_id`, `user_id`, `badge_type`, `badge_label`, `earned_at`) VALUES
(1, 1, 'first_friend', 'First Friend!', '2026-03-25 01:30:33'),
(2, 1, '10_friends', 'Social Butterfly', '2026-03-25 01:30:33'),
(3, 3, '5_countries', 'World Explorer', '2026-03-25 01:30:33'),
(4, 7, 'first_friend', 'First Friend!', '2026-03-25 01:30:33'),
(5, 7, 'post_star', 'Post Star', '2026-03-25 01:30:33'),
(6, 194, 'first_friend', 'First Friend!', '2026-04-03 16:14:22'),
(7, 194, 'first_post', 'First Post!', '2026-04-09 02:45:45');

-- --------------------------------------------------------

--
-- Table structure for table `user_interests`
--

CREATE TABLE `user_interests` (
  `ui_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `interest_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_interests`
--

INSERT INTO `user_interests` (`ui_id`, `user_id`, `interest_id`) VALUES
(1, 1, 1),
(4, 1, 9),
(2, 1, 10),
(5, 1, 12),
(3, 1, 16),
(6, 2, 3),
(7, 2, 4),
(9, 2, 9),
(10, 2, 17),
(8, 2, 22),
(13, 3, 1),
(11, 3, 2),
(15, 3, 8),
(12, 3, 12),
(14, 3, 24),
(16, 4, 6),
(20, 4, 19),
(18, 4, 20),
(19, 4, 23),
(17, 4, 26),
(23, 5, 1),
(21, 5, 10),
(24, 5, 11),
(25, 5, 18),
(22, 5, 25),
(28, 6, 13),
(30, 6, 14),
(27, 6, 16),
(26, 6, 17),
(29, 6, 23),
(34, 7, 1),
(31, 7, 10),
(35, 7, 11),
(33, 7, 12),
(32, 7, 18),
(37, 8, 6),
(36, 8, 8),
(39, 8, 15),
(40, 8, 20),
(38, 8, 24),
(41, 9, 1),
(42, 9, 2),
(43, 9, 3),
(44, 9, 4),
(45, 9, 9),
(47, 9, 10),
(46, 9, 11),
(51, 9, 18),
(50, 9, 20),
(48, 9, 22),
(49, 9, 24),
(79, 188, 1),
(81, 188, 2),
(78, 188, 3),
(80, 188, 4),
(77, 188, 5),
(76, 188, 6),
(75, 188, 7),
(74, 188, 8),
(73, 188, 9),
(72, 188, 10),
(71, 188, 11),
(70, 188, 12),
(69, 188, 13),
(68, 188, 14),
(67, 188, 15),
(66, 188, 16),
(65, 188, 17),
(64, 188, 18),
(63, 188, 19),
(62, 188, 20),
(61, 188, 21),
(60, 188, 22),
(59, 188, 23),
(57, 188, 24),
(58, 188, 25),
(56, 188, 26),
(55, 188, 27),
(54, 188, 28),
(53, 188, 29),
(52, 188, 30),
(82, 189, 1),
(87, 189, 5),
(88, 189, 7),
(83, 189, 9),
(84, 189, 10),
(85, 189, 12),
(86, 189, 16),
(89, 190, 1),
(91, 190, 2),
(90, 190, 3),
(92, 190, 4),
(93, 190, 5),
(94, 190, 9),
(95, 190, 11),
(97, 190, 20),
(96, 190, 22),
(98, 191, 1),
(99, 191, 12),
(100, 191, 24),
(102, 192, 2),
(101, 192, 3),
(103, 192, 4),
(104, 192, 6),
(105, 192, 8),
(106, 192, 9),
(107, 192, 11),
(108, 192, 12),
(110, 192, 13),
(109, 192, 15),
(111, 192, 17),
(112, 192, 19),
(113, 192, 20),
(114, 192, 21),
(117, 192, 22),
(115, 192, 23),
(116, 192, 24),
(118, 192, 25),
(119, 192, 28),
(120, 192, 29),
(122, 193, 2),
(121, 193, 3),
(123, 193, 9),
(124, 193, 22),
(125, 193, 30),
(126, 194, 1),
(127, 194, 2),
(128, 194, 3),
(129, 194, 8),
(130, 194, 9),
(131, 194, 11),
(132, 194, 19),
(153, 195, 1),
(154, 195, 4),
(155, 195, 9),
(156, 195, 10),
(157, 195, 15),
(158, 195, 18),
(159, 195, 21),
(160, 195, 24),
(161, 195, 25),
(142, 196, 1),
(144, 196, 23),
(143, 196, 25),
(147, 197, 7),
(146, 197, 8),
(148, 197, 14),
(145, 197, 20),
(149, 198, 1),
(150, 198, 6),
(151, 198, 9),
(152, 198, 28),
(163, 200, 4),
(162, 200, 8),
(166, 200, 9),
(165, 200, 16),
(164, 200, 23),
(167, 201, 2),
(171, 201, 3),
(169, 201, 4),
(168, 201, 8),
(170, 201, 23),
(172, 201, 29),
(174, 202, 4),
(173, 202, 8),
(178, 202, 12),
(177, 202, 19),
(176, 202, 23),
(175, 202, 24),
(179, 204, 8),
(184, 204, 9),
(183, 204, 11),
(180, 204, 15),
(182, 204, 23),
(181, 204, 28),
(192, 205, 1),
(186, 205, 2),
(185, 205, 8),
(191, 205, 13),
(188, 205, 17),
(187, 205, 19),
(189, 205, 20),
(190, 205, 21);

-- --------------------------------------------------------

--
-- Table structure for table `user_languages`
--

CREATE TABLE `user_languages` (
  `ul_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  `proficiency` enum('Native','Fluent','Intermediate','Beginner') NOT NULL,
  `is_native` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_languages`
--

INSERT INTO `user_languages` (`ul_id`, `user_id`, `language_id`, `proficiency`, `is_native`) VALUES
(1, 1, 1, 'Fluent', 0),
(2, 1, 7, 'Native', 1),
(3, 1, 11, 'Fluent', 0),
(4, 2, 1, 'Native', 1),
(5, 2, 4, 'Fluent', 0),
(6, 2, 3, 'Native', 1),
(7, 3, 1, 'Native', 1),
(8, 3, 22, 'Native', 1),
(9, 3, 5, 'Intermediate', 0),
(10, 4, 1, 'Fluent', 0),
(11, 4, 3, 'Native', 1),
(12, 4, 21, 'Native', 1),
(13, 5, 1, 'Fluent', 0),
(14, 5, 6, 'Native', 1),
(15, 5, 16, 'Intermediate', 0),
(16, 6, 7, 'Native', 1),
(17, 6, 1, 'Fluent', 0),
(18, 6, 8, 'Intermediate', 0),
(19, 7, 1, 'Fluent', 0),
(20, 7, 2, 'Native', 1),
(21, 7, 21, 'Native', 1),
(22, 8, 1, 'Native', 1),
(23, 8, 5, 'Intermediate', 0),
(24, 8, 4, 'Beginner', 0),
(25, 9, 1, 'Native', 1),
(26, 188, 2, 'Native', 1),
(27, 189, 1, 'Intermediate', 0),
(28, 190, 2, 'Native', 1),
(29, 191, 1, 'Beginner', 0),
(30, 192, 2, 'Native', 1),
(31, 192, 1, 'Fluent', 0),
(32, 193, 2, 'Fluent', 0),
(33, 193, 1, 'Native', 1),
(34, 194, 1, 'Native', 1),
(35, 194, 2, 'Fluent', 0),
(36, 195, 2, 'Intermediate', 0),
(37, 195, 3, 'Intermediate', 0),
(38, 195, 1, 'Intermediate', 0),
(39, 196, 1, 'Fluent', 0),
(40, 196, 11, 'Intermediate', 0),
(41, 197, 2, 'Native', 1),
(42, 198, 14, 'Native', 1),
(43, 198, 1, 'Beginner', 0),
(44, 200, 2, '', 0),
(45, 200, 10, '', 0),
(46, 201, 2, '', 0),
(47, 201, 1, '', 0),
(48, 201, 15, '', 0),
(49, 202, 10, '', 0),
(50, 202, 1, '', 0),
(51, 202, 5, '', 0),
(52, 204, 1, 'Intermediate', 0),
(53, 204, 2, 'Intermediate', 0),
(54, 204, 6, 'Intermediate', 0),
(55, 205, 11, 'Intermediate', 0),
(56, 205, 3, 'Intermediate', 0),
(57, 205, 6, 'Intermediate', 0),
(58, 205, 5, 'Intermediate', 0);

-- --------------------------------------------------------

--
-- Table structure for table `user_verification`
--

CREATE TABLE `user_verification` (
  `verification_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `selfie_path` varchar(255) DEFAULT NULL,
  `document_path` varchar(255) DEFAULT NULL,
  `document_type` enum('national_id','passport','driving_license','student_id','ssn') DEFAULT NULL,
  `gps_lat` decimal(10,8) DEFAULT NULL,
  `gps_lng` decimal(11,8) DEFAULT NULL,
  `gps_timestamp` datetime DEFAULT NULL,
  `location_mismatch` tinyint(1) DEFAULT 0,
  `verification_score` int(11) DEFAULT 0,
  `fraud_score` int(11) DEFAULT 0,
  `admin_notes` text DEFAULT NULL,
  `reviewed_at` datetime DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `user_verification`
--

INSERT INTO `user_verification` (`verification_id`, `user_id`, `selfie_path`, `document_path`, `document_type`, `gps_lat`, `gps_lng`, `gps_timestamp`, `location_mismatch`, `verification_score`, `fraud_score`, `admin_notes`, `reviewed_at`, `reviewed_by`, `created_at`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 01:30:33'),
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 01:30:33'),
(3, 3, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 01:30:33'),
(4, 4, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 01:30:33'),
(5, 5, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 01:30:33'),
(6, 6, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 01:30:33'),
(7, 7, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 1, NULL, NULL, NULL, '2026-03-25 01:30:33'),
(8, 8, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 01:30:33'),
(9, 9, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 01:36:47'),
(10, 188, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 02:23:40'),
(11, 189, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 02:24:13'),
(12, 190, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 02:24:54'),
(13, 191, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 02:25:22'),
(14, 192, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 02:26:10'),
(15, 193, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 02:27:06'),
(16, 194, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-03-25 02:27:34'),
(17, 195, '195_selfie_1775126003.jpg', '195_1775125999_a13eb372.png', 'national_id', NULL, NULL, NULL, 0, 80, 0, NULL, NULL, NULL, '2026-04-02 16:31:27'),
(18, 196, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-04-02 16:37:45'),
(19, 197, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-04-02 16:38:18'),
(20, 198, NULL, NULL, NULL, NULL, NULL, NULL, 0, 100, 0, NULL, NULL, NULL, '2026-04-02 16:39:01'),
(21, 199, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, '2026-04-11 01:36:04'),
(22, 200, NULL, '200_1775851345_9a42fe82.pdf', 'national_id', NULL, NULL, NULL, 0, 80, 0, NULL, '2026-04-11 20:04:27', NULL, '2026-04-11 01:59:32'),
(23, 201, NULL, '201_1775851804_e399a1ae.pdf', 'passport', NULL, NULL, NULL, 0, 40, 0, NULL, NULL, NULL, '2026-04-11 02:09:01'),
(24, 202, NULL, '202_1775852410_c5c4f066.pdf', 'national_id', NULL, NULL, NULL, 0, 40, 0, NULL, NULL, NULL, '2026-04-11 02:18:58'),
(25, 203, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, NULL, NULL, NULL, '2026-04-11 19:16:20'),
(26, 204, '204_selfie_1775916018.jpg', '204_1775916016_af35f662.pdf', 'national_id', NULL, NULL, NULL, 0, 70, 0, NULL, NULL, NULL, '2026-04-11 19:58:51'),
(27, 205, '205_selfie_1776424351.jpg', '205_1776424347_84dc7d23.png', 'national_id', NULL, NULL, NULL, 0, 70, 0, NULL, NULL, NULL, '2026-04-17 17:10:58');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin_users`
--
ALTER TABLE `admin_users`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `blocked_users`
--
ALTER TABLE `blocked_users`
  ADD PRIMARY KEY (`block_id`),
  ADD UNIQUE KEY `unique_block` (`blocker_id`,`blocked_id`),
  ADD KEY `blocked_id` (`blocked_id`);

--
-- Indexes for table `countries`
--
ALTER TABLE `countries`
  ADD PRIMARY KEY (`country_id`),
  ADD UNIQUE KEY `iso_code` (`iso_code`);

--
-- Indexes for table `email_otps`
--
ALTER TABLE `email_otps`
  ADD PRIMARY KEY (`otp_id`),
  ADD KEY `idx_user_purpose` (`user_id`,`purpose`);

--
-- Indexes for table `events`
--
ALTER TABLE `events`
  ADD PRIMARY KEY (`event_id`),
  ADD KEY `creator_id` (`creator_id`);

--
-- Indexes for table `event_attendees`
--
ALTER TABLE `event_attendees`
  ADD PRIMARY KEY (`attendee_id`),
  ADD UNIQUE KEY `unique_attendee` (`event_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `friends`
--
ALTER TABLE `friends`
  ADD PRIMARY KEY (`friendship_id`),
  ADD UNIQUE KEY `unique_friendship` (`user_id_1`,`user_id_2`),
  ADD KEY `user_id_2` (`user_id_2`);

--
-- Indexes for table `friend_requests`
--
ALTER TABLE `friend_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD UNIQUE KEY `unique_request` (`sender_id`,`receiver_id`),
  ADD KEY `idx_receiver` (`receiver_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `interests`
--
ALTER TABLE `interests`
  ADD PRIMARY KEY (`interest_id`);

--
-- Indexes for table `languages`
--
ALTER TABLE `languages`
  ADD PRIMARY KEY (`language_id`),
  ADD UNIQUE KEY `iso_code` (`iso_code`);

--
-- Indexes for table `login_sessions`
--
ALTER TABLE `login_sessions`
  ADD PRIMARY KEY (`session_id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `idx_token` (`session_token`),
  ADD KEY `idx_user` (`user_id`);

--
-- Indexes for table `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`message_id`),
  ADD KEY `receiver_id` (`receiver_id`),
  ADD KEY `idx_conversation` (`sender_id`,`receiver_id`,`sent_at`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`post_id`),
  ADD KEY `idx_user_posts` (`user_id`),
  ADD KEY `idx_feed_order` (`created_at`);

--
-- Indexes for table `post_comments`
--
ALTER TABLE `post_comments`
  ADD PRIMARY KEY (`comment_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_post_comments` (`post_id`);

--
-- Indexes for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD PRIMARY KEY (`like_id`),
  ADD UNIQUE KEY `unique_like` (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `post_reactions`
--
ALTER TABLE `post_reactions`
  ADD PRIMARY KEY (`reaction_id`),
  ADD UNIQUE KEY `unique_reaction` (`post_id`,`user_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `reports`
--
ALTER TABLE `reports`
  ADD PRIMARY KEY (`report_id`),
  ADD KEY `reporter_id` (`reporter_id`),
  ADD KEY `reported_user_id` (`reported_user_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_status` (`account_status`),
  ADD KEY `idx_country` (`country_id`),
  ADD KEY `idx_online` (`is_online`);

--
-- Indexes for table `user_activity`
--
ALTER TABLE `user_activity`
  ADD PRIMARY KEY (`activity_id`),
  ADD KEY `idx_user_activity` (`user_id`);

--
-- Indexes for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD PRIMARY KEY (`badge_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `user_interests`
--
ALTER TABLE `user_interests`
  ADD PRIMARY KEY (`ui_id`),
  ADD UNIQUE KEY `unique_user_interest` (`user_id`,`interest_id`),
  ADD KEY `interest_id` (`interest_id`);

--
-- Indexes for table `user_languages`
--
ALTER TABLE `user_languages`
  ADD PRIMARY KEY (`ul_id`),
  ADD UNIQUE KEY `unique_user_language` (`user_id`,`language_id`),
  ADD KEY `language_id` (`language_id`);

--
-- Indexes for table `user_verification`
--
ALTER TABLE `user_verification`
  ADD PRIMARY KEY (`verification_id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin_users`
--
ALTER TABLE `admin_users`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `blocked_users`
--
ALTER TABLE `blocked_users`
  MODIFY `block_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `countries`
--
ALTER TABLE `countries`
  MODIFY `country_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `email_otps`
--
ALTER TABLE `email_otps`
  MODIFY `otp_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=72;

--
-- AUTO_INCREMENT for table `events`
--
ALTER TABLE `events`
  MODIFY `event_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `event_attendees`
--
ALTER TABLE `event_attendees`
  MODIFY `attendee_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `friends`
--
ALTER TABLE `friends`
  MODIFY `friendship_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `friend_requests`
--
ALTER TABLE `friend_requests`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `interests`
--
ALTER TABLE `interests`
  MODIFY `interest_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `languages`
--
ALTER TABLE `languages`
  MODIFY `language_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `login_sessions`
--
ALTER TABLE `login_sessions`
  MODIFY `session_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `messages`
--
ALTER TABLE `messages`
  MODIFY `message_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `posts`
--
ALTER TABLE `posts`
  MODIFY `post_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `post_comments`
--
ALTER TABLE `post_comments`
  MODIFY `comment_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `post_likes`
--
ALTER TABLE `post_likes`
  MODIFY `like_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `post_reactions`
--
ALTER TABLE `post_reactions`
  MODIFY `reaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `reports`
--
ALTER TABLE `reports`
  MODIFY `report_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

--
-- AUTO_INCREMENT for table `user_activity`
--
ALTER TABLE `user_activity`
  MODIFY `activity_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=144;

--
-- AUTO_INCREMENT for table `user_badges`
--
ALTER TABLE `user_badges`
  MODIFY `badge_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `user_interests`
--
ALTER TABLE `user_interests`
  MODIFY `ui_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=193;

--
-- AUTO_INCREMENT for table `user_languages`
--
ALTER TABLE `user_languages`
  MODIFY `ul_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `user_verification`
--
ALTER TABLE `user_verification`
  MODIFY `verification_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `blocked_users`
--
ALTER TABLE `blocked_users`
  ADD CONSTRAINT `blocked_users_ibfk_1` FOREIGN KEY (`blocker_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `blocked_users_ibfk_2` FOREIGN KEY (`blocked_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `email_otps`
--
ALTER TABLE `email_otps`
  ADD CONSTRAINT `email_otps_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `events`
--
ALTER TABLE `events`
  ADD CONSTRAINT `events_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `event_attendees`
--
ALTER TABLE `event_attendees`
  ADD CONSTRAINT `event_attendees_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`event_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `event_attendees_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `friends`
--
ALTER TABLE `friends`
  ADD CONSTRAINT `friends_ibfk_1` FOREIGN KEY (`user_id_1`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `friends_ibfk_2` FOREIGN KEY (`user_id_2`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `friend_requests`
--
ALTER TABLE `friend_requests`
  ADD CONSTRAINT `friend_requests_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `friend_requests_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `login_sessions`
--
ALTER TABLE `login_sessions`
  ADD CONSTRAINT `login_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `post_comments`
--
ALTER TABLE `post_comments`
  ADD CONSTRAINT `post_comments_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_comments_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `post_likes`
--
ALTER TABLE `post_likes`
  ADD CONSTRAINT `post_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `post_reactions`
--
ALTER TABLE `post_reactions`
  ADD CONSTRAINT `post_reactions_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `posts` (`post_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `post_reactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `reports`
--
ALTER TABLE `reports`
  ADD CONSTRAINT `reports_ibfk_1` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reports_ibfk_2` FOREIGN KEY (`reported_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `countries` (`country_id`) ON DELETE SET NULL;

--
-- Constraints for table `user_activity`
--
ALTER TABLE `user_activity`
  ADD CONSTRAINT `user_activity_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_interests`
--
ALTER TABLE `user_interests`
  ADD CONSTRAINT `user_interests_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_interests_ibfk_2` FOREIGN KEY (`interest_id`) REFERENCES `interests` (`interest_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_languages`
--
ALTER TABLE `user_languages`
  ADD CONSTRAINT `user_languages_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_languages_ibfk_2` FOREIGN KEY (`language_id`) REFERENCES `languages` (`language_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_verification`
--
ALTER TABLE `user_verification`
  ADD CONSTRAINT `user_verification_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
