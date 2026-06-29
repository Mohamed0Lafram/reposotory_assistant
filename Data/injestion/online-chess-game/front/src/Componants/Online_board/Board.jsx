import { useEffect, useRef, useState } from 'react';
import './Board.css'

//rules 
import check_road from '../rules/check_road';
//pieaces
import { Pieaces } from './Pieaces';
import check_special_move from '../rules/special_move';
//image
import queen_b from '../../assets/pieaces_images/queen_b.png';
import queen_w from '../../assets/pieaces_images/queen_w.png';

import possible_squares from '../rules/possible_squares';
import game_end from '../rules/end_game';

import Clock from '../Clock/Clock';
import socket from '../../socket'
import { useNavigate } from 'react-router-dom';

export default function Board({ My_color, room_name }) {
    //represente each square on the board 
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const navigate = useNavigate();
    const [turn, setTurn] = useState(true);
    const [Squares, setSquares] = useState(
        Array.from({ length: 8 }, () => Array(8).fill(0))
    );

    const moves_history = useRef([]);

    const squaresRef = useRef(Squares);
    useEffect(() => {
        squaresRef.current = Squares;
    }, [Squares]);
    //modify Squares 
    const copy_Square = (Squares) => {//this function copy the whole Square 
        return Squares.map((rows) => {
            return rows.map((cols) => {
                return (typeof cols === 'object') ?
                    { ...cols } :
                    cols
            })
        })
    }
    //this function moves pieacesfrom a to b it follow the chess moving rules (castle, promoting )
    const abstact_move_pieace = (copy, ini_pos, y, x) => {//ini_pos initila position [y,x] indexs of the final position //copy is the squares (it shouldnt be s state varible)
        


        //check if the move is spetial  
        let special_move = check_special_move(copy, ini_pos[0], ini_pos[1], y, x);
        if (special_move === 'pawn') {//pawn
            //replace the object in the first click to this div
            copy[y][x] = {
                color: copy[ini_pos[0]][ini_pos[1]].color,
                name: 'queen',
                urlimage: (copy[ini_pos[0]][ini_pos[1]].color === 'white') ? queen_w : queen_b,
                position: [y, x],
                move_number: copy[ini_pos[0]][ini_pos[1]],
                possible_position: false
            }

            copy[y][x].move_number++;//increment the move number
            copy[ini_pos[0]][ini_pos[1]] = 0; //assign 0 to the vavated square
        }
        else if (special_move === 'none') {
            //replace the object in the first click to this div
            copy[y][x] = copy[ini_pos[0]][ini_pos[1]];
            copy[y][x].position = [y, x];//change the position in the object
            copy[y][x].move_number++;//increment the move number
            copy[ini_pos[0]][ini_pos[1]] = 0; //assign 0 to the vavated square
        }
        else if (special_move === 'king right') {
            //put the king in the position 
            copy[y][x] = copy[ini_pos[0]][ini_pos[1]];
            copy[y][x].position = [y, x];//change the position in the object
            copy[y][x].move_number++;//increment the move number
            copy[ini_pos[0]][ini_pos[1]] = 0; //assign 0 to the vavated square
            //put the rock in its new position
            copy[y][x - 1] = copy[y][7];
            copy[y][x - 1].position = [y, x - 1];//change the position in the object
            copy[y][x - 1].move_number++;//increment the move number
            copy[ini_pos[0]][7] = 0; //assign 0 to the vavated square
        }
        else if (special_move === 'king left') {
            //put the king in the position 
            copy[y][x] = copy[ini_pos[0]][ini_pos[1]];
            copy[y][x].position = [y, x];//change the position in the object
            copy[y][x].move_number++;//increment the move number
            copy[ini_pos[0]][ini_pos[1]] = 0; //assign 0 to the vavated square
            //put the rock in its new position
            copy[y][x + 1] = copy[y][0];
            copy[y][x + 1].position = [y, x + 1];//change the position in the object
            copy[y][x + 1].move_number++;//increment the move number
            copy[ini_pos[0]][0] = 0; //assign 0 to the vavated square
        }
        else if (special_move === 'en passent'){
            //replace the object in the first click to this div
            copy[y][x] = copy[ini_pos[0]][ini_pos[1]];
            copy[y][x].position = [y, x];//change the position in the object
            copy[y][x].move_number++;//increment the move number
            copy[ini_pos[0]][ini_pos[1]] = 0; //assign 0 to the vavated square

            //delete the pawn in the left side
            copy[y + 1][x] = 0;

        }
        const add_to_moving_hsitory = () =>{
            if(moves_history.current.length !== 0){
                if (
                    moves_history.current[moves_history.current.length - 1][0] !== copy[y][x].name 
                    || moves_history.current[moves_history.current.length - 1][1][0] !== y
                    || moves_history.current[moves_history.current.length - 1][1][1] !== x 
                ){
                    //add to hsitory
                    moves_history.current.push([copy[y][x].name,[y,x],ini_pos]); 
                    //test
                    console.log('TEST MOVING HSITORY : ',moves_history.current)
                }
                else{
                    console.log('TEST MOVE HISTORY  :MOVE NOT ADDED')
                } 
            }else{
                //add to hsitory
                moves_history.current.push([copy[y][x].name,[x,y],ini_pos]); 
                //test
                console.log('TEST MOVING HSITORY : ',moves_history.current)
            }
            
            
        }
        add_to_moving_hsitory();
        return copy
    }

    useEffect(() => {//set each pieace at its initial position
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

        //add pieaces to square 
        setSquares(() => copy_Square(copy));
    }, [])
    useEffect(() => {
        //add an event listnener to that change the value of turn(white black) and give the the intial position and
        //final position of the pieace the moved
        socket.on('turn', (data) => {//data {turn : 'white/black' , ini_pos : [y,x],fin_pos : [y,x],room_name}

            setTurn(() => (data.turn === 'white') ? true : false);
            console.log('socket is working data : ', My_color)
            if (game_end(data.game_end.board, data.game_end.op_king_pos,moves_history.current[moves_history.current.length - 1]) === 'win') {
                console.log('GAME ENDED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                navigate('/end_game/' + (turn) ? 'white' : 'black');
            }else if(game_end(data.game_end.board, data.game_end.op_king_pos,moves_history.current[moves_history.current.length - 1]) === 'draw'){
                console.log('GAME ENDED in DRAW !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
                navigate('/end_game/' + (turn) ? 'white' : 'black');
            }
            if (data.turn === My_color) {


                //move the pieace in the board and play your turn
                color_square(data.fin_pos[0], data.fin_pos[1])
                //make the move
                //copy square 

                let copy = copy_Square(squaresRef.current);
                //replace the object in the first click to this div
                //test 
                copy = copy_Square(abstact_move_pieace(copy,data.ini_pos,data.fin_pos[0],data.fin_pos[1]));


                //copy too the square
                setSquares(() => copy_Square(copy))
            }
        })
        console.log(room_name)



    }, [My_color])


    //create a play sysytem where users only have access to their pieaces 
    //the turn start with white after he click two times the turn goes to black and then it goes again to white etc !
    //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    //test
    useEffect(() => { console.log((turn) ? 'the white turn' : 'the black turn') }, [turn])

    //variables !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    const [first_click, setFirstClick] = useState([]);//represent the first click of the player
    const [possible_positions, setPossibePositions] = useState([]);

    const color_possible_positions = () => {
        //change the color by making all the possible squares have possible value = true ;
        //copy the square array
        let copy = copy_Square(Squares);
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
        setSquares(() => copy_Square(copy))

    }
    useEffect(() => {
        if (possible_positions.length === 0) {//this to stop the code form deleting all pieace in the begining (because squares arestill adding their values)
            return
        } else {
            color_possible_positions();
        }
    }, [possible_positions]);




    //this function moves a piesce from a to b
    const move_pieace = (y, x, ini_pos) => {//X AND Y ARE THE INDEX OF THE ELEMENT THAT IS CLICKED
        //check if it this player turn 

        let player_turn = (turn) ? 'white' : 'black';
        console.log('the turn ', turn);

        if (player_turn !== My_color) return;

        if (ini_pos.length === 0) {//first click
            console.log('first click!!!!!')
            //check if the user has clicked on a pieace
            if (typeof Squares[y][x] === 'object') {

                //check the if the user has clicked on one of his piesces
                let turn_copy = (turn) ? 'white' : 'black';
                if (Squares[y][x].color === turn_copy) {

                    //assigning this div as the first click div
                    console.log('first click!!!!!')
                    setFirstClick([y, x])

                    //compute all the possibel positions
                    let possible_positions_copy = possible_squares(Squares, y, x,moves_history.current[moves_history.current.length - 1]);


                    setPossibePositions([...possible_positions_copy]);//the useEffect color the possible positions    
                }
            }
        }
        else { //this div is the second one clicked

            //check if the pieace that palyer choose to take is in same color
            if (typeof Squares[y][x] !== 'number') {

                if (Squares[y][x].color === Squares[ini_pos[0]][ini_pos[1]].color) {
                    console.log('test if the user has clicked on one of his pieces');
                    let possible_positions_copy = possible_squares(Squares, y, x,moves_history.current[moves_history.current.length - 1]);
                    //reassing this swaure as the first clicked square
                    setFirstClick([y, x]);


                    setPossibePositions([...possible_positions_copy]);
                    return
                }
            }

            //cheack is the move is legal
            if (!possible_positions.some(el => el[0] === y && el[1] === x)) {
                console.log('the move is not legeal')
                return
            }

            //make the move
            //copy the square array
            let copy = copy_Square(Squares)
            //delete color possible positions
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
            copy = copy_Square(abstact_move_pieace(copy, ini_pos, y, x))

            //give the turn to the other player   !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            setTurn(!turn);

            //add pieace to square 
            setSquares(() => copy_Square(copy));

            //note : because the Square is still syncing we will use the copy varible
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
            // console.log('opposite king', opposite_king)

            socket.emit('send turn', {
                turn: (turn) ? 'black' : 'white',
                ini_pos: ini_pos,
                fin_pos: [y, x],
                room_name: room_name,
                game_end :{
                                'board':copy,
                                'op_king_pos' : opposite_king
                            }
            })
            console.log('move is sent ', (turn) ? 'black' : 'white')



            //set first click to none
            setFirstClick([]);

        }
    }
    const [select_square, setSelectSquare] = useState([]);
    const color_square = (y, x) => {
        let copy = copy_Square(Squares)

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
        //add pieace to square 
        setSquares(() => copy_Square(copy));

        //color the spesific square 
        setSelectSquare([y, x])
    }

    return (
        <div className="Board-shell">
            <div className="Board-container">
                <aside className="Board-sidebar">
                    <div className="Board-sidebar__card">
                        <h2>Online Chess</h2>
                        <p className="Board-sidebar__label">Your color</p>
                        <p className="Board-sidebar__value">{My_color || 'Waiting...'}</p>
                        <p className="Board-sidebar__label">Room</p>
                        <p className="Board-sidebar__value">{room_name || 'N/A'}</p>
                        <p className="Board-sidebar__label">Current turn</p>
                        <p className="Board-sidebar__value">{turn ? 'White' : 'Black'}</p>
                    </div>

                    <div className="Clock-panel">
                        <div className="Clock-panel__item">
                            <span className="Clock-panel__title">White clock</span>
                            <Clock color="#f8fafc" time={8} isActive={turn} />
                        </div>
                        <div className="Clock-panel__item">
                            <span className="Clock-panel__title">Black clock</span>
                            <Clock color="#111827" time={8} isActive={!turn} />
                        </div>
                    </div>

                    <button className="Board-button" onClick={() => navigate('/')}>Exit to lobby</button>
                </aside>
                <div className="Board-board-box">
                    <div className="Board">
                        {Squares.map((row, index) => {
                            let [color_1, color_2] = (index % 2 === 0) ?
                                ['#F4E9D7', '#D97D55'] :
                                ['#D97D55', '#F4E9D7'];
                            return row.map((col, iindex) => {

                                let color = (iindex % 2 === 0) ?
                                    color_1 :
                                    color_2;

                                return <div key={`${index * 8 + iindex}`} className={`Board-square ${typeof Squares[index][iindex] === 'object' ? 'occupied' : ''}`}
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
                                            '#f87171' :
                                            (typeof Squares[index][iindex] === 'object') ?
                                                (Squares[index][iindex].possible_position === true) ?
                                                    getOppositeColor(color) : color
                                                :
                                                (Squares[index][iindex] === 1) ?
                                                    getOppositeColor(color) : color
                                    }}
                                    onClick={() => {
                                        color_square(index, iindex);
                                        move_pieace(index, iindex, first_click)
                                    }}
                                ></div>

                            })
                        })}
                    </div>
                </div>
            </div>
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
