"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerStatus = exports.GameStatus = exports.GameUserStatus = exports.LudoGameStatus = void 0;
exports.LudoGameStatus = {
    Waiting: 'Waiting',
    Running: 'Running',
    Finished: 'Finished',
    Exit: 'Exit',
    Won: 'Won',
};
exports.GameUserStatus = {
    Created: 1,
    Requested: 2,
    Running: 3,
    Completed: 4,
    Cancel: 5
};
exports.GameStatus = {
    Created: 1,
    Requested: 2, // waiting
    Running: 3,
    Completed: 4,
    Cancel: 5
};
exports.PlayerStatus = {
    Created: 1,
    Requested: 2, // waiting
    Running: 3,
    Completed: 4,
    Cancel: 5,
    Winner: 6,
    Looser: 7
};
