import check_road from "./check_road";

export default function moving_rules(Squares, y, x,last_move) {//x, y rpresente the element that the user first clicked on
    //pawns 
    if (Squares[y][x].name === 'pawn') {
        let allowed_positions = []
        if (Squares[y][x].move_number === 0) {
            let operation = (Squares[y][x].color === 'white') ? [-2,-1] : [2,1];
            //check tis there a possible pieace in this possile position
            if(typeof Squares[y + operation[0]][x] !== 'object' && 
                typeof Squares[y + operation[1] ][x] !== 'object'
            ){
                allowed_positions.push([y + operation[0], x]);
            }
            
        }
        let operation = (Squares[y][x].color === 'white') ? -1 : 1;
        
        //check tis there a possible pieace in this possile position
        if(typeof Squares[y + operation][x] !== 'object'){
            allowed_positions.push([y + operation, x]);
        }
        //check if the position is possible
        if( (x + 1) <  8 ){//check if the position is possible
            let possible_square = Squares[y + operation][ x + 1]
            if(typeof possible_square === 'object' && possible_square.color !== Squares[y][x].color){
                allowed_positions.push([y + operation, x + 1]);
            }
            
        }
        if((x - 1) >= 0){//check if the position is possible
            let possible_square = Squares[y + operation][x - 1]
            if(typeof possible_square === 'object' && possible_square.color !== Squares[y][x].color){
                allowed_positions.push([y + operation, x - 1]);
            }
        }  
        //check for possible en passent
        if( x + 1 < 8){
            if(typeof Squares[y][x+1] === 'object'){
                if(Squares[y][x+1].name === 'pawn' && Squares[y][x+1].color !== Squares[y][x].color){
                    //check if the last move played is a pawn with squares passed
                    //[copy[y][x].name,[y,x],ini_pos]
                    if ( last_move && last_move[0] === 'pawn' 
                        &&  last_move[1][0] === y
                        &&  last_move[1][1] === x+1
                        &&  last_move[1][0] - last_move[2][0] === 2 
                    ){
                        if(typeof Squares[y-1][x + 1] === 'number'){//this work only for white for now
                            //make the move 
                            allowed_positions.push([y-1,x + 1])
                        }
                    }
                }
            }
        }
               
        //check for possible en passent
        if( x - 1 >= 0){
            if(typeof Squares[y][x-1] === 'object'){
                if(Squares[y][x-1].name === 'pawn' && Squares[y][x-1].color !== Squares[y][x].color){
                    //check if the last move played is a pawn with squares passed
                    if ( last_move && last_move[0] === 'pawn' 
                        &&  last_move[1][0] === y
                        &&  last_move[1][1] === x-1
                        &&  last_move[1][0] - last_move[2][0] === 2 
                    ){
                        if(typeof Squares[y-1][x - 1] === 'number'){//this work only for white for now
                            //make the move 
                            allowed_positions.push([y-1,x - 1])
                        }
                    }
                }
            }
        }
        //note : if the pieace is on the side the list duplicate one position
        //console.log('TEST :allowed positions for the pawn',allowed_positions)
        return allowed_positions;

    }
    //rooks 
    else if (Squares[y][x].name === 'rook') {
        //console.log('TEST : possible position rook  ',coor_ver_hor(Squares,y,x))
        return  coor_ver_hor(Squares,y,x);//get all allowed position
         
    }
    //bishops
    else if (Squares[y][x].name === 'bishop') {
        return coor_diag(Squares,y,x);
    }
    //queens
    else if (Squares[y][x].name === 'queen') {

        //console.log('TEST : possible position queen ',[...coor_diag(Squares,y,x), ...coor_ver_hor(Squares,y,x)])
        return [...coor_diag(Squares,y,x), ...coor_ver_hor(Squares,y,x)];
    }
    //king
    else if (Squares[y][x].name === 'king') {
        let allowed_positions = []

        if (y + 1 < 8) {//add veritical position
            //check if the block is empty
            let checked_blocked = check_for_blocked_road(Squares,y + 1,x,y,x)
            if(checked_blocked === 0 || checked_blocked === -1 ) allowed_positions.push([y + 1, x])
            
            if (x + 1 < 8){
                let checked_blocked = check_for_blocked_road(Squares,y + 1, x + 1,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 ) allowed_positions.push([y + 1, x + 1])
            };
            if (x - 1 >= 0){
                let checked_blocked = check_for_blocked_road(Squares,y + 1,x-1,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 ) allowed_positions.push([y + 1, x - 1])
            }
        }
        if (y - 1 >= 0) {

            let checked_blocked = check_for_blocked_road(Squares,y - 1,x,y,x)
            if(checked_blocked === 0 || checked_blocked === -1 ) allowed_positions.push([y - 1, x])
            
            if (x + 1 < 8){
                let checked_blocked = check_for_blocked_road(Squares,y - 1,x+1,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 )  allowed_positions.push([y - 1, x + 1])
            };
            if (x - 1 >= 0){
                let checked_blocked = check_for_blocked_road(Squares,y - 1,x-1,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 )  allowed_positions.push([y - 1, x - 1]);
            } 
        }

        if (x + 1 < 8){
            let checked_blocked = check_for_blocked_road(Squares,y,x+1,y,x)
            if(checked_blocked === 0 || checked_blocked === -1 )  allowed_positions.push([y, x + 1]);
        };
        if (x - 1 >= 0){
            let checked_blocked = check_for_blocked_road(Squares,y,x-1,y,x)
            if(checked_blocked === 0 || checked_blocked === -1 )  allowed_positions.push([y, x - 1]);
        } 


        //add the castling option (note doble check that the user hasnt move neither the king nor the selected rook)
        if(Squares[y][x].move_number === 0 ){
            if(typeof Squares[y][7] === 'object'){//first rook
                //check that the right is empty lane is empty
                
                let is_empty = check_road(Squares, [y,x], 7,y)
                //console.log('TEST : THE LANE BETWEEN THE KING AND THE ROOK ',is_empty , y,x)
                if (is_empty && Squares[y][7].move_number === 0) {
                    allowed_positions.push([y, x + 2 ]);
                }
            }
            if(typeof Squares[y][0] === 'object'){
                //check id the lane is empty
                let is_empty = check_road(Squares,[y,x], 0,y)
                if (is_empty && Squares[y][0].move_number === 0) {
                    allowed_positions.push([y, x - 2 ]);
                }
            }
        }

        return allowed_positions
    }
    else if (Squares[y][x].name === 'knight') {
        let allowed_positions = [];

        if (y + 1 < 8) {
            if (x + 2 < 8){
                let checked_blocked = check_for_blocked_road(Squares,y+1,x+2,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 )  allowed_positions.push([y + 1, x + 2]);
            } ;
            if (x - 2 >= 0){
                let checked_blocked = check_for_blocked_road(Squares,y+1,x-2,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 ) allowed_positions.push([y + 1, x - 2]);
            } 
        }
        if (y - 1 >= 0) {
            if (x + 2 < 8){
                let checked_blocked = check_for_blocked_road(Squares,y-1,x+2,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 ) allowed_positions.push([y - 1, x + 2]);
            } 
            if (x - 2 >= 0){
                let checked_blocked = check_for_blocked_road(Squares,y-1,x-2,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 ) allowed_positions.push([y - 1, x - 2]);
            } 
        }
        if (y - 2 >= 0) {
            if (x + 1 < 8){
                let checked_blocked = check_for_blocked_road(Squares,y-2,x+1,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 ) allowed_positions.push([y - 2, x + 1]);
            } 
            if (x - 1 >= 0){
                let checked_blocked = check_for_blocked_road(Squares,y-2,x-1,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 ) allowed_positions.push([y - 2, x - 1]);
            } 
        }
        if (y + 2 < 8) {
            if (x + 1 < 8){
                let checked_blocked = check_for_blocked_road(Squares,y+2,x+1,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 ) allowed_positions.push([y + 2, x + 1]);
            } 
            if (x - 1 >= 0){
                let checked_blocked = check_for_blocked_road(Squares,y+2,x - 1,y,x)
                if(checked_blocked === 0 || checked_blocked === -1 ) allowed_positions.push([y + 2, x - 1]);
            } 
        }

        return allowed_positions;
    }
}

