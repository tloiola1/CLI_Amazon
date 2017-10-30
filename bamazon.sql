DROP DATABASE IF EXISTS bamazondb;

CREATE DATABASE bamazondb;

USE bamazondb;

CREATE TABLE products (

	 id INT AUTO_INCREMENT_ID PRIMARY KEY,

	product_name VARCHAR(100) NOT NULL,

	department_name VARCHAR(100) NOT NULL,

	price DECIMAL(10,2) NOT NULL,

	stock_quantity INT (1000),
)

AUTO_INCREMENT_ID = 1000;

INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES 

('JavaScript Enlightenment', 'Books', 88.39, 100),
('JS – The Right Way', 'Books', 100.05, 100),
('Learning JavaScript Design Patterns', 'Books', 103.59, 100),
('Node – Up and Running', 'Books', 89.99, 100),
('Programming JavaScript Applications', 'Books', 10.50, 100),
('Exploring ES6', 'Books', 100.00, 100),
('jQuery Enlightenment', 'Books', 13.15, 100),
('Recipes with Angular.js', 'Books', 59.99, 100),
('Sams Teach Yourself Node.js', 'Books', 125.19, 100),
('Single page apps in depth', 'Books', 90.25, 100),
('Learn Webpack and React', 'Books', 80.00, 100),
('Building Web Apps with Ember.js', 'Books', 70.35, 100);