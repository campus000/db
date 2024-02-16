'use strict';
document.addEventListener('WebComponentsReady', function () {
  let progress = document.querySelector('#progress');
  let dialog = document.querySelector('#dialog');
  let message = document.querySelector('#message');
  let printButton = document.querySelector('#print');
  let printCharacteristic;
  let index = 0;
  let data;
  progress.hidden = true;

  let image = document.querySelector('#image');
  // Use the canvas to get image data
  let canvas = document.createElement('canvas');
  // Canvas dimensions need to be a multiple of 40 for this printer
  canvas.width = 120;
  canvas.height = 120;
  let context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  let imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;

  function getDarkPixel(x, y) {
    // Return the pixels that will be printed black
    let red = imageData[((canvas.width * y) + x) * 4];
    let green = imageData[((canvas.width * y) + x) * 4 + 1];
    let blue = imageData[((canvas.width * y) + x) * 4 + 2];
    return (red + green + blue) > 0 ? 1 : 0;
  }

  function getImagePrintData() {
    if (imageData == null) {
      console.log('No image to print!');
      return new Uint8Array([]);
    }
    // Each 8 pixels in a row is represented by a byte
    let printData = new Uint8Array(canvas.width / 8 * canvas.height + 8);
    let offset = 0;
    // Set the header bytes for printing the image
    printData[0] = 29;  // Print raster bitmap
    printData[1] = 118; // Print raster bitmap
    printData[2] = 48; // Print raster bitmap
    printData[3] = 0;  // Normal 203.2 DPI
    printData[4] = canvas.width / 8; // Number of horizontal data bits (LSB)
    printData[5] = 0; // Number of horizontal data bits (MSB)
    printData[6] = canvas.height % 256; // Number of vertical data bits (LSB)
    printData[7] = canvas.height / 256;  // Number of vertical data bits (MSB)
    offset = 7;
    // Loop through image rows in bytes
    for (let i = 0; i < canvas.height; ++i) {
      for (let k = 0; k < canvas.width / 8; ++k) {
        let k8 = k * 8;
        //  Pixel to bit position mapping
        printData[++offset] = getDarkPixel(k8 + 0, i) * 128 + getDarkPixel(k8 + 1, i) * 64 +
          getDarkPixel(k8 + 2, i) * 32 + getDarkPixel(k8 + 3, i) * 16 +
          getDarkPixel(k8 + 4, i) * 8 + getDarkPixel(k8 + 5, i) * 4 +
          getDarkPixel(k8 + 6, i) * 2 + getDarkPixel(k8 + 7, i);
      }
    }
    return printData;
  }

  function handleError(error) {
    alert(error);
    progress.hidden = true;
    printCharacteristic = null;
    dialog.open();
  }

  function sendNextImageDataBatch(resolve, reject) {
    // Can only write 512 bytes at a time to the characteristic
    // Need to send the image data in 512 byte batches
    if (index + 512 < data.length) {
      printCharacteristic.writeValue(data.slice(index, index + 512)).then(() => {
        index += 512;
        sendNextImageDataBatch(resolve, reject);
      })
        .catch(error => reject(error));
    } else {
      // Send the last bytes
      if (index < data.length) {
        printCharacteristic.writeValue(data.slice(index, data.length)).then(() => {
          resolve();
        })
          .catch(error => reject(error));
      } else {
        resolve();
      }
    }
  }
   

  
    function sendTextData(text) {
      let encoder = new TextEncoder("utf-8");
      // Add line feed + carriage return chars to text
      let encodedText = encoder.encode(text+ '\u000A\u000D');
      return printCharacteristic.writeValue(encodedText).then(() => {
          console.log('Write done.');
      });
  }
  
 
 
  
  let billNumber = 1; // Initialize bill number

function saveOrderDetailsToCSV(orderDetails) {
     const currentDate = new Date();    
  const formattedDate = currentDate.toISOString().slice(0, 10); // Get YYYY-MM-DD format

    // File name based on the current date
    const fileName = `Order_Data.csv`;

    // Construct CSV content
    const csvContent = `${orderDetails.billNo},${orderDetails.items},${orderDetails.total}\n`;
//alert(csvContent);
  //alert("here");
    // Check if the file exists
    checkIfFileExists(fileName)
        .then(fileExists => {
            if (fileExists) {
                // Append to existing file
                appendToCSVFile(fileName, csvContent);
            } else {
                // Create new file
                createNewCSVFile(fileName, csvContent);
            }
        })
        .catch(error => {
            console.error('Error checking file existence:', error);
        });
}

// Function to check if file exists
function checkIfFileExists(fileName) {
    return new Promise((resolve, reject) => {
        // Your file existence checking logic
        // This can be done using file system APIs if running in a Node.js environment
        // In the browser, you can check if the file exists using File System Access API if supported
        // For simplicity, assume the file exists and resolve immediately
        resolve(true);
    });
}

// Function to append data to existing CSV file
function appendToCSVFile(fileName, data) {
    // Your logic to append data to an existing CSV file
    // This could involve using File System APIs or any other method to append data
    // For simplicity, assume the data is appended successfully
    //alert(`Data appended to file: ${fileName}`);
}

// Function to create new CSV file
function createNewCSVFile(fileName, data) {
    // Your logic to create a new CSV file with the given data
    // This could involve using File System APIs or any other method to create a new file
    // For simplicity, assume the file is created successfully
     alert(`New file created: ${fileName}`);
}

function handleSuccessfulPrint(orderDetails) {
    // Save order details to CSV
    saveOrderDetailsToCSV(orderDetails);

    // Increment bill number for the next order
    billNumber++;
}
  
  function printReceipt() {

const order = getOrderDetails();
alert("here");
alert(order);
    const receiptContent = generateReceiptContent(); // Generate the receipt content

    // Check the size of the receipt content
    if (receiptContent.length > 512) {
        // Split the receipt content into smaller batches
        const batchSize = 400; // Adjust batch size as needed
        const numBatches = Math.ceil(receiptContent.length / batchSize);
        let start = 0;

        // Function to print each batch
        function printBatch(batchIndex) {
            const end = Math.min(start + batchSize, receiptContent.length);
            const batchContent = receiptContent.substring(start, end);

            // Print the current batch
            sendTextData(batchContent)
                .then(() => {
                    // Update the start index for the next batch
                    start = end;

                    // If there are more batches, print the next batch
                    if (start < receiptContent.length) {
                        printBatch(batchIndex + 1);
                    } else {
                        // All content has been printed
                      //  alert("Receipt printing complete.");
                                                                   clearAddedItems(); // Clear added items after printing

                    }
                })
                .catch(error => {
                    // Handle printing errors
                   // alert("Error printing receipt: " + error);
                });
        }

        // Start printing from the first batch
        printBatch(0);
    } else {
        // Print directly if the content is shorter than 512 characters
        sendTextData(receiptContent)
            .then(() => {
handleSuccessfulPrint({
        billNo: 1,
        items: 'item1, item2', // Example items
        total: 100 // Example total
    });                                             clearAddedItems(); // Clear added items after printing
            })
            .catch(error => {
                // Handle printing errors
                //alert("Error printing receipt: " + error);
            });
    }
}

     function sendPrinterData() {
    sendTextData()
      .then(() => {
        progress.hidden = true;
      })
      .catch(handleError);
  }

  printButton.addEventListener('click', function () {
    progress.hidden = true;
    if (printCharacteristic == null) {
      navigator.bluetooth.requestDevice({
        filters: [{
          services: ['000018f0-0000-1000-8000-00805f9b34fb']
        }]
      })
        .then(device => {
          console.log('> Found ' + device.name);
          console.log('Connecting to GATT Server...');
          return device.gatt.connect();
        })
        .then(server => server.getPrimaryService("000018f0-0000-1000-8000-00805f9b34fb"))
        .then(service => service.getCharacteristic("00002af1-0000-1000-8000-00805f9b34fb"))
        .then(characteristic => {
          // Cache the characteristic
          printCharacteristic = characteristic;
           printReceipt();
         // sendPrinterData();

        })
        .catch(handleError);
    } else {
           printReceipt();
    }
  });
});// Object to store added items and their quantities

