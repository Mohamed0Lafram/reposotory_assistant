//there are two special moves 
//promoting a pawn to a queen  : 
//if a pawn y coor is equal to 0 or to 7 change the object into a queen
export default function check_special_move (Squares,y_initial,x_initial,y,x){//y
    if(Squares[y_initial][x_initial].name === 'pawn'){
        if (y === 7 || y === 0) {
            console.log('TEST SPETIAL MOVE :  SPECIAL MOvE DETECTED')
            return 'pawn'
        }
        else if(x +1  === x_initial && typeof Squares[y][x] === 'number'){//enpassent left
            console.log('TEST EN PASSENT LEFT')
            return 'en passent '
        }
        else if(x - 1  === x_initial && typeof Squares[y][x] === 'number'){//enpassent right
            console.log('TEST EN PASSENT RIGHT')
            return 'en passent'
        }
    }
    else if(Squares[y_initial][x_initial].name === 'king' && Squares[y_initial][x_initial].move_number === 0){
        if (x === 6) {
            //check if the rook exist and its move number is 0
            if (typeof Squares[y_initial][7] === 'object') {
                if (Squares[y_initial][7].move_number === 0) {
                    console.log('TEST SPETIAL MOVE :  SPECIAL MOvE DETECTED')
                    return 'king right'
                }
            }
        }
        else if (x === 2) {
            //check if the rook exist and its move number is 0
            if (typeof Squares[y_initial][0] === 'object') {
                if (Squares[y_initial][0].move_number === 0) {
                    console.log('TEST SPETIAL MOVE :  SPECIAL MOvE DETECTED')
                    return 'king left'
                }
            }
        }
        
    }

    
    return 'none'
} 
//castling :
/// if a king is moving in x = 6 || 2 and the king move_number = 0 and the rook move_number = 0 make the castle