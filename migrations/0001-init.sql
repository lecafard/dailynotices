CREATE TABLE users (
    id CHAR(9) PRIMARY KEY NOT NULL,
    quota INT DEFAULT 0
);

CREATE TABLE notices (
    id CHAR(24)  PRIMARY KEY,
    user_id CHAR(9) DEFAULT "anonymous",
    title VARCHAR(32),
    message VARCHAR(200),
    teacher VARCHAR(32),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);


