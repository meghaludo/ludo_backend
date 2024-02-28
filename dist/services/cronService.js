"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateGameResult = void 0;
const gameStatus_1 = require("../constants/gameStatus");
const data_source_1 = __importDefault(require("../data-source"));
const gameTable_entity_1 = require("../entity/gameTable.entity");
const axios_1 = __importDefault(require("axios"));
const ludoGameResult_entity_1 = require("../entity/ludoGameResult.entity");
async function updateGameResult() {
    console.log('game result updated');
    const gameTableBattleList = await data_source_1.default.getRepository(gameTable_entity_1.GameTable).find({
    // where: { is_checked: 0 }
    });
    const options = {
        method: 'GET',
        url: 'https://ludoking-api-with-result.p.rapidapi.com/rapidapi/results/result/',
        params: {
            roomcode: '000000',
            type: 'classic'
        },
        headers: {
            'X-RapidAPI-Key': 'cdb375f6ccmsh5c088e8ad7ca632p1e0041jsn2fe08856ffac',
            'X-RapidAPI-Host': 'ludoking-api-with-result.p.rapidapi.com'
        }
    };
    for (const battle of gameTableBattleList) {
        console.log(battle);
        options.params.roomcode = battle?.game_code;
        console.log('options', options);
        const existingLudoGameResult = await data_source_1.default.getRepository(ludoGameResult_entity_1.LudoGameResult).findOne({
            where: { game_table_id: battle?.id }
        });
        console.log('adadasdasdasdasdasd', options.params.roomcode != '000000');
        if (options.params.roomcode != '000000') {
            const ludoResponse = await axios_1.default.request(options);
            console.log('ludoResponse?.data?.Status', ludoResponse?.data);
            if (ludoResponse?.data?.Status == gameStatus_1.LudoGameStatus.Running || ludoResponse?.data?.Status == gameStatus_1.LudoGameStatus.Finished) {
                const payload = {
                    Table: ludoResponse?.data?.Table,
                    roomcode: ludoResponse?.data?.roomcode,
                    Status: ludoResponse?.data?.Status,
                    OwnerId: ludoResponse?.data?.OwnerId,
                    Ownername: ludoResponse?.data?.Ownername,
                    OwnerStatus: ludoResponse?.data?.OwnerStatus,
                    UpdateAt: ludoResponse?.data?.UpdateAt,
                    p1_name: ludoResponse?.data?.Player1?.Name,
                    p1_id: ludoResponse?.data?.Player1?.ID,
                    p1_status: ludoResponse?.data?.Player1?.Status,
                    p2_name: ludoResponse?.data?.Player2?.Name,
                    p2_id: ludoResponse?.data?.Player2?.ID,
                    p2_status: ludoResponse?.data?.Player2?.Status,
                    game_table_id: battle?.id,
                };
                if (existingLudoGameResult) {
                    payload['id'] = existingLudoGameResult['id'];
                }
                const updatedData = await data_source_1.default.getRepository(ludoGameResult_entity_1.LudoGameResult).save(payload);
                // battle['is_checked'] = 1
                battle['game_result_id'] = updatedData?.id;
                await data_source_1.default.getRepository(gameTable_entity_1.GameTable).save(battle);
            }
        }
    }
}
exports.updateGameResult = updateGameResult;
