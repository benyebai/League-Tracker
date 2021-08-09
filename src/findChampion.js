import unReadable from "./champion.json";


export default function(champId){
    
    let tempChamp = null;

    for (let i in unReadable['data']) {
        if (unReadable['data'][i]['key'] === champId.toString()) {
            tempChamp = unReadable['data'][i]['id']
        }
        
    }

    return tempChamp;
}