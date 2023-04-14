import React from "react";
import './Info.css';
import axios from 'axios';
import  findQueue  from './findGamemode.js' 
import changeTime from './msToMin.js'
import findRune from './findRune.js'
import findSubRune from './findSubRune.js'
import findChampion from "./findChampion.js";
import { Accordion } from "react-bootstrap";
import { useAccordionToggle } from 'react-bootstrap/AccordionToggle';
import 'bootstrap/dist/css/bootstrap.min.css';
import { throwStatement } from "@babel/types";
import { Doughnut } from 'react-chartjs-2';
import { parse } from "dotenv";


function CustomToggle({ children, eventKey, winloss }) {
  const decoratedOnClick = useAccordionToggle(eventKey, () =>
    console.log('totally custom!'),
  );

  return (
    <button
      id={winloss ? "button2" : "button1"}
      onClick={decoratedOnClick}
    >
      <img src='/arrow.png' id='arrow'> 
      </img>
      {children}
    </button>
  );
}


class Info extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        User: this.props.match.params.Username,
        puuid: '',
        id: '',
        name: '',
        profileIcon: '',
        summonerLvl: '',

        rankedSoloInfo:{rank:"unranked", lp:0, tier : "", wins: 0, losses: 0},
        rankedFlexInfo:{rank:"unranked", lp:0, tier : "", wins: 0, losses: 0},

        amtMatches: 0,
        winRate: 0,
        graphInfo: null,
        yourMatchInfo: [],

        allKillPercent: 0,
        allAssists: 0,
        allDeaths: 0,
        allKills: 0,
        recentChampions: [],
        recentRoles: 0,

        mastery: [['none', 0, 0], ['none', 0, 0], ['none', 0, 0]]
        


      }
    }

    
    async componentDidMount() {   
      
     


      
      await axios.post('http://localhost:3002/joker/baby', {url: 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + this.state.User})
    
      .then(res => { 
        this.setState({
          puuid: res.data.puuid,
          id: res.data.id,
          name: res.data.name,
          profileIcon: res.data.profileIconId,
          summonerLvl: res.data.summonerLevel
        })
      
      })

      await axios.post('http://localhost:3002/joker/baby', {url: 'https://na1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/' + this.state.id})
    
      .then(res => { 
        console.log(res)
        
        if (res.data.length > 0) {
          for (let i = 0; i < Math.min(res.data.length, 3); i++) {
            let masterycopy = []
            let champion = findChampion(res.data[i].championId)
            masterycopy.push(champion)
            masterycopy.push(res.data[i].championLevel)
            masterycopy.push(res.data[i].championPoints)
            
            this.state.mastery[i] = masterycopy
            
          }

          console.log(this.state.mastery)
        }
      })

     
      await axios.post('http://localhost:3002/joker/baby', {url: 'https://na1.api.riotgames.com/lol/league/v4/entries/by-summoner/' + this.state.id})
    
      .then(res => { 
        
        let rankedSolo = {rank : "unranked", lp : 0, tier : "", wins: 0, losses: 0};
        let rankedFlex = {rank : "unranked", lp : 0, tier : ""};
        
        
        for (let i = 0; i < res.data.length; i++) {
          if (res.data[i].queueType === "RANKED_FLEX_SR") {
            rankedFlex = {
              rank : res.data[i].tier,
              tier : res.data[i].rank,
              lp : res.data[i].leaguePoints,
              wins: res.data[i].wins,
              losses: res.data[i].losses
            }
          } else {
            rankedSolo = {
              rank : res.data[i].tier,
              tier : res.data[i].rank,
              lp : res.data[i].leaguePoints,
              wins: res.data[i].wins,
              losses: res.data[i].losses
            }
          }
        }  
      

        this.setState({
          rankedSoloInfo : rankedSolo,
          rankedFlexInfo : rankedFlex
        });
        
      })

      await axios.post('http://localhost:3002/joker/baby', {url: 'https://americas.api.riotgames.com/lol/match/v5/matches/by-puuid/' + this.state.puuid + '/ids?start=0&count=10'})
    
      .then(res1 => { 
        console.log(res1)
        this.setState({amtMatches: res1.data.length});
        let wonmatches = 0
        let lossmatches = 0

        let allKills1 = 0
        let allDeaths1 = 0
        let allAssists1 = 0
        let allKillPercent1 = 0

        let championsPlayed = []
        let rolesPlayed = []

        for (let i = 0; i < this.state.amtMatches; i++) {
          let topPart = null
          let container = []
          
          axios.post("http://localhost:3002/joker/baby", {"url": "https://americas.api.riotgames.com/lol/match/v5/matches/" + res1.data[i]})
           
          .then(res => {
            console.log(res)
            for (let i = 0; i < 10; i++) {
              
              // finding your info
              if (res.data.info.participants[i].puuid === this.state.puuid) {

                if (res.data.info.participants[i].win) {
                  wonmatches += 1
                } else {
                  lossmatches += 1
                }

                let team1 = null

                if (res.data.info.participants[i].teamId === 100) {
                  team1 = 0
                } else {
                  team1 = 1
                }
                  
                allKills1 += res.data.info.participants[i].kills
                allDeaths1 += res.data.info.participants[i].deaths
                allAssists1 += res.data.info.participants[i].assists
                allKillPercent1 += ((res.data.info.participants[i].kills + res.data.info.participants[i].assists)/res.data.info.teams[team1].objectives.champion.kills)*100

                championsPlayed.push(res.data.info.participants[i].championName)
                rolesPlayed.push(res.data.info.participants[i].teamPosition)

                let gameMode = JSON.parse(JSON.stringify(findQueue(res.data.info.queueId)));
                
                if(gameMode.description.indexOf("Ranked Flex") !== -1) {
                  gameMode.description = "Ranked Flex";

                } else if(gameMode.description.indexOf("Ranked Solo") !== -1) {
                  gameMode.description = "Ranked Solo";

                } else if(gameMode.description.indexOf("ARAM") !== -1) {
                  gameMode.description = "ARAM";

                } else if(gameMode.description.indexOf("Draft") !== -1) {
                  gameMode.description = "Draft Pick";

                } else if(gameMode.description.indexOf("Blind") !== -1) {
                  gameMode.description = "Blind Pick";

                } else {
                  gameMode.description = "RGM";
                }

                
                
                

                let secondsPassed = (Math.round(new Date().getTime() / 1000)) - (res.data.info.gameCreation/1000);
                let timePassed = ''
                let winOrNot = 'Defeat'
                let win = false

                let duration = changeTime(res.data.info.gameDuration)

                if ((secondsPassed / 60) <= 60) {
                  timePassed = (Math.round(secondsPassed / 60)).toString() + ' min ago'
                } else if ((secondsPassed / 3600) <= 24) {
                  timePassed = Math.round(secondsPassed / 3600).toString() + ' hour ago'
                } else {
                  timePassed = Math.round(secondsPassed / 86400).toString() + ' day ago'
                }

                if (res.data.info.participants[i].win) {
                  winOrNot = 'Victory'
                  win = true
                }
                



                let rune1 = findRune(res.data.info.participants[i].perks.styles[0].selections[0].perk)
                let rune2 = findSubRune(res.data.info.participants[i].perks.styles[1].style)
                
                let team = null

                if (res.data.info.participants[i].teamId === 100) {
                  team = 0
                } else {
                  team = 1
                }
                
                let team1top = []
                let team2top = []
                for (let i = 0; i < 5; i++) {
                  let temp = (
                  <div className='name-champ'>
                    <img src={'/champion/' + res.data.info.participants[i].championName + '.png'} alt='' className='team-icon' />
                    <p className='text-team'>{res.data.info.participants[i].summonerName}</p>
                  </div>
                  )
                  team1top.push(temp)
                }

                for (let i = 5; i < 10; i++) {
                  let temp = (
                  <div className='name-champ'>
                    <img src={'/champion/' + res.data.info.participants[i].championName + '.png'} alt='' className='team-icon' />
                    <p className='text-team'>{res.data.info.participants[i].summonerName}</p>
                  </div>
                  )
                  team2top.push(temp)
                }
                
                topPart = (
                  <div id='match-container' className={win ? "win" : "loss"}>

                    <div id='time-gamemode'>
                      <div id='text1'>
                        <p id='tiny'><b>{gameMode.description}</b></p>
                        <p id='tiny'>{timePassed}</p>
                        <div className='line' />
                        <p id='tiny'><b>{winOrNot}</b></p>
                        <p id='tiny'>{duration}</p>
                      </div>
                    </div>

                    <div id='evenmore'>
                      <div id='yes-container'>

                        <img src={'/champion/' + res.data.info.participants[i].championName + '.png'} alt='' className='champ-icon' />
                        
                        <div id='summoner-spell'>
                          <img src={'/spell/Summoner' + res.data.info.participants[i].summoner1Id + '.png'} alt='' className='spell-icon' />
                          <img src={'/spell/Summoner' + res.data.info.participants[i].summoner2Id + '.png'} alt='' className='spell-icon' />
                        </div>


                        <div id='runes'>
                          <img src={'/' + rune1['icon']} alt='' className='rune-icon' />
                          <img src={'/' + rune2['icon']} alt='' className='rune-icon2' />
                        </div>

                      </div>

                      <p>{res.data.info.participants[i].championName}</p>
                      
                    </div>

                    <div id='KDA'>
                      <div id='text2'>
                        <p className='KDA'><b>{res.data.info.participants[i].kills}</b>/</p>
                        <p className='death'> <b>{res.data.info.participants[i].deaths}</b> </p>
                        <p className='KDA'>/<b>{res.data.info.participants[i].assists}</b></p>
                      </div>

                      <div id='text3'>
                        <p id='KA'>{((res.data.info.participants[i].kills + res.data.info.participants[i].assists) / res.data.info.participants[i].deaths).toFixed(2)}:1 KDA</p>
                      </div>
                    </div>

                    <div id='moreinfo'>
                      <p>level {res.data.info.participants[i].champLevel}</p>
                      <p>{res.data.info.participants[i].totalMinionsKilled + res.data.info.participants[i].neutralMinionsKilled} ({((res.data.info.participants[i].totalMinionsKilled + res.data.info.participants[i].neutralMinionsKilled) / (res.data.info.gameDuration/60000)).toFixed(1)}) CS</p>
                      <p style = {{color:"red"}}>P/KILL {Math.round(((res.data.info.participants[i].kills + res.data.info.participants[i].assists)/res.data.info.teams[team].objectives.champion.kills)*100)}%</p>
                    </div>

                    <div id='items'>
                      <div className='row1'>
                        <img src={'/item/' + res.data.info.participants[i].item0 + '.png'} alt='' className='item-icon' />
                        <img src={'/item/' + res.data.info.participants[i].item1 + '.png'} alt='' className='item-icon' />
                        <img src={'/item/' + res.data.info.participants[i].item2 + '.png'} alt='' className='item-icon' />
                        <img src={'/item/' + res.data.info.participants[i].item6 + '.png'} alt='' className='item-icon' />
                      </div>

                      <div className='row2'>
                        <img src={'/item/' + res.data.info.participants[i].item3 + '.png'} alt='' className='item-icon' />
                        <img src={'/item/' + res.data.info.participants[i].item4 + '.png'} alt='' className='item-icon' />
                        <img src={'/item/' + res.data.info.participants[i].item5 + '.png'} alt='' className='item-icon' />
                      </div>

                      <p>{res.data.info.participants[i].detectorWardsPlaced} control wards</p>
                    </div>

                    <div className='display-others'>
                      <div>
                      {team1top}
                      </div>
                      <div className='team'>
                        {team2top}
                      </div>
                    </div>
                  </div>
                )
                
                let botPart = []
                let team1bottom = []
                let team2bottom = []
                

                let team1HighestDmg = 0
                let team2HighestDmg = 0
                
                for (let i = 0; i < 5; i++) {
                  if (res.data.info.participants[i].totalDamageDealtToChampions > team1HighestDmg) {
                    team1HighestDmg = res.data.info.participants[i].totalDamageDealtToChampions
                  }
                }

                for (let i = 5; i < 10; i++) {
                  if (res.data.info.participants[i].totalDamageDealtToChampions > team2HighestDmg) {
                    team2HighestDmg = res.data.info.participants[i].totalDamageDealtToChampions
                  }
                }

                
                
                for (let i = 0; i < 5; i++) {
                  let rune1 = findRune(res.data.info.participants[i].perks.styles[0].selections[0].perk)
                  let rune2 = findSubRune(res.data.info.participants[i].perks.styles[1].style)
                  let dmgBar = (res.data.info.participants[i].totalDamageDealtToChampions / team1HighestDmg) * 55
                  let win = false

                  if (res.data.info.participants[i].win) {
                    win = true
                  }

                  let temp = (
                    <div className='small-container' id={win ? "win" : "loss"}>
                      <div id='others-info'>

                        <img src={'/champion/' + res.data.info.participants[i].championName + '.png'} alt='' className='champ-icon-others' />

                        <div id='summoner-spell-others'>
                          <img src={'/spell/Summoner' + res.data.info.participants[i].summoner1Id + '.png'} alt='' className='spell-icon-others' />
                          <img src={'/spell/Summoner' + res.data.info.participants[i].summoner2Id + '.png'} alt='' className='spell-icon-others' />
                        </div>


                        <div id='runes-others'>
                          <img src={'/' + rune1['icon']} alt='' className='rune-icon-other' />
                          <img src={'/' + rune2['icon']} alt='' className='rune-icon2-other' />
                        </div>

                      </div>
                        
                      <div className='text4'>
                        <a className='others-text-username' href={"http://localhost:3000/gamer/" + res.data.info.participants[i].summonerName}>{res.data.info.participants[i].summonerName}</a>
                      </div>
                      
                      <div className='text5'>
                        <p className='summoner-lvl'>Level {res.data.info.participants[i].summonerLevel}</p>
                      </div>

                      <div id='kda-other'>
                        <p>{res.data.info.participants[i].kills}/{res.data.info.participants[i].deaths}/{res.data.info.participants[i].assists} ({Math.round(((res.data.info.participants[i].kills + res.data.info.participants[i].assists)/res.data.info.teams[team].objectives.champion.kills)*100)}%)</p>
                      </div>

                      <div className='damage'>
                        <p className='text6'>{res.data.info.participants[i].totalDamageDealtToChampions}</p>
                        <div className='dmg-container'>
                          <div className='dmg-bar' style={{width: dmgBar}}/>
                        </div>
                      </div>

                      <div className='ward'>
                        <p className='text6'>{res.data.info.participants[i].detectorWardsPlaced}</p>
                        <p className='text6'>{res.data.info.participants[i].wardsPlaced} / {res.data.info.participants[i].wardsKilled}</p>
                      </div>

                      <div className='cs'>
                        <p className='text6'>{res.data.info.participants[i].totalMinionsKilled + res.data.info.participants[i].neutralMinionsKilled}</p>
                        <p className='text6'>{((res.data.info.participants[i].totalMinionsKilled + res.data.info.participants[i].neutralMinionsKilled) / (res.data.info.gameDuration/60000)).toFixed(1)}/m</p>
                      </div>

                      <div className='items-others'>
                        <img src={'/item/' + res.data.info.participants[i].item0 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item1 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item2 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item3 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item4 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item5 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item6 + '.png'} alt='' className='item-icon1' />
                      </div>
                        

                    </div>

                    )
                    team1bottom.push(temp)
                  
                } 

                for (let i = 5; i < 10; i++) {
                  let rune1 = findRune(res.data.info.participants[i].perks.styles[0].selections[0].perk)
                  let rune2 = findSubRune(res.data.info.participants[i].perks.styles[1].style)
                  let dmgBar = (res.data.info.participants[i].totalDamageDealtToChampions / team2HighestDmg) * 55
                  let win = false

                  if (res.data.info.participants[i].win) {
                    win = true
                  }

                  let temp = (
                    <div className='small-container' id={win ? "win" : "loss"}>
                      <div id='others-info'>

                        <img src={'/champion/' + res.data.info.participants[i].championName + '.png'} alt='' className='champ-icon-others' />

                        <div id='summoner-spell-others'>
                          <img src={'/spell/Summoner' + res.data.info.participants[i].summoner1Id + '.png'} alt='' className='spell-icon-others' />
                          <img src={'/spell/Summoner' + res.data.info.participants[i].summoner2Id + '.png'} alt='' className='spell-icon-others' />
                        </div>


                        <div id='runes-others'>
                          <img src={'/' + rune1['icon']} alt='' className='rune-icon-other' />
                          <img src={'/' + rune2['icon']} alt='' className='rune-icon2-other' />
                        </div>

                      </div>
                        
                      <div className='text4'>
                        <a className='others-text-username' href={"http://localhost:3000/gamer/" + res.data.info.participants[i].summonerName}>{res.data.info.participants[i].summonerName}</a>
                      </div>
                      
                      <div className='text5'>
                        <p className='summoner-lvl'>Level {res.data.info.participants[i].summonerLevel}</p>
                      </div>

                      <div id='kda-other'>
                        <p>{res.data.info.participants[i].kills}/{res.data.info.participants[i].deaths}/{res.data.info.participants[i].assists} ({Math.round(((res.data.info.participants[i].kills + res.data.info.participants[i].assists)/res.data.info.teams[team].objectives.champion.kills)*100)}%)</p>
                      </div>

                      <div className='damage'>
                        <p className='text6'>{res.data.info.participants[i].totalDamageDealtToChampions}</p>
                        <div className='dmg-container'>
                          <div className='dmg-bar' style={{width: dmgBar}}/>
                        </div>
                      </div>

                      <div className='ward'>
                        <p className='text6'>{res.data.info.participants[i].detectorWardsPlaced}</p>
                        <p className='text6'>{res.data.info.participants[i].wardsPlaced} / {res.data.info.participants[i].wardsKilled}</p>
                      </div>

                      <div className='cs'>
                        <p className='text6'>{res.data.info.participants[i].totalMinionsKilled + res.data.info.participants[i].neutralMinionsKilled}</p>
                        <p className='text6'>{((res.data.info.participants[i].totalMinionsKilled + res.data.info.participants[i].neutralMinionsKilled) / (res.data.info.gameDuration/60000)).toFixed(1)}/m</p>
                      </div>

                      <div className='items-others'>
                        <img src={'/item/' + res.data.info.participants[i].item0 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item1 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item2 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item3 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item4 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item5 + '.png'} alt='' className='item-icon1' />
                        <img src={'/item/' + res.data.info.participants[i].item6 + '.png'} alt='' className='item-icon1' />
                      </div>
                        

                    </div>

                    )
                    team2bottom.push(temp)
                  
                } 
                botPart = (
                  <div id='botpart'>
                    <div className='label'>
                      <p id='label1'>summoner lvl</p>
                      <p id='label2'>KDA</p>
                      <p id='label3'>damage</p>
                      <p id='label4'>wards</p>
                      <p id='label5'>cs</p>
                      <p id='label6'>items</p>
                    </div>
                    {team1bottom}
                    {team2bottom}
                  </div>
                )

                
                container = (
                  <div id='main'>
                  <Accordion>
                    <div id='gamer'>
                    {topPart}
                      <CustomToggle eventKey="0" winloss={win}>

                      </CustomToggle>
                    </div>
                    <Accordion.Collapse eventKey="0">
                      <div>
                        {botPart}
                      </div>
                    </Accordion.Collapse>
                  </Accordion>
                  </div>



                )
                break
              }
            }


            let fakeYourMatchInfo = this.state.yourMatchInfo
            fakeYourMatchInfo[i] = (container)


            let graphinfoCopy = {
              labels: ['Matches Won', 'Matches lost'],
              datasets: [

                {
                  data: [wonmatches, lossmatches],
                  backgroundColor: [
                    'rgba(204, 238, 253)',
                    'rgba(252, 191, 191)'
                  ],
                  borderColor: [
                    'rgba(204, 238, 253)',
                    'rgba(252, 191, 191)'
                  ],
                  borderWidth: 1,
                }

              ],
            };
            
            let winRateCopy = (
              wonmatches / (lossmatches + wonmatches)
            )


            let champions = {}
            
            for (let i = 0; i < 10; i++) {
              if (championsPlayed[i] in champions === false) {
                champions[championsPlayed[i]] = 1
              } else {
                champions[championsPlayed[i]] += 1
              }
            }

            let lanes = {}
            
            for (let i = 0; i < 10; i++) {
              if (rolesPlayed[i] in lanes === false) {
                lanes[rolesPlayed[i]] = 1
              } else {
                lanes[rolesPlayed[i]] += 1
              }
            }


            let biggest = {
              0: [],
              1: [],
              2: []
            }

            for (let j = 0; j < 3; j++) {
              let bigChamp = ''
              let counter = 0

              for (let i in champions) {
                if (champions[i] > counter) {
                  counter = champions[i]
                  bigChamp = i
                }
              } 

              biggest[j.toString()].push(bigChamp)         
              biggest[j.toString()].push(champions[bigChamp])
              delete champions[bigChamp]
           }

           let biggestRole = {
            0: [],
            1: [],
            2: []
            }

          for (let j = 0; j < 3; j++) {
            let bigRole = ''
            let counter = 0

            for (let i in lanes) {
              if (lanes[i] > counter) {
                counter = lanes[i]
                bigRole = i
              }
            } 

            biggestRole[j.toString()].push(bigRole)         
            biggestRole[j.toString()].push(lanes[bigRole])
            delete lanes[bigRole]
          }

          console.log(biggestRole)

            

            let recent = (
              
                  <div className='recent'>
                    <div className='box1'>
                      <img src={'/champion/' + biggest['0'][0] + '.png'} alt='' className='champ-icon-recent' />
                      <h3 className='boxtext1'>{biggest['0'][0]} <br /> {(biggest['0'][1]/10)*100}%</h3>
                    </div>

                    <div className='box1'>
                      <img src={'/champion/' + biggest['1'][0] + '.png'} alt='' className='champ-icon-recent' />
                      <h3 className='boxtext1'>{biggest['1'][0]} <br /> {(biggest['1'][1]/10)*100}%</h3>
                    </div>

                    <div className='box1'>
                      <img src={'/champion/' + biggest['2'][0] + '.png'} alt='' className='champ-icon-recent' />
                      <h3 className='boxtext1'>{biggest['2'][0]} <br /> {(biggest['2'][1]/10)*100}%</h3>
                    </div>
                  </div>
              
            )

            let recentRole = (
              <div className='recent'>
                <div className='box2'>
                  <img src={'/roles/' + biggestRole['0'][0] + '.png'} alt='' className='champ-icon-recent' /> 
                  <p className='margin0'>{biggestRole['0'][0]} {(biggestRole['0'][1] / 10) * 100}%</p>
                </div>
                <div className='box2'>
                  <img src={'/roles/' + biggestRole['1'][0] + '.png'} alt='' className='champ-icon-recent' /> 
                  <p className='margin0'>{biggestRole['1'][0]} {(biggestRole['1'][1] / 10) * 100}%</p>
                </div>

                <div className='box2'>
                  <img src={'/roles/' + biggestRole['2'][0] + '.png'} alt='' className='champ-icon-recent' /> 
                  <p className='margin0'>{biggestRole['2'][0]} {(biggestRole['2'][1] / 10) * 100}%</p>
                </div>
              </div>
            )

            this.setState({graphInfo: graphinfoCopy})
            this.setState({winRate: winRateCopy})
            this.setState({yourMatchInfo: fakeYourMatchInfo})
            
            this.setState({allKills: allKills1 / 10})
            this.setState({allDeaths: allDeaths1 / 10})
            this.setState({allAssists: allAssists1 / 10})
            this.setState({allKillPercent: allKillPercent1 / 10})
            this.setState({recentChampions: recent})
            this.setState({recentRoles: recentRole})



          })
          
        }
        
      


      })

    }



    

    render() {

      return (
        <div id='god'>
        <div className='Info'>


          <div className="info-container">
            <img src={'/profileicon/' + this.state.profileIcon + '.png'} alt='' className='profileIcon' />
            <div className='name-container'>
            <h2 id='name' >{this.state.name}</h2>
            </div>

            <div className='mastery-container'>
              <div className='smallmastery'>
                <h3 id='h3' className='margin0'>Mastery Point</h3>
                <h3 className='margin0 h3'>{this.state.mastery[1][2]}</h3>
                <img src={'/champion/' + this.state.mastery[1][0] + '.png'} alt='' className='smallmasterychamp'/>
                <img src={'/championmastery/Champion_Mastery_Level_' + this.state.mastery[1][1].toString() + '_Flair.png'} alt='' className='smallmasteryicon'/>
              </div>

              <div className='bigmastery'>
              <h3 id='h3' className='margin0'>Mastery Point</h3>
                <h3 className='margin0 h3'>{this.state.mastery[0][2]}</h3>
                <img src={'/champion/' + this.state.mastery[0][0] + '.png'} alt='' className='bigmasterychamp'/>
                <img src={'/championmastery/Champion_Mastery_Level_' + this.state.mastery[0][1].toString() + '_Flair.png'} alt='' className='bigmasteryicon'/>
              </div>

              <div className='smallmastery'>
              <h3 id='h3' className='margin0'>Mastery Point</h3>
                <h3 className='margin0 h3'>{this.state.mastery[2][2]}</h3>
                <img src={'/champion/' + this.state.mastery[2][0] + '.png'} alt='' className='smallmasterychamp'/>
                <img src={'/championmastery/Champion_Mastery_Level_' + this.state.mastery[2][1].toString() + '_Flair.png'} alt='' className='smallmasteryicon'/>
              </div>
            </div>
          </div>

          <div id='body'>

            <div id='ranks'>
              <div className='solo-rank'>
                <img src={'/ranked-emblems/Emblem_' + this.state.rankedSoloInfo.rank + '.png'} alt='' className='solo-rank-icon' />

                <div className='solo-rank-text'>
                  <p className='okimpissed'>Ranked solo/duo</p>
                  <h3 >{this.state.rankedSoloInfo.rank} {this.state.rankedSoloInfo.tier}</h3>
                  <p><b>{this.state.rankedSoloInfo.lp} LP</b> / {this.state.rankedSoloInfo.wins}W {this.state.rankedSoloInfo.losses}L</p>
                  <p>Win Ratio {Math.round((this.state.rankedSoloInfo.wins/(this.state.rankedSoloInfo.wins + this.state.rankedSoloInfo.losses)) * 100)}%</p>

                </div>
              </div>

              <div className='flex-rank'>
                <img src={'/ranked-emblems/Emblem_' + this.state.rankedFlexInfo.rank + '.png'} alt='' className='flex-rank-icon' />

                <div className='flex-rank-text'>
                  <p className='okimpissed'>Ranked flex</p>
                  <h3 >{this.state.rankedFlexInfo.rank} {this.state.rankedFlexInfo.tier}</h3>
                  <p><b>{this.state.rankedFlexInfo.lp} LP</b> / {this.state.rankedFlexInfo.wins}W {this.state.rankedFlexInfo.losses}L</p>
                  <p>Win Ratio {Math.round((this.state.rankedFlexInfo.wins/(this.state.rankedFlexInfo.wins + this.state.rankedFlexInfo.losses)) * 100)}%</p>

                </div>
              </div>

              
            </div>
            
            <div>
              <div className='betterinfo recent1'>
                <div className='matchstats'>
                  <div className='chart'>
                    <div className='chart2'>
                    <Doughnut data={this.state.graphInfo} />
                    </div>

                    <div className='winrate'>
                      {(this.state.winRate*100).toFixed(0)}%
                    </div>
                  </div>

                  <div className='allgameskda'>
                    <div id='flex'>
                      <p className='margin0'>{this.state.allKills} /&nbsp;</p>
                      <p style = {{color:"rgb(209, 39, 39)"}} className='margin0'> {this.state.allDeaths} </p>
                      <p className='margin0'>&nbsp;/ {this.state.allAssists}</p>
                    </div>

                    <div id='flex'>
                      <h2 className='smallerh2' style = {{color:"rgb(0, 0, 0)"}}>{((this.state.allAssists + this.state.allKills) / this.state.allDeaths).toFixed(2)}:1</h2>
                      <h2 style = {{color:"rgb(209, 39, 39)"}} className='smallerh2'> &nbsp;({this.state.allKillPercent.toFixed(0)}%)</h2>
                    </div>
                  </div>
                </div>

                <div className='recentChamps'>
                  {this.state.recentChampions}
                </div>

                <div className='recentRoles'>
                  {this.state.recentRoles}
                </div>
                

              </div>

              <div id='matches'>
                {this.state.yourMatchInfo}
              </div>
            </div>


          </div>  

        </div>
        </div>
      );
    }
  }
    
  
  export default Info;
