<?php
// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Check if the menu data is set
    if (isset($_POST['menu'])) {
        // Open the menu.csv file for writing
        $fp = fopen('menu.csv', 'w');
        
        // Write each menu item to the CSV file
        foreach ($_POST['menu'] as $menu_item) {
            // Write the menu item to the CSV file
            fputcsv($fp, array($menu_item));
        }
        
        // Close the CSV file
        fclose($fp);

        // Redirect back to the HTML page with a success message
        header("Location: menu_edit.php?status=success");
        exit();
    }
}

// If the form was not submitted properly, redirect with an error message
header("Location: menu_edit.php?status=error");
exit();
?>
