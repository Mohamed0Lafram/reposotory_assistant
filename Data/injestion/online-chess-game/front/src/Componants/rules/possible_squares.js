import check_checks from "./check_for_checks";
import moving_rules from "./general_moving_rules";

export default function possible_squares(Squares, y, x,last_move) {
    let initial_possible_moves = moving_rules(Squares, y, x,last_move);
    console.log('possible squares ', initial_possible_moves)
    let filtred_position = [];

    //copy the square array
    let copy = Squares.map((rows) => {
        return rows.map((cols) => {
            return (typeof cols === 'object') ?
                { ...cols } :
                cols
        })
    })



    // make the move for each initial_possible_moves and then check if the king is checked
    for (let i = 0; i < initial_possible_moves.length; i++) {
        let y_test = initial_possible_moves[i][0];
        let x_test = initial_possible_moves[i][1];
        let copy_eat_square = copy[y_test][x_test]; //store the eaten pieace if there is one
        //make the move check if the king is checked if yes delete the coor from the initial_possible_moves
        //return the copy to its initial state


        //replace the object in the first click to this div

        copy[y_test][x_test] =  copy[y][x];
        copy[y_test][x_test].position = [y_test, x_test];//change the position in the object
        copy[y_test][x_test].move_number++;//increment the move number
        copy[y][x] = 0; //assign 0 to the vacated square


        //FIND THE allie KING POSITION
        const alie_king = {};
        for (let i = 0; i < copy.length; i++) {
            for (let j = 0; j < copy.length; j++) {
                if (typeof copy[i][j] === 'object') {
                    if ((copy[i][j].color === copy[y_test][x_test].color) && (copy[i][j].name === 'king')) {
                        Object.assign(alie_king, copy[i][j]);
                    }
                }
            }
        }
        //console.log('alie king ',alie_king)
        //if the king is checked delete the tested position from the possiiblitys and return the state into its original form
        if (!check_checks(copy, alie_king.position[0], alie_king.position[1],last_move)) {
            filtred_position.push([y_test, x_test]);
        }

        //replace the object in the first click to this div
        copy[y][x] = copy[y_test][x_test];
        copy[y][x].position = [y, x];//change the position in the object
        copy[y][x].move_number--;//increment the move number
        copy[y_test][x_test] = copy_eat_square; //assign 0 to the vacated square
    }

    return filtred_position;
}