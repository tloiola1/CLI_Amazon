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
      // print('Connect as id: ' + _connection.threadId +'\n');
      //connection create now start work on a function to display contents from database;
      display_data(connection);
   });
}

function display_data(connection){ 
   //display database contents
   print(coloring.green('\n****** PRODUCTS FOR SALE ******\n'));
   // ids, names, and prices of products for sale
   var query = 'SELECT id, product_name, price, stock_quantity FROM bamazondb.products';
   connection.query(query, function(err, res){
      if(err)throw err;
      for (var i = 0; i < res.length; i++) {
         //display database contents 
         print(' Product ID#: '+ coloring.bold(res[i].id) + ' | Product Name: ' 
               + coloring.bold(res[i].product_name) + ' | Price: $' + coloring.bold(res[i].price));
         print(coloring.green('-------------------------------------------------------------------------------------------'));
      }
      buyProduct(connection);
   });
}
//function for user to buy product
function buyProduct(connection){
   //The first should ask them the ID of the product they would like to buy.
   print('\n');
   inquirer.prompt([
   {
      type: 'input',
      name: 'idNumber',
      message: 'To Exit Programm Press Enter.\n'+'  To Make A Purchase Enter Product ID#.',
      validate: function(value){
         if (isNaN(value) === false){
            return true;
         }
         return false;
      }
   },
   {
      type: 'input',
      name: 'quantity',
      message: 'How many would you like to add to your cart? ',
      validate: function(value){
         if (isNaN(value) === false){
            return true;
         }
         return false;
      }
   }
   ]).then(function(answer){
      if(answer.quantity === ''){
         answer.quantity = 0;
      }
      // print(' Product ID# '+ answer.idNumber + ' | Quantity: '+answer.quantity);
      var query = 'SELECT product_name, price, stock_quantity FROM bamazondb.products WHERE id = ' + answer.idNumber;
      connection.query(query, function(err, res){
         if(err){
            disconnect(connection);
            return;
         }
         else{
            var stock = res[0].stock_quantity;
            if(answer.quantity > stock){
               print(coloring.red('\n ***** Quantity in stock not available *****'));
               buyProduct(connection);
               return true;
            }
            else{
               if(res[0].product_name !== undefined && answer.quantity > 0){
                  print(coloring.green('\n ****** YOUR CART ******'));
                  print(' Product Name: ' + coloring.bold(res[0].product_name) + ' | Quantity: ' + coloring.bold(answer.quantity)
                     + ' | Total: $' + coloring.bold(res[0].price * answer.quantity));
                  print('\n');
                  var newQuantity = res[0].stock_quantity - answer.quantity;
                  connection.query('UPDATE bamazondb.products SET ? WHERE ?',
                     [
                        {
                           stock_quantity: newQuantity
                        },
                        {
                           id: answer.idNumber
                        }
                     ], 
                     function(err, res){
                        if(answer.quantity > 0){
                           print(coloring.green(res.affectedRows + " Stock updated!\n"));
                           buyProduct(connection);
                        }
                     }
                  );
               }
               else{
                  inquirer.prompt({
                     type: 'list',
                     name: 'option',
                     message: 'You have missed an input. What would you like to do?',
                     choices: ['Continue Shopping.', 'Exit Programm.']
                  }).then(function(user){
                     if(user.option === 'Continue Shopping.'){
                        buyProduct(connection);
                     }
                     else if(user.option === 'Exit Programm.'){
                        disconnect(connection);
                     }
                  })
               }
            }
         }
      });
   });
}
//    * The second message should ask how many units of the product they would like to buy.

// 7. Once the customer has placed the order, your application should check if your store has enough of the product to meet the customer's request.

//    * If not, the app should log a phrase like `Insufficient quantity!`, and then prevent the order from going through.

// 8. However, if your store _does_ have enough of the product, you should fulfill the customer's order.
//    * This means updating the SQL database to reflect the remaining quantity.
//    * Once the update goes through, show the customer the total cost of their purchase.





//function to end database connection
function disconnect(connection){
   print('\n***** THANKS FOR SHOPPING WITH US! *****\n');
   connection.end();
}
//function to console.log // easier to type that's all
function print(object){
   console.log(object);
}