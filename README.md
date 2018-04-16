
This is a Amazon-like storefront with the MySQL skills. The app will take in orders from customers and delete stock from the store's inventory.The app tracks product sales across store's departments and then provide a summary of the highest-grossing departments in the store.
 
1. Create MySQL Database `bamazon`.

2. Create Table `products`.

3. Products table has:

   * item_id (unique id for each product)

   * product_name (Name of product)

   * department_name

   * price (cost to customer)

   * stock_quantity (how much of the product is available in stores)

4. Create a Node application called `bamazonCustomer.js`. Running this application will first display all of the items available for sale. Include the ids, names, and prices of products for sale.

5. The app prompts users with two messages.

   * ID of the product they would like to buy.
   * How many units of the product they would like to buy.

6. Once the customer has placed the order, the application checks if your store has enough of the product to meet the customer's request.

   * If not, the app logs a phrase like `Insufficient quantity!`, and then prevent the order from going through.

7. However, if the store _does_ have enough of the product, you should fulfill the customer's order.
   * This means updating the SQL database to reflect the remaining quantity.
   * Once the update goes through, show the customer the total cost of their purchase.

- - -

* Create an application `bamazonManager.js`.

  * List a set of menu options:

    * View Products for Sale
    
    * View Low Inventory
    
    * Add to Inventory
    
    * Add New Product

  * If manager selects `View Products for Sale`, the app shows list every available item: the item IDs, names, prices, and quantities.

  * If a manager selects `View Low Inventory`, then it shows list all items with an inventory count lower than five.

  * If a manager selects `Add to Inventory`, the app display a prompt that will let the manager "add more" of any item currently in the store.

  * If a manager selects `Add New Product`, it allow the manager to add a completely new product to the store.

- - -

1. Create MySQL table `departments`.

   * department_id

   * department_name

   * over_head_costs (A dummy number you set for each department)

2. Modify products table so that there's a product_sales column and modify the `bamazonCustomer.js` app so that this value is updated with each individual products total revenue from each sale.

3. Modify your `bamazonCustomer.js` app so that when a customer purchases anything from the store, the price of the product multiplied by the quantity purchased is added to the product's product_sales column.

4. Create `bamazonSupervisor.js`.

   * View Product Sales by Department
   
   * Create New Department

5. When a supervisor selects `View Product Sales by Department`, the app display a summarized table. 

6. The `total_profit` column should be calculated on the fly using the difference between `over_head_costs` and `product_sales`. `total_profit` should not be stored in any database.


https://drive.google.com/drive/folders/1SK-rdgzIK9UsoffCDrA7f40dzwVm9D7L
