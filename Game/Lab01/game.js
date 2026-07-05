// ==========================
// Global Game Variables
// ==========================

let gameData =
{
    board: [],
    player1: "",
    player2: "",
    currentPlayer: 1,
    currentPlayerName: ""
};

let currentColor = "TAN";

$().ready(() => {

    // Bind onclick event for button
    $("#newGameBtn").on("click", () => {

        let player1 = $('#p1').val();
        let player2 = $('#p2').val();

        validate(player1, player2);

        console.log("newGameBtn clicked");

    });

    // Bind onclick event for button
    $("#quitGame").on("click", () => {
    quitGame(); 
    });;

    $("#BoxContainer").on("click", "input[id^='cell']", handleClick);

})

function createTable()
{
    let board = '';

    console.log("In Create Table! ")

    for(let i = 0; i < 8; i++)
    {
            for(let j = 0; j < 8; j++)
            {
                board += `<input type="button" id="cell${i}_${j}" class="cell" ></input>`;
            }
    }
    $('#BoxContainer').html(board);

}

function validate(x, y)
{
    if (x != '' && y != '')
    {
        $("#BoxContainer").show();

        newGame(x, y);   
    }
    else
    {
        $("#msg_label").text("Both names should be atleast one character.");
    }
}

function newGame(player1, player2)
{
    // Initialize board (8x8)

    let board = [];

    for(let i = 0; i < 8; i++)
    {
        board[i] = [];

        for(let j = 0; j < 8; j++)
        {
            board[i][j] = 0;
        }
    }

    // Initial stones

    board[3][3] = 2;
    board[3][4] = 1;
    board[4][3] = 1;
    board[4][4] = 2;

    // Save game data

    gameData.board = board;
    gameData.player1 = player1;
    gameData.player2 = player2;
    gameData.currentPlayer = 1;
    gameData.currentPlayerName = player1;

    currentColor = "TAN";

    $("#msg_label").text(
        "Game started! " + player1 + " goes first with TAN"
    );

    updateBoard(gameData.board);
}

function quitGame()
{
    gameData.board = [];

    gameData.player1 = "";
    gameData.player2 = "";

    gameData.currentPlayer = 1;
    gameData.currentPlayerName = "";

    $("#msg_label").text("Game has been quit successfully!");

    $("#BoxContainer").hide();
}


function cellData(row, col)
{
    let board = gameData.board;
    let currentPlayer = gameData.currentPlayer;

    // Cell already occupied

    if(!board[row] || board[row][col] !== 0)
    {
        $("#msg_label").text("Invalid move: Cell is not empty.");
        return;
    }

    // Try placing

    let isValidMove =
        placeStoneAndFlipRecursive(
            board,
            row,
            col,
            currentPlayer
        );

    if(!isValidMove)
    {
        let gameOver = checkGameOver(board);

        if(gameOver != null)
        {
            updateBoard(board);

            $("#msg_label").text(gameOver.message);

            return;
        }

        $("#msg_label").text(
            "Invalid move: No stones flipped."
        );

        return;
    }

    // Check board full

    let boardFull = true;

    outerLoop:
    for(let i=0;i<8;i++)
    {
        for(let j=0;j<8;j++)
        {
            if(board[i][j]===0)
            {
                boardFull = false;
                break outerLoop;
            }
        }
    }

    if(boardFull)
    {
        let winner =
            determineWinner(board);

        updateBoard(board);

        $("#msg_label").text(
            winner.message
        );

        return;
    }

    // Switch player

    if(currentPlayer===1)
    {
        gameData.currentPlayer = 2;
        gameData.currentPlayerName =
            gameData.player2;

        currentColor = "BROWN";
    }
    else
    {
        gameData.currentPlayer = 1;
        gameData.currentPlayerName =
            gameData.player1;

        currentColor = "TAN";
    }

    gameData.board = board;

    updateBoard(board);

    $("#msg_label").text(
        "Move successful. "
        + gameData.currentPlayerName
        + "'s turn with "
        + currentColor
    );
}

function handleClick()
{
    console.log(this.id);

    let idParts = this.id.split("_");

    let row =
        Number(
            idParts[0].replace("cell","")
        );

    let col =
        Number(idParts[1]);

    cellData(row,col);
}


function placeStoneAndFlipRecursive(board, row, col, player)
{
    let directions =
    [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
    ];

    let isValid = false;

    for(let i = 0; i < directions.length; i++)
    {
        let dx = directions[i][0];
        let dy = directions[i][1];

        if(flipInDirection(board, row, col, dx, dy, player))
        {
            isValid = true;
        }
    }

    if(isValid)
    {
        board[row][col] = player;
    }

    return isValid;
}

function flipInDirection(board, row, col, dx, dy, player, flips = [])
{
    row += dx;
    col += dy;

    // boundary or empty cell
    if(row < 0 || row >= 8 || col < 0 || col >= 8 || board[row][col] === 0)
    {
        return false;
    }

    let opponent = (player === 1) ? 2 : 1;

    // found opponent → keep going recursively
    if(board[row][col] === opponent)
    {
        flips.push([row, col]);

        return flipInDirection(board, row, col, dx, dy, player, flips);
    }

    // found own piece → flip everything
    if(board[row][col] === player)
    {
        for(let i = 0; i < flips.length; i++)
        {
            let r = flips[i][0];
            let c = flips[i][1];

            board[r][c] = player;
        }

        return flips.length > 0;
    }

    return false;
}

function checkGameOver(board)
{
    if(!hasValidMove(board, 1) || !hasValidMove(board, 2))
    {
        return determineWinner(board);
    }

    return null;
}

function hasValidMove(board, player)
{
    for(let r = 0; r < 8; r++)
    {
        for(let c = 0; c < 8; c++)
        {
            if(board[r][c] === 0)
            {
                // deep copy board
                let tempBoard = board.map(row => row.slice());

                if(placeStoneAndFlipRecursive(tempBoard, r, c, player))
                {
                    return true;
                }
            }
        }
    }

    return false;
}

function determineWinner(board)
{
    let player1Count = 0;
    let player2Count = 0;

    for(let i = 0; i < 8; i++)
    {
        for(let j = 0; j < 8; j++)
        {
            if(board[i][j] === 1)
            {
                player1Count++;
            }
            else if(board[i][j] === 2)
            {
                player2Count++;
            }
        }
    }

    if(player1Count > player2Count)
    {
        return {
            winner: 1,
            message: gameData.player1 + " (TAN) wins!"
        };
    }
    else if(player2Count > player1Count)
    {
        return {
            winner: 2,
            message: gameData.player2 + " (BROWN) wins!"
        };
    }
    else
    {
        return {
            winner: 0,
            message: "It's a draw!"
        };
    }
}

function updateBoard(board)
{
    console.log("Updating board...");

    let boardHtml = '';

    for(let i = 0; i < board.length; i++)
    {
        for(let j = 0; j < board[i].length; j++)
        {
            let cellId = `cell${i}_${j}`;
            let cellClass = "cell";

            if(board[i][j] === 1)
            {
                cellClass = "yellowball";
            }
            else if(board[i][j] === 2)
            {
                cellClass = "redball";
            }

            boardHtml +=
                `<input type="button"
                        id="${cellId}"
                        class="${cellClass}">`;
        }
    }

    $("#BoxContainer").html(boardHtml);
}