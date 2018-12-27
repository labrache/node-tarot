DROP TABLE IF EXISTS `technical`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `friends`;
DROP TABLE IF EXISTS `turn`;
DROP TABLE IF EXISTS `tableplayers`;
DROP TABLE IF EXISTS `tables`;
DROP TABLE IF EXISTS `winner`;
CREATE TABLE `technical` (
	`key`	TEXT NOT NULL UNIQUE,
	`value`	TEXT,
	PRIMARY KEY(`key`)
);
INSERT INTO `technical` (`key`,`value`) VALUES ("dbver","1");
CREATE TABLE `users` (
	`login`	TEXT NOT NULL UNIQUE,
	`name`	TEXT NOT NULL,
	`mail`	TEXT NOT NULL,
	`admin`	INTEGER NOT NULL DEFAULT 0,
	`password`	TEXT NOT NULL,
	`picture`	TEXT NULL,
	PRIMARY KEY(`login`)
);
CREATE TABLE `friends` (
	`login`	TEXT NOT NULL,
	`friend`	TEXT NOT NULL,
	PRIMARY KEY(`login`,`friend`)
);
CREATE TABLE `turn` (
	`tableid`	TEXT NOT NULL,
	`itcount`	INTEGER NOT NULL,
	`scores`	TEXT NOT NULL,
	PRIMARY KEY(`tableid`,`itcount`)
);
CREATE TABLE `tableplayers` (
	`tableid`	TEXT NOT NULL,
	`player`	TEXT NOT NULL,
	`position`	INTEGER NOT NULL,
	PRIMARY KEY(`tableid`,`position`)
);
CREATE TABLE `tables` (
	`tableid`	TEXT NOT NULL,
	`creationdate`	INTEGER NOT NULL,
	`configuration`	TEXT NOT NULL,
	PRIMARY KEY(`tableid`)
);
CREATE TABLE `winner` (
	`tableid`	TEXT NOT NULL,
	`player`	TEXT NOT NULL,
	PRIMARY KEY(`tableid`,`player`)
);
/* TODO: foreign key */
INSERT INTO `users` (`login`,`name`,`mail`,`admin`,`password`)
	VALUES ("admin","Admin","root@localhost",1,"8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918");