var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require("colors");
var Table = require("cli-table");

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "fourfour2",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  console.log("                           ".bgGreen.white);
  console.log("    Welcome to Bamazon!    ".bgGreen.white);
  console.log("                           ".bgGreen.white);
  tableView();
  buy();
});

// function that displays table
function tableView() {
	connection.query("SELECT item_id, product_name, department_name, price, stock_quantity FROM products", function(err, results) {
    if (err) throw err;

// table 
	var table = new Table({
    	head: ['ID#', 'Item Name', 'Department', 'Price($)', 'Quantity Available'],
  	    colWidths: [10, 20, 20, 20, 20],
  	    style: {
			           head: ['cyan'],
			           compact: false,
			           colAligns: ['center'],
		           }
	});
//Loop through the data
	for(var i = 0; i < results.length; i++){
		table.push(
			[results[i].item_id, results[i].product_name, results[i].department_name, results[i].price, results[i].stock_quantity]
		);
	}
	console.log(table.toString());

  });
}

// function to start a purchase
function buy() {
  // query the database for all items
  connection.query("SELECT * FROM products", function(err, results) {
    if (err) throw err;
    // once you have the items, prompt the user for which they'd like to buy
    inquirer
      .prompt([
        {
          name: "choice",
          type: "input",
          message: "Please input the ID# of the product you want to buy?".bgGreen.white
        },
        {
          name: "amount",
          type: "input",
          message: "How many would you like to buy?".bgGreen.white
        }
      ])
      .then(function(input) {
        // get the information of the chosen item
        var item = input.choice;
        var quantity = input.amount;

        // Query db to confirm that the given item ID exists in the desired quantity
        var queryStr = 'SELECT * FROM products WHERE ?';

        connection.query(queryStr, {item_id: item}, function(err, data) {
          if (err) throw err;

          // If the user has selected an invalid item ID, data attay will be empty

          if (data.length === 0) {
            console.log('ERROR: Invalid Item ID. Please select a valid Item ID.'.bgCyan.white);
            buy();
            }
           
           else {
            var productData = data[0];

            // If the quantity requested by the user is in stock
            if (quantity <= productData.stock_quantity) {
              console.log('                                                                            '.bgGreen.white);
              console.log('   Congratulations, the product you requested is in stock! Placing order!   '.bgGreen.white);
              console.log('                                                                            '.bgGreen.white);
            // Construct the updating query string
            var updateQueryStr = 'UPDATE products SET stock_quantity = ' + (productData.stock_quantity - quantity) + ' WHERE item_id = ' + item;
            // console.log('updateQueryStr = ' + updateQueryStr);

            // Update the inventory
            connection.query(updateQueryStr, function(err, data) {
              if (err) throw err;
              console.log('\n   Your total is: $' + productData.price * quantity);
              console.log('                ');
              console.log("                                       ".bgMagenta.white)
              console.log("   Thanks for shopping with Bamazon.   ".bgMagenta.white)
              console.log("                                       ".bgMagenta.white)
              // End the database connection
              connection.end();
            })
        } 

        else {
          console.log('                                  '.bgRed.white);
          console.log('   That item is out of stock :(   '.bgRed.white);
          console.log('                                  '.bgRed.white);
          console.log('                                           '.bgGreen.white);
          console.log('   Would you like to buy something else?   '.bgGreen.white);
          console.log('                                           '.bgGreen.white);
          buy();
        }
      }
    })
  })
		
 });
}
