<?php
session_start();

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] == "POST") {

    // Handle different actions based on the `action` parameter
    if (isset($_POST['action'])) {
        $action = $_POST['action'];

        // Start a new game
        if ($action == 'newGame') {
            // Initialize board (8x8 2D array)
            $board = array_fill(0, 8, array_fill(0, 8, 0));
        
            // Set initial positions
            $board[3][3] = 2; // Brown stone
            $board[3][4] = 1; // Tan stone
            $board[4][3] = 1; // Tan stone
            $board[4][4] = 2; // Brown stone
        
            // Store player names
            $player1 = $_POST['player1'];
            $player2 = $_POST['player2'];
        
            // Save data to session
            $_SESSION['gameData'] = json_encode([
                'board' => $board,
                'player1' => $player1,
                'player2' => $player2,
                'currentPlayer' => 1 , // Player 1 starts
                'currentPlayerName' => $player1
            ]);
        
            // Send response to client
            echo json_encode([
                'success' => "true",
                'board' => $board,
                'gameData' => $_SESSION['gameData'],
                'message' => "Game started! $player1 goes first with TAN"
            ]);
            exit;
        }

        if ($_POST['action'] == 'cellData') {
            // Decode the session-stored game data
            $gameData = json_decode($_SESSION['gameData'], true);
        
            $board = $gameData['board'];
            $currentPlayer = $gameData['currentPlayer'];
            $_SESSION['currentPlayerName'] = $gameData['currentPlayerName'];
        
            $row = $_POST['row'];
            $col = $_POST['col'];
        
            // Validate the move
            if ($board[$row][$col] !== 0) {
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid move: Cell is not empty.'
                ]);
                exit;
            }

            // **Check if the game is over AFTER making a move**
            // Place the stone and flip the opponent's stones
            $isValidMove = placeStoneAndFlipRecursive($board, $row, $col, $currentPlayer);
        
            if (!$isValidMove) {
                $gameOver = checkGameOver($board);
                if ($gameOver) {
                    echo json_encode([
                        'success' => true,
                        'board' => $board,
                        'message' => $gameOver['message'],
                        'winner' => $gameOver['winner']
                    ]);
                    exit;
                }
                echo json_encode([
                    'success' => false,
                    'message' => 'Invalid move: No stones flipped.'
                ]);
                exit;
            }   

            // Check if the board is full
            $isBoardFull = true;
            foreach ($board as $row) {
                if (in_array(0, $row)) {
                    $isBoardFull = false;
                    break;
                }
            }

            // If the board is full, determine the winner
            if ($isBoardFull) {
                $gameOver = determineWinner($board);
                echo json_encode([
                    'success' => true,
                    'board' => $board,
                    'message' => $gameOver['message'],
                    'winner' => $gameOver['winner']
                ]);
                exit;
            }
        
            // Update current player
            $gameData['currentPlayer'] = $currentPlayer == 1 ? 2 : 1;
        
            if ($gameData['currentPlayer'] == 1) {
                $_SESSION['currentPlayerName'] = $gameData['player1'];
                $_SESSION['color'] = 'TAN';
            } else {
                $_SESSION['currentPlayerName'] = $gameData['player2'];
                $_SESSION['color'] = 'BROWN';
            }
        
            // Save updated game state back to session
            $gameData['board'] = $board;
            $_SESSION['gameData'] = json_encode($gameData);
        
            $gameData['currentPlayerName'] = $_SESSION['currentPlayerName'];
        
            // Send updated board to client
            echo json_encode([
                'success' => true,
                'board' => $board,
                'gameData' => $_SESSION['gameData'],
                'color' => $_SESSION['color'],
                'message' => 'Move successful. ' . $_SESSION['currentPlayerName'] . "'s turn with " . $_SESSION['color']
            ]);
            exit;
        }
        

        else if($action == "quitGame")
        {
            $_SESSION['board'] = array_fill(0, 8, array_fill(0, 8, null));

            // Delete all session variables
            session_unset();

            // Destroy the session
            session_destroy();

            echo json_encode([
                "status" => "success",
                "message" => "Game has been quit successfully!",
                "board" => $_SESSION['board']
            ]);
            exit;
        }
    }
}


