DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS journal;

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY NOT NULL,
    username VARCHAR NOT NULL,
    password VARCHAR NOT NULL
);

CREATE TABLE journal (
    journal_id SERIAL PRIMARY KEY NOT NULL,
    title VARCHAR,
    content TEXT,
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
