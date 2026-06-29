//normal checks
//after any pieace move to a new location you see all the possible positions for this pieace at this new position an check is there is the other 
// other player king in one of those positions 

import moving_rules from "./general_moving_rules";


//this function is activated two times after each move from eavry player and in moving_rules function to check if the king can move to a spot

//check for checks :=> after each play from the user 
//find the opposite king 
//check if its threthen //then anounce its checked
//check if the king is thren for all possible places //delete them from possible moves


// this function returns true(the  king is checked) or false
export default function check_checks(Squares, y, x,last_move) {//x, y are indexes of the opposite king or the indexes of the the square that the king might go to
    //to check if the king is threthen (knight ) (evry other pieace)
    ////  find the first pieace to him from each side
    let possible_threts = []

    //horizental right
    for (let i = x + 1; i < 8; i++) {
        let element = Squares[y][i];
        if (typeof element === 'object') {
            //check if the pieace is of the same color
            if (element.color !== Squares[y][x].color) {
                possible_threts.push(element.position);
            }
            break;
        }
    }

    //horizental left
    for (let i = x - 1; i >= 0; i--) {
        let element = Squares[y][i];
        if (typeof element === 'object') {
            //check if the pieace is of the same color
            if (element.color !== Squares[y][x].color) {
                possible_threts.push(element.position);
            }
            break;
        }
    }

    //vertical up
    for (let i = y - 1; i >= 0; i--) {
        let element = Squares[i][x];
        if (typeof element === 'object') {
            //check if the pieace is of the same color
            if (element.color !== Squares[y][x].color) {
                possible_threts.push(element.position);
            }
            break;
        }
    }

    //vertical down
    for (let i = y + 1; i < 8; i++) {
        let element = Squares[i][x];
        if (typeof element === 'object') {
            //check if the pieace is of the same color
            if (element.color !== Squares[y][x].color) {
                possible_threts.push(element.position);
            }
            break;
        }
    }

    //diagonale down right
    let i = 1
    while (((y + i) < 8) && ((x + i) < 8) ) {
        let element = Squares[y+i][x+i];
        if (typeof element === 'object') {
            //check if the pieace is of the same color
            if (element.color !== Squares[y][x].color) {
                possible_threts.push(element.position);
            }
            break;
        }
        i++; 
    }

    //diagonal down left 
    i = 1
    while (((y + i) < 8) && ((x - i) >= 0) ) {
        let element = Squares[y+i][x - i];
        if (typeof element === 'object') {
            //check if the pieace is of the same color
            if (element.color !== Squares[y][x].color) {
                possible_threts.push(element.position);
            }
            break;
        }
        i++; 
    }

    //diagonal up right 
    i = 1
    while (((y - i) >= 0) && ((x + i) < 8) ) {
        let element = Squares[y - i][x + i];
        if (typeof element === 'object') {
            //check if the pieace is of the same color
            if (element.color !== Squares[y][x].color) {
                possible_threts.push(element.position);
            }
            break;
        }
        i++; 
    }

    //diagonal up left
    i = 1
    while (((y - i) >= 0) && ((x - i) >= 0) ) {
        let element = Squares[y - i][x - i];
        if (typeof element === 'object') {
            //check if the pieace is of the same color
            if (element.color !== Squares[y][x].color) {
                possible_threts.push(element.position);
            }
            break;
        }
        i++; 
    }

    //console.log('TEST POSSIBLE THRETS ',possible_threts)


    //
    //for each position compute all the possible moves and if one of them equal the position of king return 
    for (let i = 0; i < possible_threts.length; i++) {
        let all_possible_moves = moving_rules(Squares,possible_threts[i][0],possible_threts[i][1],last_move);
        for (let j = 0; j < all_possible_moves.length; j++) {
            if (all_possible_moves[j][0] === y && all_possible_moves[j][1] === x) {
                //check
                //console.log(`TEST CHECK : THE ${Squares[y][x].color} king IS CHECKED`);
                return true;
            }
            
        }
    }

    //test if the king is checked by the knight
    //get all the positions from the king stand point
    let knight_possible_positions = [];

    if (y + 1 < 8) {
        if (x + 2 < 8) knight_possible_positions.push([y + 1, x + 2]);
        if (x - 2 >= 0) knight_possible_positions.push([y + 1, x - 2]);
    }
    if (y - 1 >= 0) {
        if (x + 2 < 8) knight_possible_positions.push([y - 1, x + 2]); 
        if (x - 2 >= 0) knight_possible_positions.push([y - 1, x - 2]); 
    }
    if (y - 2 >= 0) {
        if (x + 1 < 8) knight_possible_positions.push([y - 2, x + 1]);
        if (x - 1 >= 0) knight_possible_positions.push([y - 2, x - 1]);
    }
    if (y + 2 < 8) {
        if (x + 1 < 8)  knight_possible_positions.push([y + 2, x + 1]);
        if (x - 1 >= 0) knight_possible_positions.push([y + 2, x - 1]);
    }
    for (let i = 0; i < knight_possible_positions.length; i++) {
        let element = Squares[knight_possible_positions[i][0]][knight_possible_positions[i][1]];
        if (typeof element === 'object') {
            if(element.name === 'knight' && element.color !== Squares[y][x].color){
                //console.log(`TEST CHECK : THE ${Squares[y][x].color} king IS CHECKED BY A KNIGHT`);
                return true;
            }
        }
        
    }
    return false;
    //// if the pieace is of the opposite color and its possible moves contain the position of the king remark it as check return
    //// find all the possible positions of a knight  from the king and if one of those places contain a knight of the opposite color  remark it as check and return
}