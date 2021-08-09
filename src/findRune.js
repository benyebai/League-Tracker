import unReadable from "./runesReforged.json";


export default function(runeId){
    
    let tempRunes = {"id":"failed"};

    for (let i = 0; i < unReadable.length; i++) {
        for (let j = 0; j < unReadable[i]['slots'].length; j++) {
            for (let l = 0; l < unReadable[i]['slots'][j]['runes'].length; l++) {
                if (unReadable[i]['slots'][j]['runes'][l]['id'] === runeId) {
                    tempRunes = unReadable[i]['slots'][j]['runes'][l]
                }
            }    
        }
    }

    return tempRunes;
}