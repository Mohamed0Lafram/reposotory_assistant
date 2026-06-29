//images 
//white
import pawn_w from '../../assets/pieaces_images/pawn_w.png';
import bishop_w from '../../assets/pieaces_images/bishop_w.png';
import knight_w from '../../assets/pieaces_images/knight_w.png';
import rook_w from '../../assets/pieaces_images/rook_w.png';
import queen_w from '../../assets/pieaces_images/queen_w.png';
import king_w from '../../assets/pieaces_images/king_w.png';
//black
import pawn_b from '../../assets/pieaces_images/pawn_b.png';
import bishop_b from '../../assets/pieaces_images/bishop_b.png';
import knight_b from '../../assets/pieaces_images/knight_b.png';
import rook_b from '../../assets/pieaces_images/rook_b.png';
import queen_b from '../../assets/pieaces_images/queen_b.png';
import king_b from '../../assets/pieaces_images/king_b.png';
//game pieaces 
export const Pieaces = [
    {
        color: 'white',
        pieaces: [
            {
                name: 'pawn',
                image: pawn_w,
                position: [
                    [7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7], [7, 8]
                ]
            },
            {
                name: 'bishop',
                image: bishop_w,
                position: [
                    [8, 3], [8, 6]
                ]
            },
            {
                name: 'knight',
                image: knight_w,
                position: [
                    [8, 2], [8, 7]
                ]
            },
            {
                name: 'rook',
                image: rook_w,
                position: [
                    [8, 1], [8, 8]
                ]
            },
            {
                name: 'queen',
                image: queen_w,
                position: [
                    [8, 4]
                ]
            },
            {
                name: 'king',
                image: king_w,
                position: [
                    [8, 5]
                ]
            },

        ]
    },
    {
        color: 'black',
        pieaces: [
            {
                name: 'pawn',
                image: pawn_b,
                position: [
                    [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8]
                ]
            },
            {
                name: 'bishop',
                image: bishop_b,
                position: [
                    [1, 3], [1, 6]
                ]
            },
            {
                name: 'knight',
                image: knight_b,
                position: [
                    [1, 2], [1, 7]
                ]
            },
            {
                name: 'rook',
                image: rook_b,
                position: [
                    [1, 1], [1, 8]
                ]
            },
            {
                name: 'queen',
                image: queen_b,
                position: [
                    [1, 4]
                ]
            },
            {
                name: 'king',
                image: king_b,
                position: [
                    [1, 5]
                ]
            },

        ]
    }
];


