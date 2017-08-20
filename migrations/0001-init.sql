CREATE TABLE users (
    id CHAR(9) PRIMARY KEY NOT NULL,
    quota INT DEFAULT 0
);

CREATE TABLE notices (
    id CHAR(24)  PRIMARY KEY,
    user_id CHAR(9) DEFAULT "anonymous",
    title VARCHAR(50),
    message TEXT,
    author_name VARCHAR(40),
    addressed_to VARCHAR(40),
    vote_id CHAR(24) DEFAULT (LOWER(HEX(RANDOMBLOB(12)))) UNIQUE NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);


