import queue from "./queues.json";


export default function(queueId2){
    
    let tempQueueId = {"id":"failed"};

    for (let i = 0; i < queue.length; i++) {
        if (queue[i].queueId == queueId2) {
            tempQueueId = queue[i]
        }
    }

    if (tempQueueId['id'] === 'failed') {
        tempQueueId['description'] = 'penis'
    } 
    
    return tempQueueId;
}