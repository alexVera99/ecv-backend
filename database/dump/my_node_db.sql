-- -------------------------------------------------------------
-- TablePlus 5.3.5(494)
--
-- https://tableplus.com/
--
-- Database: my_node_db
-- Generation Time: 2023-03-31 21:14:05.8550
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


DROP TABLE IF EXISTS `MOONSCAPE_3D_animations`;
CREATE TABLE `MOONSCAPE_3D_animations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` char(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `uri` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `scene_node_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `scene_node_id` (`scene_node_id`),
  CONSTRAINT `MOONSCAPE_3D_animations_ibfk_1` FOREIGN KEY (`scene_node_id`) REFERENCES `MOONSCAPE_3D_scene_nodes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `MOONSCAPE_3D_materials`;
CREATE TABLE `MOONSCAPE_3D_materials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` char(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `color_texture_uri` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `scene_node_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `scene_node_id` (`scene_node_id`),
  CONSTRAINT `MOONSCAPE_3D_materials_ibfk_1` FOREIGN KEY (`scene_node_id`) REFERENCES `MOONSCAPE_3D_scene_nodes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `MOONSCAPE_3D_rooms`;
CREATE TABLE `MOONSCAPE_3D_rooms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `scale` float NOT NULL DEFAULT '1',
  `gltf_uri` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `MOONSCAPE_3D_scene_nodes`;
CREATE TABLE `MOONSCAPE_3D_scene_nodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mesh_uri` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `scale` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `MOONSCAPE_3D_tokens`;
CREATE TABLE `MOONSCAPE_3D_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `token` char(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  `user_id` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `MOONSCAPE_3D_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `MOONSCAPE_3D_users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

DROP TABLE IF EXISTS `MOONSCAPE_3D_users`;
CREATE TABLE `MOONSCAPE_3D_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` char(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `scene_node_id` int(11) NOT NULL,
  `password` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Example: [0.0,0.0,0.0]',
  `orientation` char(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Example: [0.0,0.0,0.0, 1.0]',
  `is_streamer` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `room_id` (`room_id`),
  KEY `scene_node_id` (`scene_node_id`),
  CONSTRAINT `MOONSCAPE_3D_users_ibfk_1` FOREIGN KEY (`scene_node_id`) REFERENCES `MOONSCAPE_3D_scene_nodes` (`id`),
  CONSTRAINT `MOONSCAPE_3D_users_ibfk_6` FOREIGN KEY (`room_id`) REFERENCES `MOONSCAPE_3D_rooms` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

INSERT INTO `MOONSCAPE_3D_animations` (`id`, `name`, `uri`, `scene_node_id`) VALUES
(1, 'idle', 'data/megan/idle.abin', 1),
(2, 'walking', 'data/megan/walking.abin', 1),
(3, 'dance', 'data/megan/dancing.abin', 1),
(4, 'wave', 'data/megan/waving.abin', 1),
(5, 'cheer', 'data/megan/cheer.abin', 1),
(6, 'idle', 'data/lewis/idle.abin', 2),
(7, 'walking', 'data/lewis/walking.abin', 2),
(8, 'dance', 'data/lewis/dancing.abin', 2),
(9, 'wave', 'data/lewis/waving.abin', 2),
(10, 'cheer', 'data/lewis/cheer.abin', 2);

INSERT INTO `MOONSCAPE_3D_materials` (`id`, `name`, `color_texture_uri`, `scene_node_id`) VALUES
(1, 'megan', 'megan/megan.png', 1),
(2, 'lewis', 'lewis/lewis.png', 2);

INSERT INTO `MOONSCAPE_3D_rooms` (`id`, `name`, `scale`, `gltf_uri`) VALUES
(1, 'room 1', 40, 'data/room_cube_field.glb');

INSERT INTO `MOONSCAPE_3D_scene_nodes` (`id`, `mesh_uri`, `scale`) VALUES
(1, 'megan/megan.wbin', 0.3),
(2, 'lewis/lewis.wbin', 0.3);

INSERT INTO `MOONSCAPE_3D_users` (`id`, `username`, `room_id`, `scene_node_id`, `password`, `position`, `orientation`, `is_streamer`) VALUES
(1, 'Alex', 1, 2, '$2b$10$wld.cZxntyUjBrAdN32zf.t0nFrwbpKN1hA2/M.PYFZ6wIOUMfU0O', '[150, 0, 150]', '[0.0, 0.0, 0.0, 1.0]', 1),
(2, 'Anna', 1, 1, '$2b$10$5Ehdz1rBYniRAyhQLlXoz.ztR4G7lFs2Wasbt526k4akn3o/xPw9i', '[200, 0, 100]', '[0.0, -0.47, 0.0, 0.88]', 0);



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;