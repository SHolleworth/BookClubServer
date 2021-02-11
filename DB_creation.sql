CREATE TABLE User (
	id int NOT NULL AUTO_INCREMENT,
	username VARCHAR(255) NOT NULL,
	password VARCHAR(255) NOT NULL,
	salt VARCHAR(255) NOT NULL,
 	PRIMARY KEY (id)
);

CREATE TABLE Shelf (\
	id INT NOT NULL AUTO_INCREMENT,\
	name VARCHAR(255) NOT NULL,\
	userId INT NOT NULL,\
	PRIMARY KEY (id),\
	FOREIGN KEY (userId) REFERENCES User(id)\
);

CREATE TABLE Book (\
	id INT NOT NULL AUTO_INCREMENT,\
	volumeId VARCHAR(255),\
	shelfId INT NOT NULL,\
	PRIMARY KEY (id),\
	FOREIGN KEY (shelfId) REFERENCES Shelf(id)\
);

CREATE TABLE BookInfo (\
	id INT NOT NULL AUTO_INCREMENT,\
	title VARCHAR(255),\
	authors VARCHAR(255),\
	publishers VARCHAR(255),\
	publishedsDate VARCHAR(255),\
	description LONGTEXT,\
	mainCategory VARCHAR(255),\
	thumbnail VARCHAR(255),\
	bookId INT NOT NULL,\
	PRIMARY KEY (id),\
	FOREIGN KEY(bookId) REFERENCES Book(id)\
);

INSERT INTO User (username, password, salt) VALUES ("user1", "password1", "salt1");

INSERT INTO User (username, password, salt) VALUES ("user2", "password2", "salt2");