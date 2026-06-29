import { useEffect, useState } from 'react';
import './Board.css'


//rules 
import moving_rules from '../rules/general_moving_rules';
import check_road from '../rules/check_road';
//pieaces
import { Pieaces } from './Pieaces';
import check_special_move from '../rules/special_move';
//image
import queen_b from '../../assets/pieaces_images/queen_b.png';
import queen_w from '../../assets/pieaces_images/queen_w.png';
import check_for_checks from '../rules/check_for_checks';
import check_checks from '../rules/check_for_checks';
import possible_squares from '../rules/possible_squares';
import game_end from '../rules/end_game';

export default function Board() {


    //represente each square on the board 
    const [Squares, setSquares] = useState(Array(8).fill(Array(8).fill(0)));

    useEffect(() => {
        //set each pieace at its initial position
        let copy = Squares.map(items => [...items]);

        //set  pieaces 
        for (let i = 0; i < Pieaces.length; i++) {//pieace color
            for (let j = 0; j < Pieaces[i].pieaces.length; j++) {//classe pieace
                for (let k = 0; k < Pieaces[i].pieaces[j].position.length; k++) { // single pieace
                    copy[Pieaces[i].pieaces[j].position[k][0] - 1][Pieaces[i].pieaces[j].position[k][1] - 1] = {
                        color: Pieaces[i].color,
                        name: Pieaces[i].pieaces[j].name,
                        urlimage: Pieaces[i].pieaces[j].image,
                        position: [Pieaces[i].pieaces[j].position[k][0] - 1, Pieaces[i].pieaces[j].position[k][1] - 1],
                        move_number: 0,
                        possible_position: false
                    }
                }
            }
        }

        //add pieace to square 
        setSquares(() => {
            return copy.map((rows) => {
                return rows.map((cols) => {
                    return (typeof cols === 'object') ?
                        { ...cols } :
                        cols
                })
            })
        })
        console.log(copy);
    }, [])


    //create a play sysytem where users only have access to their pieaces 
    //the turn start with white after he click two times
    //the turn goes to black and then it goes again to white etc
    const [turn, setTurn] = useState(true);
    //test
    useEffect(() => { console.log((turn) ? 'the white turn' : 'the black turn') }, [turn])

    //variables 
    const [first_click, setFirstClick] = useState([]);//this varibel will contain the position of the block clicked
    const [possible_positions, setPossibePositions] = useState([]);
    const [old_possible_positions, setOldPossiblePositions] = useState([])
    const delete_color_possible_positions = () => {
        //copy the square array
        let copy = Squares.map((rows) => {
            return rows.map((cols) => {
                return (typeof cols === 'object') ?
                    { ...cols } :
                    cols
            })
        })
        //deletete the anciant possible colors

        for (let i = 0; i < old_possible_positions.length; i++) {
            //id the square empty make it 1 to assing its possible 
            if (typeof copy[old_possible_positions[i][0]][old_possible_positions[i][1]] === 'object') {
                copy[old_possible_positions[i][0]][old_possible_positions[i][1]].possible_position = false;
            }
            else {
                copy[old_possible_positions[i][0]][old_possible_positions[i][1]] = 0;
            }
        }

        //add pieace to square 
        setSquares(() => {
            return copy.map((rows) => {
                return rows.map((cols) => {
                    return (typeof cols === 'object') ?
                        { ...cols } :
                        cols
                })
            })
        })

    }
    const color_possible_positions = () => {
        //change the color by making all the possible squares have possible value = true ;
        //copy the square array
        let copy = Squares.map((rows) => {
            return rows.map((cols) => {
                return (typeof cols === 'object') ?
                    { ...cols } :
                    cols
            })
        })

        //deletete the anciant possible colors

        for (let i = 0; i < old_possible_positions.length; i++) {
            //id the square empty make it 1 to assing its possible 
            if (typeof copy[old_possible_positions[i][0]][old_possible_positions[i][1]] === 'object') {
                copy[old_possible_positions[i][0]][old_possible_positions[i][1]].possible_position = false;
            }
            else {
                copy[old_possible_positions[i][0]][old_possible_positions[i][1]] = 0;
            }
        }
        //color possible positions
        for (let i = 0; i < possible_positions.length; i++) {
            //id the square empty make it 1 to assing its possible 
            if (typeof copy[possible_positions[i][0]][possible_positions[i][1]] === 'object') {
                copy[possible_positions[i][0]][possible_positions[i][1]].possible_position = true;
            }
            else {
                copy[possible_positions[i][0]][possible_positions[i][1]] = 1;
            }
        }
        //add pieace to square 
        setSquares(() => {
            return copy.map((rows) => {
                return rows.map((cols) => {
                    return (typeof cols === 'object') ?
                        { ...cols } :
                        cols
                })
            })
        })

    }
    useEffect(() => {
        if (possible_positions.length === 0) {
            return
        } else {
            color_possible_positions();
        }
    }, [possible_positions]);





    //this function moves a piesce from a to b
    const move_pieace = (y, x) => {//X AND Y ARE THE INDEX OF THE ELEMENT THAT IS CLICKED
        if (first_click.length === 0) {//first click

            //check if the user has clicked on a pieace
            if (typeof Squares[y][x] === 'object') {

                //check the if the user has clicked on one of his piesces
                let turn_copy = (turn) ? 'white' : 'black';
                if (Squares[y][x].color === turn_copy) {

                    //assigning this div as the first click div
                    console.log('first click!!!!!')
                    setFirstClick([y, x])

                    //compute all the possibel positions
                    let possible_positions_copy = possible_squares(Squares, y, x);

                    //before replacing possible positions with the new ones you must copy it to delete the style color added to it
                    setOldPossiblePositions([...possible_positions]);
                    setPossibePositions([...possible_positions_copy]);//the useEffect color the possible positions    
                }
            }
        }
        else { //this div is the second one clicked

            //check that the div is not the same as the first click
            if (y === first_click[0] && x === first_click[1]) {
                console.log('TEST : YOU CLICKED THE SAME SQUARE TWICE')
                return;
            }

            //check if the pieace that palyer choose to take is in same color
            if (typeof Squares[y][x] !== 'number') {

                if (Squares[y][x].color === Squares[first_click[0]][first_click[1]].color) {
                    console.log('test if the user has clicked on one of his pieces');
                    let possible_positions_copy = possible_squares(Squares, y, x);
                    //reassing this swaure as the first clicked square
                    setFirstClick([y, x]);

                    //before replacing possible positions with the new ones you must copy it to delete the style color added to it
                    setOldPossiblePositions([...possible_positions]);
                    setPossibePositions([...possible_positions_copy]);
                    return
                }
            }

            //check that the way is clear for the moving pieace(all the squares in the strict line between a and b should be empty)
            if (!check_road(Squares, first_click, x, y)) {
                console.log('TEST : THE WAY TO THE CLICKED SQUARE IS FULL')
                return;
            }

            //cheack is the move is legal
            if (!possible_positions.some(el => el[0] === y && el[1] === x)) {
                console.log('the move is not legeal')
                return
            }


            //make the move
            //copy the square array
            let copy = Squares.map((rows) => {
                return rows.map((cols) => {
                    return (typeof cols === 'object') ?
                        { ...cols } :
                        cols
                })
            })

            ///////////////////////////////////////////////////////////////////////
            //color possible positions
            for (let i = 0; i < copy.length; i++) {
                for (let j = 0; j < copy.length; j++) {
                    //id the square empty make it 1 to assing its possible 
                    if (typeof copy[i][j] === 'object') {
                        copy[i][j].possible_position = false;
                    }
                    else {
                        copy[i][j] = 0;
                    }
                }
            }
            //check if the move is spetial 
            let special_move = check_special_move(Squares, first_click[0], first_click[1], y, x);
            if (special_move === 'pawn') {//pawn
                //replace the object in the first click to this div
                copy[y][x] = {
                    color: copy[first_click[0]][first_click[1]].color,
                    name: 'queen',
                    urlimage: (copy[first_click[0]][first_click[1]].color === 'white') ? queen_w : queen_b,
                    position: [y, x],
                    move_number: copy[first_click[0]][first_click[1]],
                    possible_position: false
                }

                copy[y][x].move_number++;//increment the move number
                copy[first_click[0]][first_click[1]] = 0; //assign 0 to the vavated square
            }
            else if (special_move === 'none') {
                //replace the object in the first click to this div
                copy[y][x] = copy[first_click[0]][first_click[1]];
                copy[y][x].position = [y, x];//change the position in the object
                copy[y][x].move_number++;//increment the move number
                copy[first_click[0]][first_click[1]] = 0; //assign 0 to the vavated square
            }
            else if (special_move === 'king right') {
                //put the king in the position 
                copy[y][x] = copy[first_click[0]][first_click[1]];
                copy[y][x].position = [y, x];//change the position in the object
                copy[y][x].move_number++;//increment the move number
                copy[first_click[0]][first_click[1]] = 0; //assign 0 to the vavated square
                //put the rock in its new position
                copy[y][x - 1] = copy[y][7];
                copy[y][x - 1].position = [y, x - 1];//change the position in the object
                copy[y][x - 1].move_number++;//increment the move number
                copy[first_click[0]][7] = 0; //assign 0 to the vavated square
            }
            else if (special_move === 'king left') {
                //put the king in the position 
                copy[y][x] = copy[first_click[0]][first_click[1]];
                copy[y][x].position = [y, x];//change the position in the object
                copy[y][x].move_number++;//increment the move number
                copy[first_click[0]][first_click[1]] = 0; //assign 0 to the vavated square
                //put the rock in its new position
                copy[y][x + 1] = copy[y][0];
                copy[y][x + 1].position = [y, x + 1];//change the position in the object
                copy[y][x + 1].move_number++;//increment the move number
                copy[first_click[0]][0] = 0; //assign 0 to the vavated square
            }




            //give the turn to the other player
            setTurn(!turn);
            setFirstClick([]);

            //add pieace to square 
            setSquares(() => {
                return copy.map((rows) => {
                    return rows.map((cols) => {
                        return (typeof cols === 'object') ?
                            { ...cols } :
                            cols
                    })
                })
            })
            //because the Square is still syncing we will use the copy varible
            //SEARCH IF THE OTHER PLAYER IS CHECKED
            //FIND THE OPPOSTIE KING POSITION
            const opposite_king = {};
            for (let i = 0; i < copy.length; i++) {
                for (let j = 0; j < copy.length; j++) {
                    if (typeof copy[i][j] === 'object') {
                        if ((copy[i][j].color !== copy[y][x].color) && (copy[i][j].name === 'king')) {
                            Object.assign(opposite_king, copy[i][j]);
                        }
                    }
                }

            }

            //after the user is checked 
            //if there is a move for the opposite user continue else end the game
            //to check if the game is ending get all possible moves from the user
            console.log('opposite king', opposite_king)

            if (game_end(copy, opposite_king)) {
                console.log('GAME ENDED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
            }
        }
    }
    const [select_square, setSelectSquare] = useState([]);
    const color_square = (y, x) => {
        let copy = Squares.map((rows) => {
            return rows.map((cols) => {
                return (typeof cols === 'object') ?
                    { ...cols } :
                    cols
            })
        })

        //color possible positions
        for (let i = 0; i < copy.length; i++) {
            for (let j = 0; j < copy.length; j++) {
                //id the square empty make it 1 to assing its possible 
                if (typeof copy[i][j] === 'object') {
                    copy[i][j].possible_position = false;
                }
                else {
                    copy[i][j] = 0;
                }
            }
            console.log(copy)
        }
        //add pieace to square 
        setSquares(() => {
            return copy.map((rows) => {
                return rows.map((cols) => {
                    return (typeof cols === 'object') ?
                        { ...cols } :
                        cols
                })
            })
        })

        //color the spesific square 
        setSelectSquare([y, x])
    }

    return (
        <div className="Board">
            {Squares.map((row, index) => {
                let [color_1, color_2] = (index % 2 === 0) ?
                    ['#F4E9D7', '#D97D55'] :
                    ['#D97D55', '#F4E9D7'];
                return row.map((col, iindex) => {

                    let color = (iindex % 2 === 0) ?
                        color_1 :
                        color_2;

                    return <div key={`${index * 8 + iindex}`} className={color}
                        style={{
                            gridArea: `${index + 1} / ${iindex + 1} / ${index + 2} / ${iindex + 2}`,
                            backgroundImage: (typeof Squares[index][iindex] === 'object') ?

                                `url(${Squares[index][iindex].urlimage})` :
                                'none',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'contain',
                            backgroundPosition: 'center',
                            width: '100%',
                            height: '100%',
                            backgroundColor: (select_square[0] === index && select_square[1] === iindex) ?
                                'red' :
                                (typeof Squares[index][iindex] === 'object') ?
                                    (Squares[index][iindex].possible_position === true) ?
                                        getOppositeColor(color) : color
                                    :
                                    (Squares[index][iindex] === 1) ?
                                        getOppositeColor(color) : color

                        }}
                        onClick={() => {
                            color_square(index, iindex);
                            move_pieace(index, iindex)
                        }}
                    ></div>

                })
            })}

        </div>
    )
}

function getOppositeColor(hex) {
    // Remove '#' if present
    hex = hex.replace('#', '');

    // Parse to integer and invert it
    const inverted = (0xFFFFFF ^ parseInt(hex, 16)).toString(16).padStart(6, '0');

    return `#${inverted}`;
}
