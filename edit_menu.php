<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit and Submit CSV File</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        .container {
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
        textarea {
            width: 100%;
            height: 200px;
            padding: 10px;
            margin-bottom: 10px;
        }
        button {
            padding: 10px 20px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Edit CSV File</h2>
        <textarea id="csvContent" placeholder="Paste your CSV content here..."></textarea>
        <button onclick="submitCSV()">Submit</button>
        <p id="message"></p>
    </div>

    <script>
        window.onload = function() {
            // Load CSV content from menu.csv file
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    document.getElementById("csvContent").value = xhr.responseText;
                }
            };
            xhr.open("GET", "menu.csv", true);
            xhr.send();
        };

        function submitCSV() {
            var csvContent = document.getElementById("csvContent").value;
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "update_csv.php", true);
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4 && xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        document.getElementById("message").innerText = "CSV file updated successfully!";
                    } else {
                        document.getElementById("message").innerText = "Failed to update CSV file.";
                    }
                }
            };
            xhr.send(JSON.stringify({ content: csvContent }));
        }
    </script>
</body>
</html>
