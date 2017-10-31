var inquirer = require('inquirer');
var coloring = require('coloring');
//require fs to read a file containning password
var fs = require('fs');
//read the file and retrieving password
fs.readFile('config.txt', 'utf8', function(err, data){
   if(err) throw err;
   //variable recieving the data from text file
   var key = data;
   //passing the key with new value to a function as needed
   getDatabase(key);
})
//require mysql to connect to create a connection to a database
var mysql = require('mysql');
//function recieves key argument key containing the password to connet to database
function getDatabase(key){
   //passing properties needed for connection into a variable
   var connection = mysql.createConnection({
      host: 'localhost',
      //connect to port
      port: 3306,
      //user
      user: 'root',
      //password sent from
      password: key,
      //database to be connected to
      database: 'bamazondb'
   });
   //passing variable containing connection structure to a function to be executed.
   connectMe(connection);
}

function connectMe(connection){
   connection.connect(function(err){
      if(err) throw err;
      // cl('Connect as id: ' + _connection.threadId +'\n');
      //connection create now start work on a function to display contents from database;
      menu_options(connection);
   });
}
// function menu options where manager database by view products for sale, view low inventory, 
// add to inventory, add new product, or exit the program
function menu_options(connection){
	cl('\n');
	inquirer.prompt({
		type: 'list',
		name: 'option',
		message: coloring.green('****** MENU OPTIONS *****\n'),
		choices: ['View Products for Sale', 'View Low Inventory', 'Add to Inventory', 'Add New Product', 'Exit Manager Wizard']
	}).then(function(answer){
		switch(answer.option){
			case 'View Products for Sale':
				view_data(connection);
				break;
			case 'View Low Inventory':
				low_inventory(connection);
				break;
			case 'Add to Inventory':
				add_Inventory(connection);
				break;
			case 'Add New Product':
				add_new_product(connection);
				break;
			case 'Exit Manager Wizard':
				disconnect(connection);
				break;
		}

	});
}
//function view database products for sale: item IDs, names, prices, and quantities.
function view_data(connection){ 
   //display database contents
   cl(coloring.green('\n****** PRODUCTS FOR SALE ******\n'));
   // ids, names, and prices of products for sale
   var query = 'SELECT id, product_name, price, stock_quantity FROM bamazondb.products';
   connection.query(query, function(err, res){
      if(err)throw err;
      var stock;
      for (var i = 0; i < res.length; i++) {
      	if(res[i].stock_quantity < 5){
      		stock = coloring.red(res[i].stock_quantity);
      	}
      	else{
      		stock = coloring.green(res[i].stock_quantity);
      	}
         //display database contents 
         cl(' Product ID#: '+ coloring.bold(res[i].id) + ' | Product Name: ' + coloring.bold(res[i].product_name) 
          + ' | Price: $' + coloring.bold(res[i].price) + ' | Stock: ' + coloring.bold(stock));
         cl(coloring.green('---------------------------------------------------------------------------------------------------------'));
      }
      //call function for user to buy product and passing connection as parameter
      menu_options(connection);
   });
}
//If a manager selects `View Low Inventory`, then it should list all items with an inventory count lower than five.
function low_inventory(connection){
	var query = 'SELECT id, product_name, price, stock_quantity FROM bamazondb.products WHERE stock_quantity < ' + 5;
	connection.query(query, function(err, res){
         //display database contents 
		for (var i = 0; i < res.length; i++) {
        	cl(' Product ID#: '+ coloring.bold(res[i].id) + ' | Product Name: ' + coloring.bold(res[i].product_name) 
             + ' | Price: $' + coloring.bold(res[i].price) + ' | Stock: ' + coloring.bold(coloring.red(res[i].stock_quantity)));
         	cl(coloring.green('---------------------------------------------------------------------------------------------------------'));
      	}
      //call function for user to buy product and passing connection as parameter
      menu_options(connection);
   });
}
//If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently 
// in the store.
function add_Inventory(connection){
	inquirer.prompt(
	[
		{
			type: 'input',
			name: 'idNumber',
			message: 'Enter Product ID#:'
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'Enter Quantity to Add to Inventory:'
		}
	]
	).then(function(answer){
		var query = 'SELECT stock_quantity FROM bamazondb.products WHERE id = ' + answer.idNumber;
		connection.query(query, function(err, res){
			var newQuantity =  res[0].stock_quantity + parseInt(answer.quantity);
			cl(newQuantity);

		// cl(answer.idNumber + ' ' + answer.quantity);
		connection.query('UPDATE bamazondb.products SET ? WHERE ?',
	        [
	            {
	               //update stock quantity to new quantity
	               stock_quantity: newQuantity
	            },
	            {
	               //query the id then insert new quantity to this id
	               id: answer.idNumber
	            }
	        ],
	        function(err, res){
	            //this condition executes only if user quantity is a valid input >= 1
	            if(answer.quantity > 0){
	               	//show that changes were made in database
	               	cl(coloring.green(res.affectedRows + " Stock updated!\n"));
					menu_options(connection);
	            }
	        }
      	);
   		});
	});
}
//function add new product which allows the manager to add a completely new product to the store.
function add_new_product(connection){
	inquirer.prompt(
	[
		{
			type: 'input',
			name: 'name',
			message: 'Enter Product Name:'
		},
		{
			type: 'input',
			name: 'department',
			message: 'Enter Product Department Name:'
		},
		{
			type: 'input',
			name: 'price',
			message: 'Enter Product Price:'
		},
		{
			type: 'input',
			name: 'quantity',
			message: 'Enter Product Quantity to Add to Inventory:'
		}
	]
	).then(function(answer){
		var query = 'INSERT INTO products SET ?'
		connection.query("INSERT INTO products SET ?",
		    {
		      product_name: answer.name,
		      department_name: answer.department,
		      price: answer.price,
		      stock_quantity: answer.quantity
		    },
		    function(err, res) {
		      console.log(res.affectedRows + " product inserted!\n");
		      // Call updateProduct AFTER the INSERT completes
			menu_options(connection);
		    }
		 );
	});
}
//function to end database connection and exit program
function disconnect(connection){
   cl('\n***** YOU HAVE BEEN DISCONNECTED *****\n');
   connection.end();
}
//function to console.log // easier to type that's all
//as a java developer I used to use pl short for println and p short for print
//now as a javascript developer I use cl short for console.log as I dont know all the shortcuts for javascript texteditor
function cl(object){
   console.log(object);
}