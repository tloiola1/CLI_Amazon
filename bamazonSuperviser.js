var inquirer = require('inquirer');
var coloring = require('coloring');
var mysql = require('mysql');

cl(coloring.green('\n****** Welcome to BAmazon Superviser ******'));

//require fs to read a file containning password
var fs = require('fs');
//read the file and retrieving password
fs.readFile('config.txt', 'utf8', function(err, data){
   if(err) throw err;
   //variable recieving the data from text file
   var key = data;
   getDatabase(key);
})
 // 4. Create another Node app called `bamazonSupervisor.js`. Running this application will list a set of menu options:
function getDatabase(key){
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
	menu_options(connection);
}

function menu_options(connection){
	cl('\n');
	inquirer.prompt({
		type: 'list',
		name: 'option',
		message: coloring.green('****** Main Menu ******'),
		choices: ['View Product Sales by Department.', 'Create New Department', 'Update Overhead Cost','Delete Department', 'Exit Superviser Wizard.']
	}).then(function(answer){
		switch(answer.option){
			case 'View Product Sales by Department.':
				viewSales(connection);
				break;
			case 'Create New Department':
				newDepartment(connection);
				break;
			case 'Update Overhead Cost':
				updateCost(connection);
				break;
			case 'Delete Department':
				deleteDepartment(connection);
				break;
			case 'Exit Superviser Wizard.':
				disconnect(connection);
				break;
		}
	});
}
//    * View Product Sales by Department
function viewSales(connection){
	cl('\n');
	var queryProd = 'SELECT id, department_name, over_head_cost FROM bamazondb.departments'; 
	connection.query(queryProd, function(err, res){
		if(err)throw err;
		for (var i = 0; i < res.length; i++) {
         //display database contents 
         cl(' Department ID#: '+ coloring.bold(res[i].id) + ' | Department Name: ' 
               + coloring.bold(res[i].department_name) + ' | OverheadCost: $' + coloring.bold(res[i].over_head_cost));//+ ' | Product Sale: $' + coloring.bold(res[i].product_sales)
         cl(coloring.green('-------------------------------------------------------------------------------------------'));
      	}
      	menu_options(connection)
	})
}
//    * Create New Department
function newDepartment(connection){
	cl('\n');
	inquirer.prompt(
	[
		{
			type: 'input',
			name: 'name',
			message: 'Enter New Department Name:'
		},
		{
			type: 'input',
			name: 'cost',
			message: 'Enter Overhead Cost:'
		}
	]
	).then(function(answer){
		var query = 'INSERT INTO departments SET ?';
		connection.query(query,
		    {
		      department_name: answer.name,
		      over_head_cost: answer.cost
		    },
		    function(err, res) {
		      console.log(res.affectedRows + " New Department Added!\n");
		      // Call updateProduct AFTER the INSERT completes
			menu_options(connection);
		    }
		 );
	});
}

function updateCost(connection){
	cl('\n');
	inquirer.prompt([
		{
			type: 'input',
			name: 'idNumber',
			message: 'Enter Department ID#'
		},
		{
			type: 'input',
			name: 'cost',
			message: 'Enter New Overhead Cost.'
		}
	]).then(function(answer){
		var query = 'UPDATE bamazondb.departments SET ? WHERE ?'
		connection.query(query,
			[
			    {
			      over_head_cost: answer.cost,
			    },
			    {
			      id: answer.idNumber
			    }
			],
		    function(err, res) {
		      console.log(res.affectedRows + " New Cost Added!\n");
		      // Call updateProduct AFTER the INSERT completes
			menu_options(connection);
		    }
		 );


	})
}

function deleteDepartment(connection){
	cl('\n');
	inquirer.prompt({
		type: 'input',
		name: 'idNumber',
		message: 'Enter Department ID# to be Deleted'
	}).then(function(selected){
		var query = 'SELECT department_name FROM bamazondb.departments WHERE id = ' + selected.idNumber;
		connection.query(query, function(err, res){
			var department = res[0].department_name;
			inquirer.prompt({
				type: 'confirm',
				name: 'confirm',
				message: 'You Have Selected Department of '+ coloring.red(department) + ' to be Deleted.',
				default: true
			}).then(function(answer){
				if(answer.confirm === true){
					var query = 'DELETE FROM departments WHERE id = '+ selected.idNumber;
					connection.query(query,
						function(err, res) {
		      				console.log(res.affectedRows + " Department Has Been Terminate!\n");
		      				// Call updateProduct AFTER the INSERT completes
							menu_options(connection);
		    			}
					);
				}
				else if(answer.confirm === false){
					menu_options(connection);
				}
			});
		})
	})
}

// 5. When a supervisor selects `View Product Sales by Department`, the app should display a summarized table in their terminal/bash window. 
// Use the table below as a guide.

// | department_id | department_name | over_head_costs | product_sales | total_profit |
// | ------------- | --------------- | --------------- | ------------- | ------------ |
// | 01            | Electronics     | 10000           | 20000         | 10000        |
// | 02            | Clothing        | 60000           | 100000        | 40000        |

// 6. The `total_profit` column should be calculated on the fly using the difference between `over_head_costs` and `product_sales`. `total_profit` 
// should not be stored in any database. You should use a custom alias.

function disconnect(connection){
	cl(coloring.green('\n***** See You Later Budy *****\n'));
	connection.end();
}

function cl(object){
	console.log(object);
}