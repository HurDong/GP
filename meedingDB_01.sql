USE meetingDB;

DROP TABLE IF EXISTS Users, Restaurants, Reviews;

CREATE TABLE Users (
    id INT AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
);
CREATE TABLE Restaurants (
    id INT AUTO_INCREMENT,
    restname VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    description TEXT,
    PRIMARY KEY (id)
);
CREATE TABLE Reviews (
    id INT AUTO_INCREMENT,
    user_id INT,
    restaurant_id INT,
    rating INT NOT NULL,
    review_text TEXT,
    PRIMARY KEY (id), 
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (restaurant_id) REFERENCES Restaurants(id)
);

select * from users;
select * from restaurants;
select * from reviews;