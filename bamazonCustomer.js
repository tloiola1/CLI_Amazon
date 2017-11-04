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
   menu_options(connection);
}

function menu_options(connection){
   cl('\n');
   inquirer.prompt({
      type: 'list',
      name: 'option',
      message: coloring.green('****** MENU OPTIONS *****'),
      choices: ['View Products for Sale', 'Buy Product', 'View Your Cart', 'Exit']
   }).then(function(answer){
      switch(answer.option){
         case 'View Products for Sale':
            viewProducts(connection);
            break;
         case 'Buy Product':
            buyProduct(connection);
            break;
         case 'View Your Cart':
            viewCart(connection);
            break;
         case 'Exit':
            disconnect(connection);
            break;
      }

   });
}

function viewProducts(connection){ 
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
      menu_options(connection);
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
      message: 'To Make A Purchase Enter Product ID#.',
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
            menu_options(connection);
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
               menu_options(connection);
               return true;
            }
            //condition pass if quantity is stock is available
            else{
               //this conditition olny executes if id of product or quantity needed are valid inputs
               if(res[0].product_name !== undefined && answer.quantity > 0){
                  var product = res[0].product_name;
                  var total = res[0].price * answer.quantity;

                  fs.appendFile("cart.txt", ", " + product +', ' + answer.quantity + ', '+ total, function(err) {
                     if (err) {
                        return print(err);
                      }
                  });
                  cl('\n');
                  //newQuantity variable is = to quantity in database stock subtracted by user purchased quantity.
                  var newQuantity = res[0].stock_quantity - answer.quantity;
                  // query the database to update new quantity of the product which user has purchased
                  //setting new quantity where id = to id of the product user entered
                  connection.query('UPDATE bamazondb.products SET ? WHERE ?',
                     [
                        {
                           //update stock quantity to new quantity
                           stock_quantity: newQuantity,
                           product_sales: total
                        },
                        {
                           //query the id then insert new quantity to this id
                           id: answer.idNumber
                        }
                     ],
                     function(err, res){
                        //this condition executes only if user quantity is a valid input >= 1
                        if(answer.quantity > 0){
                           // show that changes were made in database
                           cl(coloring.green(" It Has Been Added to Your Cart!\n"));
                           menu_options(connection);
                        }
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
                        menu_options(connection);
                     }
                     //condition executes if intentional in a attempt to exit the program
                     else if(user.option === 'Exit Program.'){
                        //exit and end program
                        menu_options(connection);
                     }
                  })
               }
            }
         }
      });
   });
}
//function Cart
function viewCart(connection){
   cl(coloring.green('\n ****** YOUR CART ******'));
   //Read cart
   fs.readFile("cart.txt", "utf8", function(err, data) {
     //Throw error if not meet condition
      if (err) {
       return cl(err);
      }
      // Break the string down by comma separation and store the contents into the output_movie array.
      var cart = data.split(", ");
      var total = 0;
      for (var i = 1; i < cart.length; i++) {
         total += parseFloat(cart[i+2]);
         var myCart = ' Product Name: ' + cart[i] + ' | Quantity: ' + cart[i+1] + ' | Total: ' + cart[i+2];

         cl(myCart);
         cl(coloring.green('-------------------------------------------------------------------------------------'));

         i +=2;
      }
      if(total === 0){
         cl('Your Cart is Empty. Let`s Shopping!!');
         menu_options(connection);
         return;
      }
      cl(' You Pay: '+ total);
      menu_options(connection);
   }); 
}
//function to end database connection and exit program
function disconnect(connection){
   fs.writeFile('cart.txt', '', function(){
      cl('\n***** THANKS FOR SHOPPING WITH US! *****\n');
      connection.end();
   });
}
//function to console.log // easier to type that's all
//as a java developer I used to use pl short for println and p short for print
//now as a javascript developer I use cl short for console.log as I dont know all the shortcuts for javascript texteditor
function cl(object){
   console.log(object);
}