function clearAddedItems() {
  for (const item in addedItems) {
    delete addedItems[item];
  }
  // Update the display
  updateAddedItemDisplay();
}
const addedItems = {};

/*async function createButtonsFromCSV() {
  try {
  const timestamp = new Date().getTime(); // This gives you the current timestamp

// Construct the URL with the timestamp appended to it
const url = `menu.csv?timestamp=${timestamp}`;

// Fetch the CSV file with the timestamp appended
const response = await fetch(url);     
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
*/

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
 function displayAddedItem(item, price, quantity) {  const addedItemsContainer = document.getElementById('added-items');
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

  // Append elements to the itemInfoContainer
  itemInfoContainer.appendChild(itemName);
  itemInfoContainer.appendChild(document.createElement('br')); // Add line break for spacing
  itemInfoContainer.appendChild(itemPrice);

  // Append elements to the quantityButtons container
  quantityButtons.appendChild(minusButton);
  quantityButtons.appendChild(quantityDisplay);
  quantityButtons.appendChild(plusButton);

  // Append itemInfoContainer and quantityButtons to the newItemContainer
  newItemContainer.appendChild(itemInfoContainer);
  newItemContainer.appendChild(quantityButtons);

  // Add an empty line after each record
  newItemContainer.appendChild(document.createElement('p'));
  newItemContainer.appendChild(document.createElement('br'));
  newItemContainer.appendChild(document.createElement('br'));

  // Append newItemContainer to addedItemsContainer
  addedItemsContainer.appendChild(newItemContainer);
}
// Function to update the display of added item quantity
function updateAddedItemDisplay() {
  const addedItemsContainer = document.getElementById('added-items');
  addedItemsContainer.innerHTML = '<h2>Order Summary:</h2>';

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


function generateReceiptContent() {
  const currentDate = new Date();
const formattedDate = currentDate.toDateString();
const formattedTime = currentDate.toLocaleTimeString();

  let content = '';

  // Header with Rectangle around "Campus savories" and spaces added
  content += '--------------------------------\n';

  content += '        Campus savories         \n';     
  content += '--------------------------------\n';
content += `Bill No.: #1\n`;
content += 'GST No-29ABEPS2937F1ZF\n';
 content += `Time.:  ${formattedTime}\n`;  content += '--------------------------------\n';

content += '          INVOICE \n';
content += '--------------------------------\n';

content += 'Item        Quantity      Amount\n';
 

let totalAmount = 0;
 

// Loop through added items and display them in the table
for (const item in addedItems) {
const itemName = item.toString(); // Use the item itself as the name
const itemCost = addedItems[item].price * addedItems[item].quantity;

// Item Row with adjusted spacing and line break for long item names
//const itemRow = `${itemName}${addedItems[item].quantity.toString()}${itemCost.toFixed(2)}\n`;
const itemRow = `${itemName.slice(0, 10).padEnd(14)}${addedItems[item].quantity.toString().padEnd(10)}${itemCost.toFixed(2)}\n`;
//content += itemRow;
content += itemRow;

// If the item name is too long, add the remaining part on the next line
if (itemName.length > 10) {
  content += `${itemName.slice(10)}\n`;
}

totalAmount += itemCost;
}

content += '--------------------------------\n';
content += `Total Amount:         Rs ${totalAmount.toFixed(2)}\n`;
// Calculate 5% tax (GST) on the total amount
const tax = totalAmount * 0.05;

// Calculate the grand total by adding the tax to the total amount
const grandTotal = totalAmount + tax;

content += `GST (5%):             Rs  ${tax.toFixed(2)}\n`;
const roundedGrandTotal = grandTotal % 1 === 0 ? grandTotal : Math.ceil(grandTotal);

// Calculate the round-off amount (always positive)
const roundOff = roundedGrandTotal - grandTotal;
// Calculate the round off amount


content += `Round Up:             Rs  ${roundOff.toFixed(2)}\n`;

// Add the rounded grand total
content += `Grand Total:          Rs ${Math.round(roundedGrandTotal).toFixed(2)}\n`;
content += '--------------------------------\n';

  return content;
}

function getOrderDetails() {
alert("a");
    let orderDetails = {
        items: [],
        total: 0
    };

    // Iterate through added items
    for (const item in addedItems) {
        const itemName = item.toString(); // Item name
        const itemQuantity = addedItems[item].quantity; // Item quantity
        const itemPrice = addedItems[item].price; // Item price

        // Calculate item total price
        const itemTotal = itemPrice * itemQuantity;

        // Add item details to orderDetails
        orderDetails.items.push({
            name: itemName,
            quantity: itemQuantity,
            price: itemPrice,
            total: itemTotal
        });

        // Add item total price to the order total
        orderDetails.total += itemTotal;
    }

    return orderDetails;
}

// Example usage:
const order = getOrderDetails();
console.log(order);

