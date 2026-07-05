 <?php
    session_start();
    $msg = "Enter your names below: ";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lab01_Kamal</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.7.1.js"></script>
    <script src="code.js"></script> 
</head>
<body>
    <header>
        CMPE2550 - Lab01 - Othello
    </header>

    <div id="mainContainer">

        <div id="formContainer">
            <form action="index.php" method="POST">
            <div id="userInp">  
                <label id="msg_label"> 
                    <?php echo $msg ?>
                </label>
                <input type="text" name="ply1" id="p1" placeholder="Player one name here!">
                <input type="text" name="ply2" id="p2" placeholder="Player two name here!">
                <button id="newGameBtn" type="button">New Game</button>
                <button id="quitGame" type="button">Quit Game</button>
            </div>
            </form>
        </div>
        <hr>
        <div id="BoxContainer">
            
        </div>
    </div>

    <footer>
        <h3>&copy; 2025</h3>
    </footer>
</body>
</html>