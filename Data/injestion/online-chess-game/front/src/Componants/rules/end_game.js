import check_checks from "./check_for_checks";
import possible_squares from "./possible_squares";


export default function  game_end(copy,opposite_king,last_move){//this function return continue or draw or win
    //console.log('opposite king',opposite_king)
    //get all the pieaces and compute all possible moves if all the lists are empty end the game
    let pieaces  = [];
    for (let i = 0; i < copy.length; i++) {
        for (let j = 0; j < copy.length; j++) {
            if (copy[i][j].color === opposite_king.color) {
                pieaces.push(copy[i][j]);
            }
        }
    }
    

    console.log('TEST ALLIE PIEACES', pieaces)
    if (pieaces.length === 2 ) {
        for (let i = 0; i < pieaces.length; i++) {
            if (pieaces[i].name === 'bishop' || pieaces[i].name === 'knight') {
                console.log('TEST INSUFISSANT PIEACES TO CHECKMATE')
                return 'draw'
            }
        }
    }
    //compute all possible moves
    for (let i = 0; i < pieaces.length; i++) {
        //gert the possible squares for each pieace
        let possible_move = possible_squares(copy,pieaces[i].position[0],pieaces[i].position[1]) 
        if(possible_move.length !== 0 ) return 'continue';
    }
    if(check_checks(copy,opposite_king.position[0],opposite_king.position[1],last_move)) return 'win'

    return 'draw';
    
}