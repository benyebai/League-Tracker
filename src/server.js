const mongoose = require('mongoose');
const express = require('express');
const axios = require('axios');
require('dotenv').config()
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

var Schema = mongoose.Schema;
var matchHistorySchema = new Schema({
  "matchId": {type: String, required: true},
  "matchData":{type: Object, required:"true"}
});

const Match = mongoose.model("match", matchHistorySchema);


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PUT");
  res.header("Access-Control-Allow-Headers", "url, Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Origin, x-riot-token");
  next();
});

app.get('/jokes/random', (req, res) => {

  axios.get('https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/trismexual',
  {
    headers:{
      "X-Riot-Token": process.env.RIOT_KEY,
    }
  })
    .then((response) => {
      res.json(response.data);
    })
    
    .catch((err) =>{
      console.log("error");
    })

});


app.post('/joker/baby', (req, res) => {

  if(req.body["url"].indexOf("https://americas.api.riotgames.com/lol/match/v5/matches/") != -1 && req.body["url"].indexOf("puuid/") == -1){

    let matchId2 = req.body["url"].replace("https://americas.api.riotgames.com/lol/match/v5/matches/", "");

    Match.findOne({matchId : matchId2}, function(errr, data){
      
      if(errr) return console.error(errr);

      if(data === null){

        axios.get(req.body["url"],
        {
          headers:{
            "X-Riot-Token": process.env.RIOT_KEY,
          }
        })
        .then((response) => {

          currentMatch = new Match({matchId : matchId2, matchData : response.data});
          currentMatch.save();
          
          res.json(response.data);
          return
        })
        .catch((err) =>{

          console.log(err);
          res.status(err.response.status).send("suck cock");
          return
        })

      }
      else{
        res.json(data.matchData);
      }
    });
 
  }
  else{
    axios.get(req.body["url"],
    {
      headers:{
        "X-Riot-Token": process.env.RIOT_KEY,
      }
    })
      .then((response) => {
        res.json(response.data);
      })
      .catch((err) =>{
        console.log("error");
        res.status(err.response.status).send("suck cock");
      })
  }
});



const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`listening on ${PORT}`));