function coor_diag(Squares,y,x) {
    let allowed_positions = [];

    //diagonal up right 
    let i = 1;
    while ((y - i >= 0) && (x + i < 8)) {
        //if this position contain an object 
        if(typeof Squares[y - i][x + i] === 'object'){
            //if the object is the same color as the initial pieace return without adding it to the position
            if ( Squares[y - i][x + i].color === Squares[y][x].color) {
                break;
            }
            else{
                allowed_positions.push([y - i, x + i]);
                break;
            };
        }
        else{//the square is empty
            allowed_positions.push([y - i, x + i])
        }
        i++;
    }
    //diagonal up left 
    i = 1;
    while ((y - i >= 0) && (x - i >= 0)) {
        //if this position contain an object 
        if(typeof Squares[y - i][x - i] === 'object'){
            //if the object is the same color as the initial pieace return without adding it to the position
            if ( Squares[y - i][x - i].color === Squares[y][x].color) {
                break;
            }
            else{
                allowed_positions.push([y - i, x - i]);
                break;
            };
        }
        else{//the square is empty
            allowed_positions.push([y - i, x - i]);
        }
        i++;
    }
    //diagonal down right
    i = 1;
    while ((y + i < 8) && (x + i < 8)) {
        //if this position contain an object 
        if(typeof Squares[y + i][x + i] === 'object'){
            //if the object is the same color as the initial pieace return without adding it to the position
            if ( Squares[y + i][x + i].color === Squares[y][x].color) {
                break;
            }
            else{
                allowed_positions.push([y + i, x + i]);
                break;
            };
        }
        else{//the square is empty
            allowed_positions.push([y + i, x + i]);
        }
        i++;
    }
    //diagonal down left
    i = 1;
    while ((y + i < 8) && (x - i >= 0)) {
        //if this position contain an object 
        if(typeof Squares[y + i][x - i] === 'object'){
            //if the object is the same color as the initial pieace return without adding it to the position
            if ( Squares[y + i][x - i].color === Squares[y][x].color) {
                break;
            }
            else{
                allowed_positions.push([y + i, x - i]);
                break;
            };
        }
        else{//the square is empty
            allowed_positions.push([y + i, x - i]);
        }
        i++;
    }
    return allowed_positions
}