// Function to place a stone and flip the opponent's stones recursively
function placeStoneAndFlipRecursive(&$board, $row, $col, $player) {
    $directions = [
        [-1, -1], [-1, 0], [-1, 1], // Upper-left, up, upper-right
        [0, -1],          [0, 1],    // Left, right
        [1, -1], [1, 0], [1, 1]     // Lower-left, down, lower-right
    ];

    $isValid = false;

    // Loop through each direction (there are 8 possible directions around the placed stone)
    foreach ($directions as [$dx, $dy]) {
        // If stones can be flipped in this direction, mark the move as valid
        if (flipInDirection($board, $row, $col, $dx, $dy, $player)) {
            $isValid = true;
        }
    }

    // If at least one direction is valid, place the stone at the chosen cell
    if ($isValid) {
        $board[$row][$col] = $player;
    }

    return $isValid;
}

// Recursive function to check and flip stones in one direction
function flipInDirection(&$board, $row, $col, $dx, $dy, $player, $flips = []) {
    // Move to the next cell in the direction (dx, dy)
    $row += $dx;
    $col += $dy;

    // If the new cell is out of bounds or empty, return false
    if ($row < 0 || $row >= 8 || $col < 0 || $col >= 8 || $board[$row][$col] == 0) {
        return false;
    }

    // Determine the opponent's stone type
    $opponent = $player == 1 ? 2 : 1;

    // If the opponent's stone is found, continue checking further in the same direction
    if ($board[$row][$col] == $opponent) {
        $flips[] = [$row, $col]; // Add the cell to the list of flipped stones
        // Recurse further down the same direction
        return flipInDirection($board, $row, $col, $dx, $dy, $player, $flips);
    }

    // If a player's stone is found, all the previously flipped opponent's stones can be flipped back to the current player
    if ($board[$row][$col] == $player) {
        // Flip all opponent's stones found in this direction
        foreach ($flips as [$fx, $fy]) {
            $board[$fx][$fy] = $player;
        }
        return !empty($flips); // Return true if stones were flipped
    }

    return false; // If no valid move is found, return false
}

// Function to check if the player has any valid moves
function hasValidMove($board, $player) {
    error_log("Checking valid moves for Player: " . $player);
    for ($r = 0; $r < 8; $r++) {
        for ($c = 0; $c < 8; $c++) {
            // Check if the cell is empty
            if ($board[$r][$c] == 0) {
                // Make a temporary copy of the board to test the move
                $tempBoard = array_map(fn($row) => array_values($row), $board);
                // Try placing a stone and flipping opponent's stones recursively
                if (placeStoneAndFlipRecursive($tempBoard, $r, $c, $player)) {
                    error_log("Player $player has a valid move at ($r, $c)");
                    return true; // A valid move was found
                }
            }
        }
    }
    error_log("No valid move found for Player: " . $player);
    return false; // No valid move found for the player
}


// Function to count stones and determine winner
function determineWinner($board) {
    $player1Count = 0;
    $player2Count = 0;

    foreach ($board as $row) {
        foreach ($row as $cell) {
            if ($cell == 1) {
                $player1Count++;
            } elseif ($cell == 2) {
                $player2Count++;
            }
        }
    }

    // Return the winner based on the stone count
    if ($player1Count > $player2Count) {
        return ['winner' => 1, 'message' => $_SESSION['currentPlayerName']."  (TAN) wins!"];
    } elseif ($player2Count > $player1Count) {
        return ['winner' => 2, 'message' => $_SESSION['currentPlayerName']. " (BROWN) wins!"];
    } else {
        return ['winner' => 0, 'message' => "It's a draw!"];
    }
}

// Function to check if the game should end
function checkGameOver($board) {
    // If neither player has a valid move, the game is over
    if (!hasValidMove($board, 1) || !hasValidMove($board, 2)) {
        error_log("not Valid");
        return determineWinner($board); // Determine the winner
    }
    return null; // Game is not over
}
?>
