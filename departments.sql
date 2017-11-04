USE bamasondb

CREATE TABLE products (

	--department_id
	id INT(00100) AUTO_INCREMENT,
	--department_name
	department_name VARCHAR(100) NOT NULL,
	--over_head_costs (A dummy number you set for each department)
	over_head_cost DECIMAL(10,2) NOT NULL,
	 PRIMARY KEY (id)
);