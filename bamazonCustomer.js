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
      display_data(connection);
   });
}

function display_data(connection){ 
   //display database contents
   cl(coloring.green('\n****** PRODUCTS FOR SALE ******\n'));
   // ids, names, and prices of products for sale
   var query = 'SELECT id, product_name, price, stock_quantity FROM bamazondb.products';
   connection.query(query, function(err, res){
      if(err)throw err;
      for (var i = 0; i < res.length; i++) {
         //display database contents 
         cl(' Product ID#: '+ coloring.bold(res[i].id) + ' | Product Name: ' 
               + coloring.bold(res[i].product_name) + ' | Price: $' + coloring.bold(res[i].price));
         cl(coloring.green('-------------------------------------------------------------------------------------------'));
      }
      //call function for user to buy product and passing connection as parameter
      buyProduct(connection);
   });
}
//function for user to buy product
function buyProduct(connection){
   cl('\n');
   //use inquirer to get user inputs
   inquirer.prompt([
   {
      type: 'input',
      //key name & value id number of product
      name: 'idNumber',
      //ask the ID of the product user would like to buy. 
      // if user wish to leave press enter to exit the program which will be executed in line 103.
      message: 'To Exit Program Press Enter.\n'+'  To Make A Purchase Enter Product ID#.',
      validate: function(value){
         if (isNaN(value) === false){
            return true;
         }
         return false;
      }
   },
   {
      // inquirer user to get user input
      type: 'input',
      //key name & value quantity
      name: 'quantity',
      // ask user to enter quantity wished to add to cart
      message: 'How many would you like to add to your cart?',
      validate: function(value){
         if (isNaN(value) === false){
            return true;
         }
         return false;
      }
   }
   //promisses to handle the inputs
   ]).then(function(answer){
      //this condition gives value to quantity a value 0 if user just press enter to be treated down a few lines
      if(answer.quantity === ''){
         answer.quantity = 0;
      }
      // cl(' Product ID# '+ answer.idNumber + ' | Quantity: '+answer.quantity);
      // giving a variable sequel logical commands to be executed
      var query = 'SELECT product_name, price, stock_quantity FROM bamazondb.products WHERE id = ' + answer.idNumber;
      // read database to query parameter where a variable query has been given to
      connection.query(query, function(err, res){
         //this condition executes if user has missing both inputs in a atempt to exit the program
         if(err){
            //call function to exit & end program.
            disconnect(connection);
            return;
         }
         else{
            // condition to be executed if product quantity contained in database stock is less than user wish to buy.
            if(answer.quantity > res[0].stock_quantity){
               //informing user that quantity is not available
               cl(coloring.red('\n ***** Quantity in stock not available *****'));
               //show user quantity available in stock
               cl('Quantity available in stock: ' + res[0].stock_quantity);
               //returning to function where can enter new quantity of the product user wishes to buy
               buyProduct(connection);
               return true;
            }
            //condition pass if quantity is stock is available
            else{
               //this conditition olny executes if id of product or quantity needed are valid inputs
               if(res[0].product_name !== undefined && answer.quantity > 0){
                  //show user that the product has been added to cart
                  cl(coloring.green('\n ****** YOUR CART ******'));
                  //user cart has product name, quantity added, and total price which is = to quantity * product price
                  cl(' Product Name: ' + coloring.bold(res[0].product_name) + ' | Quantity: ' + coloring.bold(answer.quantity)
                     + ' | Total: $' + coloring.bold(res[0].price * answer.quantity));
                  cl('\n');
                  //newQuantity variable is = to quantity in database stock subtracted by user purchased quantity.
                  var newQuantity = res[0].stock_quantity - answer.quantity;
                  // query the database to update new quantity of the product which user has purchased
                  //setting new quantity where id = to id of the product user entered
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
                        // if(answer.quantity > 0){
                           //show that changes were made in database
                           // cl(coloring.green(res.affectedRows + " Stock updated!\n"));
                           buyProduct(connection);
                        // }
                     }
                  );
               }
               else{
                  //inquirer the user if missed id of the product &&|| quantity needed
                  //were intentional in a attempt to exit the program
                  inquirer.prompt({
                     type: 'list',
                     name: 'option',
                     message: 'You have missed an input. What would you like to do?',
                     choices: ['Continue Shopping.', 'Exit Program.']
                  }).then(function(user){
                     //condition executes if user missed one of the parameters id of the product &&|| quantity needed by mistake
                     if(user.option === 'Continue Shopping.'){
                        //then goes back to menu where user can enter valid paramenters
                        buyProduct(connection);
                     }
                     //condition executes if intentional in a attempt to exit the program
                     else if(user.option === 'Exit Program.'){
                        //exit and end program
                        disconnect(connection);
                     }
                  })
               }
            }
         }
      });
   });
}
//function to end database connection and exit program
function disconnect(connection){
   cl('\n***** THANKS FOR SHOPPING WITH US! *****\n');
   connection.end();
}
//function to console.log // easier to type that's all
//as a java developer I used to use pl short for println and p short for print
//now as a javascript developer I use cl short for console.log as I dont know all the shortcuts for javascript texteditor
function cl(object){
   console.log(object);
}