function coor_ver_hor(Squares,y,x) {//checked
    let allowed_positions = [];
    //horizental right
    //console.log('TEST ROOK POSSIBLE POSITION 1: INITIAL POSITION ',y,x);
    for (let i = x + 1; i < 8; i++) {
        //if this position contain an object 
        if(typeof Squares[y][i] === 'object'){
            //console.log('TEST ROOK POSSIBLE POSITION 1: OBJECT DETECTED');
            //if the object is the same color as the initial pieace return without adding it to the position
            if ( Squares[y][i].color === Squares[y][x].color) {
                break;
            }
            else{
                allowed_positions.push([y, i]);
                break;
            };
        }
        else{//the square is empty
            allowed_positions.push([y, i])
        }
    }
        
    
    //horizental left
    for (let i = x - 1; i >= 0; i--) {
        //if this position contain an object 
        if(typeof Squares[y][i] === 'object'){
            //if the object is the same color as the initial pieace return without adding it to the position
            if ( Squares[y][i].color === Squares[y][x].color) {
                break;
            }
            else{
                allowed_positions.push([y, i]);
                break;
            };
        }
        else{//the square is empty
            allowed_positions.push([y, i])
        }
    };
    //vertical up
    for (let i = y + 1; i < 8; i++) {
        //if this position contain an object 
        if(typeof Squares[i][x] === 'object'){
            //console.log('TEST ROOK POSSIBLE POSITION 1: OBJECT DETECTED');
            //if the object is the same color as the initial pieace return without adding it to the position
            if ( Squares[i][x].color === Squares[y][x].color) {
                break;
            }
            else{
                allowed_positions.push([i,x]);
                break;
            };
        }
        else{//the square is empty
            allowed_positions.push([i,x])
        }
    };

    //vertical down 
    for (let i = y - 1; i >= 0; i--) {
        //if this position contain an object 
        if(typeof Squares[i][x] === 'object'){
            //console.log('TEST ROOK POSSIBLE POSITION 1: OBJECT DETECTED');
            //if the object is the same color as the initial pieace return without adding it to the position
            if ( Squares[i][x].color === Squares[y][x].color) {
                break;
            }
            else{
                allowed_positions.push([i,x]);
                break;
            };
        }
        else{//the square is empty
            allowed_positions.push([i,x])
        }
    };

    return allowed_positions;
}





//this function return 0(the checked square is empty) 1(the checked square contain a pieace with the same color) -1(the checked square contain a pieace with the opossite color)
function check_for_blocked_road(Squares,y_check,x_check,y_original,x_original){
    //if this position contain an object 
    if(typeof Squares[y_check][x_check] === 'object'){
        //if the object is the same color as the initial pieace return without adding it to the position
        if ( Squares[y_check][x_check].color === Squares[y_original][x_original].color) {
            return 1;
        }
        else{
            return -1;
        };
    }
    else{//the square is empty
        return 0;
    }

}