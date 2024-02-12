// Object to store added items and their quantities
const addedItems = {};

// Function to read CSV file and create clickable buttons
/*async function createButtonsFromCSV() {
    try {
        const response = await fetch('menu.csv');
        const csvData = await response.text();

        // Parse CSV data
        const rows = csvData.split('\n');
        const headers = rows[0].split(',');

        // Extract item data from CSV
        const items = rows.slice(1).map(row => {
            const values = row.split(',');
            const item = {};

            headers.forEach((header, index) => {
                const trimmedHeader = header.trim();
                const trimmedValue = values[index] !== undefined ? values[index].trim() : '';

                if (trimmedValue !== '') {
                    item[trimmedHeader] = trimmedValue;
                } else {
                    console.error(`Value for header '${trimmedHeader}' is missing in row: ${row}`);
                }
            });

            return item;
        });

        // Create buttons
        createButtons(items);
    } catch (error) {
        console.error('Error reading CSV file:', error);
    }
}
*/
async function createButtonsFromCSV() {
    try {
        const response = await fetch('menu.csv');
        const csvData = await response.text();

        // Parse CSV data
        const rows = csvData.split('\n');
        const headers = rows[0].split(',');

        // Extract item data from CSV
        const items = rows
            .filter(row => row.trim() !== '') // Filter out empty lines
            .slice(1)
            .map(row => {
                const values = row.split(',');
                const item = {};

                headers.forEach((header, index) => {
                    const trimmedHeader = header.trim();
                    const trimmedValue = values[index] !== undefined ? values[index].trim() : '';

                    if (trimmedValue !== '') {
                        item[trimmedHeader] = trimmedValue;
                    } else {
                        console.error(`Value for header '${trimmedHeader}' is missing in row: ${row}`);
                    }
                });

                console.log('Parsed item:', item); // Add this line for debugging

                return item;
            });

        console.log('All items:', items); // Add this line for debugging

        // Create buttons
        createButtons(items);
    } catch (error) {
        console.error('Error reading CSV file:', error);
    }
}


// Function to create clickable buttons
function createButtons(data) {
    var buttonContainer = document.getElementById('button-container');

    data.forEach(function (item, index) {
        var button = document.createElement('button');
        button.innerHTML = `${item.Item} - Rs${item.Price}`;
        button.className = 'button';
        button.id = `button-${index + 1}`;
        button.addEventListener('click', function () {
            addItem(item.Item, item.Price);
        });

        buttonContainer.appendChild(button);
    });
}

// Function to add item to the "Added Items" partition
function addItem(item, price) {
    const addedItemsContainer = document.getElementById('added-items');

    // Check if the item is already added
    if (addedItems[item]) {
        // Increment quantity if the item is already in the list
        addedItems[item].quantity += 1;
    } else {
        // Add the item to the list with quantity 1
        addedItems[item] = { price: price, quantity: 1 };
    }

    // Update the display and summary
    updateAddedItemDisplay();
    updateSummary();
}

// Function to display added item in the "Added Items" partition
function displayAddedItem(item, price, quantity) {
    const addedItemsContainer = document.getElementById('added-items');
    const newItemContainer = document.createElement('div');
    newItemContainer.className = 'added-item';

    const itemInfoContainer = document.createElement('div');
    itemInfoContainer.className = 'item-info';

    const itemName = document.createElement('span');
    itemName.className = 'item-name';
    itemName.textContent = item;

    const itemPrice = document.createElement('span');
    itemPrice.className = 'item-price';
    itemPrice.textContent = `Rs${price * quantity}`;
    itemPrice.style.marginLeft = '10px'; // Adjust the value as needed
    
        itemPrice.style.marginRight = '100px'; // Adjust the value as needed
    
    
    const quantityButtons = document.createElement('div');
    quantityButtons.className = 'quantity-buttons';
const minusButton = document.createElement('span');
    minusButton.className = 'quantity-button';
    minusButton.innerHTML = '-';
    minusButton.addEventListener('click', function () {
        if (addedItems[item].quantity > 1) {
            addedItems[item].quantity -= 1;
            updateAddedItemDisplay();
            updateSummary();
        } else {
            // If quantity is 0, remove the item
            delete addedItems[item];
            updateAddedItemDisplay();
            updateSummary();
        }
    });


   
    const quantityDisplay = document.createElement('span');
    quantityDisplay.className = 'quantity';
    quantityDisplay.textContent = quantity;

     const plusButton = document.createElement('span');
    plusButton.className = 'quantity-button';
    plusButton.innerHTML = '+';
    plusButton.addEventListener('click', function () {
        addedItems[item].quantity += 1;
        updateAddedItemDisplay();
        updateSummary();
    });

    itemInfoContainer.appendChild(itemName);
        itemInfoContainer.appendChild(document.createTextNode(' ')); // Add a space12
    itemInfoContainer.appendChild(itemPrice);

    quantityButtons.appendChild(plusButton);
    quantityButtons.appendChild(quantityDisplay);
    quantityButtons.appendChild(minusButton);

    newItemContainer.appendChild(itemInfoContainer);
    newItemContainer.appendChild(quantityButtons);

    addedItemsContainer.appendChild(newItemContainer);
}
// Function to update the display of added item quantity
function updateAddedItemDisplay() {
    const addedItemsContainer = document.getElementById('added-items');
    addedItemsContainer.innerHTML = '<h2>Added Items:</h2>';

    // Iterate through added items and display them
    for (const item in addedItems) {
        displayAddedItem(item, addedItems[item].price, addedItems[item].quantity);
    }
}

