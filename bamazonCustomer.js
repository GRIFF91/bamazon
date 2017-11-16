var mysql = require("mysql");
var inquirer = require("inquirer");
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
  console.log("Welcome to Bamazon!");
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

	// purchase();

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
          type: "list",
          choices: function() {
            var choiceArray = [];
            for (var i = 0; i < results.length; i++) {
              choiceArray.push("ID: " + results[i].item_id + " | " + results[i].product_name);
            }
            return choiceArray;
          },
          message: "What Would you like to buy?"
        },
        {
          name: "amount",
          type: "input",
          message: "How many would you like to buy?"
        }
      ])
      .then(function(answer) {
        // get the information of the chosen item
        var chosenItem;
        for (var i = 0; i < results.length; i++) {
          if (results[i].product_name === answer.choice) {
            chosenItem = results[i];
          		}
        	}
		});
  });
}
