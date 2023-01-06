import * as Colyseus from "colyseus.js"; // not necessary if included via <script> tag.
import { Room, Client } from "colyseus.js";
import css from "./style.css";
const client = new Colyseus.Client('ws://localhost:2567');

const tiles = Array.from(document.querySelectorAll('.tile'));
const playerDisplay = document.querySelector('.display-player');
const resetButton = document.querySelector('#reset');
const announcer = document.querySelector('.announcer');
let game_state = true;

client.joinOrCreate("my_room").then(room => {
    console.log(room.sessionId, "joined", room.name);
    let enemyPlayer = '';
    room.onStateChange((state) => {
        for (let i = 0 ; i < tiles.length; i++) {
            tiles[i].innerText = state.board[i];
            tiles[i].classList.add(`player${state.currentPlayer}`);
        }

        if (!state.isGameActive) {
            switch(state.result){
                case 'PLAYERO_WON':
                    announcer.innerHTML = 'Player <span class="playerO">O</span> Won';
                    break;
                case 'PLAYERX_WON':
                    announcer.innerHTML = 'Player <span class="playerX">X</span> Won';
                    break;
                case 'TIE':
                    announcer.innerText = 'Tie';
            }
            announcer.classList.remove('hide');
            game_state = state.isGameActive;
        } else {
            game_state = state.isGameActive;
            announcer.innerHTML = '';
            playerDisplay.classList.remove(`player${state.enemyPlayer}`);
            playerDisplay.innerText = state.currentPlayer;
            playerDisplay.classList.add(`player${state.currentPlayer}`);
        }
    });

    for (let i = 0 ; i < tiles.length; i++) {
        tiles[i].addEventListener('click' , e => {
            if(game_state) room.send('tile-click', i)
        })
    }

    resetButton.addEventListener('click', () => {
        room.send('reset')
        game_state = true;
    });

    room.onMessage("reset", (message) => {
    });

    room.onLeave((code) => {
        room.send('player-leave')
    });
}).catch(e => {
    console.log("JOIN ERROR", e);
});