// Function to update the summary
function updateSummary() {
    const summaryDiv = document.getElementById('summary');
    const priceSpan = document.getElementById('price');
    const taxSpan = document.getElementById('tax');
    const totalSpan = document.getElementById('total');

    // Calculate the total price, tax, and overall total
    let totalPrice = 0;

    for (const item in addedItems) {
        totalPrice += addedItems[item].price * addedItems[item].quantity;
    }

    const tax = totalPrice * 0.05; // Assuming tax is 18%
    const total = totalPrice + tax;

    // Update the summary display
    priceSpan.textContent = totalPrice.toFixed(2);
    taxSpan.textContent = tax.toFixed(2);
    totalSpan.textContent = total.toFixed(2);
}
function saveOrderToDatabase(item, quantity, total) {
    fetch('server.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            item: item,
            quantity: quantity,
            total: total
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Order saved successfully.');
        } else {
            console.error('Error saving order.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}



function sendPrintRequest(receiptContent) {
 
    fetch('server.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            printData: receiptContent,
        }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Print request sent successfully.');
        } else {
            console.error('Error sending print request.');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to print the receipt
function printReceipt() {
    const receiptContent = generateReceiptContent();
 
        sendPrintRequest(receiptContent);
     
}

function generateReceiptContent() {
    const currentDate = new Date();
    const formattedDate = currentDate.toDateString();
    const formattedTime = currentDate.toLocaleTimeString();

    let content = '';

    // Header with Rectangle around "Campus savories" and spaces added
    content += '          +++++++++++++++++++++++++++++\n';
    content += '          +        Campus savories    +\n';
    content += '          +++++++++++++++++++++++++++++\n';
    content += '          GST No-29ABEPS2937F1ZF\n';
    // Bill Information
    content += 'Bill No.: #12345\n';
   // content += `Mob. No.: 9726820585\n`;
    content += `Bill Dt.: ${formattedDate} ${formattedTime}\n`;

    // Rectangle around "INVOICE" and spaces added
    content += '          +++++++++++++++++++++++++++++\n';
    content += '          +            INVOICE        +\n';
    content += '   	 +++++++++++++++++++++++++++++\n';

    // Table Header with adjusted spacing
    content += 'Item        Quantity     Amount\n';
    content += '------------------------------------------------\n';

    // Loop through added items and display them in the table
    let totalAmount = 0;

   /* for (const item in addedItems) {
        const itemCost = addedItems[item].price * addedItems[item].quantity;

        // Item Row with adjusted spacing
 
        content += `${item.padEnd(14)}${addedItems[item].quantity.toString().padEnd(14)}${itemCost.toFixed(2)}\n`;
        totalAmount += itemCost;
    }*/
    
    // Loop through added items and display them in the table
for (const item in addedItems) {
    const itemName = item.toString(); // Use the item itself as the name
    const itemCost = addedItems[item].price * addedItems[item].quantity;

    // Item Row with adjusted spacing and line break for long item names
    const itemRow = `${itemName.slice(0, 10).padEnd(14)}${addedItems[item].quantity.toString().padEnd(14)}${itemCost.toFixed(2)}\n`;
    content += itemRow;

    // If the item name is too long, add the remaining part on the next line
    if (itemName.length > 10) {
        content += `${itemName.slice(10)}\n`;
    }

    totalAmount += itemCost;
}

    

    // Footer
  content += '------------------------------------------------\n';
content += `Total Amount:              Rs ${totalAmount.toFixed(2)}\n`;

// Calculate 5% tax (GST) on the total amount
const tax = totalAmount * 0.05;

// Calculate the grand total by adding the tax to the total amount
const grandTotal = totalAmount + tax;

content += `GST (5%):                  Rs  ${tax.toFixed(2)}\n`;

const roundedGrandTotal = grandTotal % 1 === 0 ? grandTotal : Math.ceil(grandTotal);

// Calculate the round-off amount (always positive)
const roundOff = roundedGrandTotal - grandTotal;
// Calculate the round off amount
 

content += `Round Up:                  Rs  ${roundOff.toFixed(2)}\n`;

// Add the rounded grand total
content += `Grand Total:               Rs ${Math.round(roundedGrandTotal).toFixed(2)}\n`;
  content += '------------------------------------------------\n';
    content += '           Thank You! Visit Again\n';
    content += '------------------------------------------------\n';
    content += '\n';
    content += '\n';
    content += '\n';
     content += '\n';
    content += '\n';
    content += '\n';
    return content;
}
// Call the function to create buttons from CSV
createButtonsFromCSV();
