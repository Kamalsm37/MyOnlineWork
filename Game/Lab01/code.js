
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
        let data = {};

        data['action'] = "quitGame";

        MakeAjaxCall("gamePlay.php", "POST", data, "JSON", QuitSuccess, HandleErrors);           
    });

    $("#BoxContainer").on("click", "input[id^='cell']", handleClick);

})

function createTable()
{
    let board = '';

    console.log("Inside display board");

    for(let i = 0; i < 8; i++)
    {
            for(let j = 0; j < 8; j++)
            {
                board += `<input type="text" id="cell${i}_${j}" class="cell" ></input>`;
            }
    }
    $('#BoxContainer').html(board);

}

function validate(x, y) {
    console.log("inside validate func");
    if (x != '' && y != '') {

        let data = {};

        data['action'] = "newGame";
        data['player1'] = x;
        data['player2'] = y;

        MakeAjaxCall("gamePlay.php", "POST", data, "JSON", NewGameSuccess, HandleErrors);              

        createTable();

    $("#BoxContainer").show();

    }
    else {
        console.log("fill both name inputs");
        $('#msg_label').text("Both names should be atleast one character. ");
    }
}

function handleClick(){
    console.log(`You clicked on ${this.id}`);

    let idParts = this.id.split('_');
    let row = idParts[0].replace('cell', ''); 
    let col = idParts[1]; 

    console.log(`Row:  ${row}`);
    console.log(`Col:  ${col}`);

    let data = {};

        data['action'] = "cellData";
        data['row'] = row;
        data['col'] = col;

        MakeAjaxCall("gamePlay.php", "POST", data, "JSON", CellDataSuccess, HandleErrors);              
}

function NewGameSuccess(serverData, serverStatus) {
    console.log("NEW GAME started:");
    console.log(serverData);
    $("#msg_label").html(serverData.message);

    updateBoard(serverData.board);
}

function QuitSuccess(serverData, serverStatus) {
    console.log("GAME QUIT:");
    console.log(serverData);
    $("#msg_label").html(serverData.message);
    
    $("#BoxContainer").hide();

}
function CellDataSuccess(serverData, serverStatus) {
    console.log("Cell Pressed");

    if (serverData.success) {
        updateBoard(serverData.board);
        $("#msg_label").html(serverData.message);
    } else {
        $("#msg_label").html(serverData.message);
    }
}

function updateBoard(board) {
    console.log("Updating the board...");
    let boardHtml = '';

    //iterate through rows and columns
    for (let i = 0; i < board.length; i++) 
        { 
        for (let j = 0; j < board[i].length; j++) 
        { 
            let cellId = `cell${i}_${j}`; 
            let cellClass = "cell";

            if (board[i][j] == 1) {
                cellClass = "yellowball"; // Player 1's stone
            } else if (board[i][j] === 2) {
                cellClass = "redball"; // Player 2's stone
            }

            boardHtml += `<input type="button" id="${cellId}" class="${cellClass}" data-row="${i}" data-col="${j}">`;
        }
    }

    $('#BoxContainer').html(boardHtml);
}


function HandleErrors(ajaxReq, ajaxStatus, errorThrown) 
{
    console.log(ajaxReq);
    console.log(ajaxStatus);
    console.log(errorThrown);

    $('#msg_label').text(ajaxStatus);
}

function MakeAjaxCall(serverURL, reqMethod, data, serverResponse, successHandler, HandleErrors) 
{
    console.log("Inside MakeAjaxCall Function");

    let ajaxOptions = {};
    ajaxOptions['url'] = serverURL;                 //Destination URL
    ajaxOptions['type'] = reqMethod;                //Get/Post
    ajaxOptions['dataType'] = serverResponse;       //HTML/JSON
    ajaxOptions['data'] = data;                     //Client data to be passed to server
    ajaxOptions['success'] = successHandler;        //Callback func to handle successfull case
    ajaxOptions['error'] = HandleErrors;            //Callback func to handle error case

    $.ajax(ajaxOptions);
}
