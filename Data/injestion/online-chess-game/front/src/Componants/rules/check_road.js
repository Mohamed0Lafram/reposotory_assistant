//cheack weather the road from first click to second click is empty or not
export default function check_road (Squares, first_click, x,y) {//[y,x] represent the second click coordination (awnser the question is the road empty yes or no)
    //VERITCAL (SAME X)
    if (x === first_click[1]) {
        ////get all the square in between and if one of them in not empty return
        let small_y_copy = (y > first_click[0]) ?
            first_click[0] : y;

        let distance = Math.abs(y - first_click[0]);

        //check if all the places are empty
        for (let i = 1; i < distance; i++) {
            if (typeof Squares[small_y_copy + i][x] !== 'number') {
                return  false;
            }
        }
    }
    /////horizental (same y)
    else if (y === first_click[0]) {

        ////get all the square in between and if one of them in not empty return
        let small_x_copy = (x > first_click[1]) ?
            first_click[1] :
            x;
        let distance = Math.abs(x - first_click[1]);

        //check if all the places are empty
        for (let i = 1; i < distance; i++) {
            if (typeof Squares[y][small_x_copy + i] !== 'number') {
                //console.log('TEST HORIZENTAL 1: THIS SQUARE IS FULL ',Squares[y][small_x_copy + i],typeof Squares[y][small_x_copy + i])
                return false;
            }
        }

    }
    ///diagonal (x1-x2) === (y1 -y2)
    else if (Math.abs(x - first_click[1]) === Math.abs(y - first_click[0])) {

        ////get all the square in between and if one of them in not empty return
        /////select the smallest y coordiantion 
        let [[y_copy, x_copy], x_other] = (y > first_click[0]) ?
            [first_click, x] : [[y, x], first_click[1]]; // y_copy -> smallest y coordination ; x_copy -> x cordination of the smallest y ; x_other -> the other x coordination

        let distance = Math.abs(x - first_click[1]);

        //check if all the places are empty
        for (let i = 1; i < distance; i++) {
            console.log(y_copy, (x_copy > x_other) ? x_copy - i : x_copy)
            if (typeof Squares[y_copy + i][
                (x_copy > x_other) ? x_copy - i : x_copy + i
            ] !== 'number') {
                return false;
            }
        }
    }

    return true;
}