CREATE TABLE app_user(
	user_id serial PRIMARY KEY,
	email varchar(40) UNIQUE NOT NULL,
	password_hash VARCHAR(200) NOT NULL,
	is_admin bool DEFAULT false,
	is_verified bool DEFAULT false,
	account_since date DEFAULT CURRENT_DATE
);