-- -------------------------------------------------------------
-- TablePlus 5.1.0(468)
--
-- https://tableplus.com/
--
-- Database: my_node_db
-- Generation Time: 2023-02-20 16:09:36.7080
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


DROP TABLE IF EXISTS `MOONSCAPE_animations`;
CREATE TABLE `MOONSCAPE_animations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `image_uri` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `show_uri` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `scale` int(8) NOT NULL DEFAULT '1',
  `facing_right` int(8) DEFAULT NULL,
  `facing_left` int(8) DEFAULT NULL,
  `facing_front` int(8) DEFAULT NULL,
  `facing_back` int(8) DEFAULT NULL,
  `walking_frames` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `idle_frames` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `talking_frames` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `MOONSCAPE_exits`;
CREATE TABLE `MOONSCAPE_exits` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `position` char(100) NOT NULL DEFAULT '0',
  `height` float NOT NULL,
  `width` float NOT NULL,
  `to_room_id` int(11) DEFAULT NULL,
  `room_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `to_room_id` (`to_room_id`),
  CONSTRAINT `exits_ibfk_5` FOREIGN KEY (`to_room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL,
  CONSTRAINT `exits_ibfk_4` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `MOONSCAPE_rooms`;
CREATE TABLE `MOONSCAPE_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `scale` float NOT NULL DEFAULT '1',
  `image_uri` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `offset` int(8) DEFAULT NULL,
  `range` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `MOONSCAPE_users`;
CREATE TABLE `MOONSCAPE_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` char(50) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `animation_id` int(11) NOT NULL,
  `position` float NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `animation_id` (`animation_id`),
  CONSTRAINT `users_ibfk_7` FOREIGN KEY (`animation_id`) REFERENCES `animations` (`id`),
  CONSTRAINT `users_ibfk_6` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

INSERT INTO `MOONSCAPE_animations` (`id`, `image_uri`, `show_uri`, `scale`, `facing_right`, `facing_left`, `facing_front`, `facing_back`, `walking_frames`, `idle_frames`, `talking_frames`) VALUES
(1, '../imgs/char1.png', '../imgs/avatar1.png', 0, 0, 2, 1, 3, '[2,3,4,5,6,7,8,9]', '[0]', '[0,1]'),
(2, '../imgs/char2.png', '../imgs/avatar2.png', 0, 0, 2, 1, 3, '[2,3,4,5,6,7,8,9]', '[0]', '[0,1]');

INSERT INTO `MOONSCAPE_exits` (`id`, `position`, `height`, `width`, `to_room_id`, `room_id`) VALUES
(1, '[364, 125]', 41, 24, 2, 1),
(2, '[518, 164]', 35, 20, 1, 2);

INSERT INTO `MOONSCAPE_rooms` (`id`, `name`, `scale`, `image_uri`, `offset`, `range`) VALUES
(1, 'street1', 2.5, '../imgs/bg1.png', 0, '[-200,200]'),
(2, 'street2', 2.05, '../imgs/city.png', 0, '[-300,300]');

INSERT INTO `MOONSCAPE_users` (`id`, `username`, `room_id`, `animation_id`, `position`) VALUES
(1, 'Alex', 1, 1, 0),
(2, 'Anna', 1, 2, 100);



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;