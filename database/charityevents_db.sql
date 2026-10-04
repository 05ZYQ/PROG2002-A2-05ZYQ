-- ================================================================
-- charityevents_db.sql
-- Database export for the Kindred City Charity events website
-- PROG2002 Web Development II - Assignment 2
--
-- Import with MySQL Workbench:
--   File > Open SQL Script > Run  (or)  mysql -u root -p < charityevents_db.sql
-- ================================================================

CREATE DATABASE IF NOT EXISTS `charityevents_db` DEFAULT CHARACTER SET utf8mb4;
USE `charityevents_db`;

DROP TABLE IF EXISTS `event`;
DROP TABLE IF EXISTS `category`;
DROP TABLE IF EXISTS `organisation`;

-- ----------------------------------------------------------------
-- Table: organisation
-- Stores the charitable organisations that host the events.
-- ----------------------------------------------------------------
CREATE TABLE `organisation` (
  `org_id`         INT NOT NULL AUTO_INCREMENT,
  `org_name`       VARCHAR(120) NOT NULL,
  `org_mission`    VARCHAR(500) NOT NULL,
  `contact_email`  VARCHAR(120) NOT NULL,
  `contact_phone`  VARCHAR(30)  NOT NULL,
  `website`        VARCHAR(160) DEFAULT NULL,
  PRIMARY KEY (`org_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- Table: category
-- Look-up table of event categories (fun run, gala, auction, ...).
-- ----------------------------------------------------------------
CREATE TABLE `category` (
  `category_id`          INT NOT NULL AUTO_INCREMENT,
  `category_name`        VARCHAR(80) NOT NULL,
  `category_description` VARCHAR(300) NOT NULL,
  PRIMARY KEY (`category_id`),
  UNIQUE KEY `uq_category_name` (`category_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- Table: event
-- One row per charity event. A past event is derived by comparing
-- event_date with the current date; suspended events are hidden
-- from the public pages.
-- ----------------------------------------------------------------
CREATE TABLE `event` (
  `event_id`         INT NOT NULL AUTO_INCREMENT,
  `org_id`           INT NOT NULL,
  `category_id`      INT NOT NULL,
  `event_name`       VARCHAR(150) NOT NULL,
  `event_description` TEXT NOT NULL,
  `event_date`       DATE NOT NULL,
  `start_time`       TIME NOT NULL,
  `venue`            VARCHAR(150) NOT NULL,
  `location`         VARCHAR(100) NOT NULL,
  `ticket_price`     DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `fundraising_goal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `amount_raised`    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `event_image`      VARCHAR(200) DEFAULT NULL,
  `is_active`        TINYINT(1) NOT NULL DEFAULT 1,
  `is_suspended`     TINYINT(1) NOT NULL DEFAULT 0,
  `created_at`       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`event_id`),
  KEY `fk_event_org` (`org_id`),
  KEY `fk_event_category` (`category_id`),
  CONSTRAINT `fk_event_org` FOREIGN KEY (`org_id`) REFERENCES `organisation` (`org_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_event_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`category_id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------------------------------------------
-- Sample data: organisations
-- ----------------------------------------------------------------
INSERT INTO `organisation` (`org_id`, `org_name`, `org_mission`, `contact_email`, `contact_phone`, `website`) VALUES
(1, 'Kindred City Charity', 'Kindred City Charity connects neighbours with local causes, funding food relief, youth mentoring and crisis accommodation across the greater city area.', 'hello@kindredcity.org.au', '(02) 8810 2244', 'www.kindredcity.org.au'),
(2, 'Harbour Youth Trust', 'Harbour Youth Trust runs mentoring, tutoring and employment programs for young people doing it tough.', 'contact@harbouryouth.org.au', '(02) 9955 7781', 'www.harbouryouth.org.au'),
(3, 'Greenline Wildlife Fund', 'Greenline Wildlife Fund protects urban bushland and native wildlife habitats through community-led restoration projects.', 'info@greenlinewildlife.org.au', '(02) 7744 3120', 'www.greenlinewildlife.org.au');

-- ----------------------------------------------------------------
-- Sample data: categories
-- ----------------------------------------------------------------
INSERT INTO `category` (`category_id`, `category_name`, `category_description`) VALUES
(1, 'Fun Run', 'Timed and untimed running events where entry fees are donated to the cause.'),
(2, 'Gala Dinner', 'Formal fundraising dinners with auctions, speeches and entertainment.'),
(3, 'Silent Auction', 'Bid on donated goods and experiences; proceeds go to charity.'),
(4, 'Charity Concert', 'Live music performances raising money for community programs.'),
(5, 'Quiz Night', 'Team trivia evenings with entry fees and prize donations.'),
(6, 'Community Market', 'Stall-holder markets where a share of sales supports the charity.');

-- ----------------------------------------------------------------
-- Sample data: events (10 events, including past + suspended rows)
-- ----------------------------------------------------------------
INSERT INTO `event`
(`event_id`, `org_id`, `category_id`, `event_name`, `event_description`, `event_date`, `start_time`, `venue`, `location`, `ticket_price`, `fundraising_goal`, `amount_raised`, `event_image`, `is_active`, `is_suspended`) VALUES
(1, 1, 1, 'City Sunrise Fun Run 2026', 'A 5 km and 10 km run along the river path at sunrise. Every registration includes a finisher medal and a donated breakfast. Funds raised provide weekly food hampers for families in crisis.', '2026-10-18', '06:30:00', 'Riverside Park Precinct', 'Westport', 45.00, 40000.00, 27350.00, 'funrun.jpg', 1, 0),
(2, 2, 2, 'Harbour Youth Gala Night', 'Black-tie dinner with a three-course meal, live string quartet and guest speakers from the mentoring program. All proceeds fund free tutoring for senior students.', '2026-11-07', '19:00:00', 'Grand Pacific Ballroom', 'Eastport', 120.00, 60000.00, 18200.00, 'gala.jpg', 1, 0),
(3, 1, 3, 'Spring Silent Auction', 'An evening of silent bidding on art, weekend getaways and restaurant vouchers donated by local businesses. Doors open for viewing from 5 pm, bidding closes at 9 pm.', '2026-10-25', '17:00:00', 'Kindred Community Hall', 'Westport', 15.00, 15000.00, 9400.00, 'auction.jpg', 1, 0),
(4, 3, 4, 'Songs for the Bushland Concert', 'An open-air acoustic concert featuring four local bands. Funds support native habitat restoration along the Greenline corridor.', '2026-11-22', '14:00:00', 'Fernhill Amphitheatre', 'Northgate', 35.00, 25000.00, 11260.00, 'concert.jpg', 1, 0),
(5, 2, 5, 'Trivia for Tutors Quiz Night', 'Tables of six battle through eight rounds of trivia. Entry includes a cheese platter; bar proceeds are matched dollar-for-dollar by a local sponsor.', '2026-10-30', '18:30:00', 'The Anchor Hotel Function Room', 'Eastport', 20.00, 8000.00, 5150.00, 'quiz.jpg', 1, 0),
(6, 1, 6, 'Twilight Community Market', 'An evening market with food trucks, craft stalls and live folk music. Twenty percent of all stall takings go to the crisis accommodation fund.', '2026-12-05', '16:00:00', 'Kindred Square', 'Westport', 5.00, 12000.00, 3100.00, 'market.jpg', 1, 0),
(7, 3, 1, 'Wildlife Wander Trail Run', 'A trail run through urban bushland with guided stops to spot native wildlife. Registration includes a native shrub to take home and plant.', '2027-02-14', '07:00:00', 'Greenline Reserve Entry', 'Northgate', 40.00, 30000.00, 4200.00, 'trailrun.jpg', 1, 0),
(8, 2, 2, 'New Year Charity Brunch Gala', 'A relaxed daytime gala with sparkling brunch, youth speaker panel and raffle draws throughout the morning. Funds launch the 2027 employment-readiness workshops.', '2027-01-17', '10:00:00', 'Harbourview Terrace', 'City Centre', 85.00, 45000.00, 7800.00, 'brunch.jpg', 1, 0),
(9, 1, 4, 'Winter Choir Benefit Evening', 'A choral evening held in the town hall raising funds for the winter blanket drive. The event has now concluded - thank you to everyone who attended.', '2026-08-15', '19:30:00', 'Westport Town Hall', 'Westport', 25.00, 10000.00, 12380.00, 'choir.jpg', 1, 0),
(10, 3, 3, 'Coastal Art Auction (Suspended)', 'This event listing has been suspended by the website administrators pending review of the organising partner. It should not appear on any public page.', '2026-12-12', '18:00:00', 'Northgate Arts Centre', 'Northgate', 30.00, 20000.00, 0.00, 'art.jpg', 1, 1);
