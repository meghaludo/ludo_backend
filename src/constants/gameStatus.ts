export const LudoGameStatus = {
    Waiting: 'Waiting',
    Running: 'Running',
    Finished: 'Finished',
    Exit : 'Exit',
    Won : 'Won',
}

export const GameUserStatus = {
    Created : 1,
    Requested : 2,
    Running : 3,
    Completed : 4,
    Cancel : 5
}

export const GameStatus = {
    Created : 1,
    Requested : 2, // waiting
    Running : 3,
    Completed : 4,
    Cancel : 5
}

export const PlayerStatus = {
    Created : 1,
    Requested : 2, // waiting
    Running : 3,
    Completed : 4,
    Cancel : 5,
    Winner : 6,
    Looser : 7
}