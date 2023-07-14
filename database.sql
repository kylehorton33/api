CREATE TABLE users(
	user_id serial primary key,
	email VARCHAR(30) unique not null,
	username VARCHAR(15) unique not null,
	password VARCHAR(200) not null,
	usertype INT,
	admintype INT
)