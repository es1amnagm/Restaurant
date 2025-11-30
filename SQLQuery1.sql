use nodejs;
CREATE TABLE users
(
  id INT IDENTITY(1,1) PRIMARY KEY ,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(20) CHECK (gender IN ('male', 'female')),
  birth_date DATE,
  phone VARCHAR(30) NOT NULL ,
  created_at SMALLDATETIME DEFAULT GETDATE()
)


use Restaurant


select * from dbo.users


INSERT INTO users (email, password, first_name, last_name, gender, birth_date, phone)
VALUES (
    'eslam@example.com',
    '123456',                -- Note: store hashed passwords in production
    'Eslam',
    'Nagm',
    'male',
    '1998-01-01',
    '+201234567890'
);




SELECT CURRENT_USER AS current_user, DB_NAME('Restaurant') AS current_db