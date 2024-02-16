<?php
// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve form data
    $itemName = $_POST["itemName"];
    $price = $_POST["price"];
    $image = "image.jpg"; // Hardcoded image URL

    // Validate and sanitize input (you should implement more robust validation)
    $itemName = htmlspecialchars($itemName);
    $price = floatval($price);
    // No need to sanitize image URL as it's hardcoded

    // Insert data into the database (assuming you have a database connection)
    $servername = "localhost";
    $username = "pas";
    $password = "password";
    $dbname = "hotel_billing_db";

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Prepare SQL statement to insert menu item
    $sql = "INSERT INTO menu (item_name, price, image) VALUES ('$itemName', $price, '$image')";

    if ($conn->query($sql) === TRUE) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    // Close connection
    $conn->close();
}
?>
