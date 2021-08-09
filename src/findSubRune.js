import unReadable from "./runesReforged.json";


export default function(runeId){
    
    let tempRunes = {"id":"failed"};

    for (let i = 0; i < unReadable.length; i++) {
        if (unReadable[i]['id'] == runeId) {
            tempRunes = unReadable[i]
        }
    }

    return tempRunes;
}