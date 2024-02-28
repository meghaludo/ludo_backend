import { LudoGameStatus } from "../constants/gameStatus";
import AppDataSource from "../data-source";
import { GameTable } from "../entity/gameTable.entity";
import axios from 'axios';
import { LudoGameResult } from "../entity/ludoGameResult.entity";

export async function updateGameResult() {
    console.log('game result updated');

    const gameTableBattleList = await AppDataSource.getRepository(GameTable).find({
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

        const existingLudoGameResult = await AppDataSource.getRepository(LudoGameResult).findOne({
            where: { game_table_id: battle?.id }
        });

        console.log('adadasdasdasdasdasd', options.params.roomcode != '000000')


        if (options.params.roomcode != '000000') {
            const ludoResponse = await axios.request(options);

            console.log('ludoResponse?.data?.Status', ludoResponse?.data)

            if (ludoResponse?.data?.Status == LudoGameStatus.Running || ludoResponse?.data?.Status == LudoGameStatus.Finished) {
                const payload: any = {
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
                }

                if (existingLudoGameResult) {
                    payload['id'] = existingLudoGameResult['id']
                }

                const updatedData = await AppDataSource.getRepository(LudoGameResult).save(payload);

                // battle['is_checked'] = 1
                battle['game_result_id'] = updatedData?.id

                await AppDataSource.getRepository(GameTable).save(battle);
            }

        }

    }
}