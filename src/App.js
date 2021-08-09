import React from "react";
import './App.css';
import axios from 'axios';



class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.onChangeUser = this.onChangeUser.bind(this)
    this.submit = this.submit.bind(this)
  }

  onChangeUser(event){
    this.setState({Username: event.target.value})
    console.log(this.state)
  }

  async submit(event){
    event.preventDefault()

    await axios.post('http://localhost:3002/joker/baby', {url: 'https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/' + this.state.Username})
    
    .then(res => {
      window.location.assign("/gay/" + this.state.Username);
      console.log('better penis')
    })

    .catch(err => {
      console.log('penis')
      window.location.assign("/yourtrash");
    })
  } 
    
  

  render() {
    return (
      <div className="App">
        <div id='title'>
          <h1 id='gaygg'>GAY.GG</h1>
        </div>

        <div className='submitBox'>
          <div className='submitBox2'>
              <form onSubmit={this.submit}>
                  <label>
                      <input type="text" onChange={this.onChangeUser} placeholder="Username" className = "searchBar" />
                  </label>
              </form>
              <button onClick={this.submit} className = "submitButton"><h2>.GG</h2></button>
          </div>
        </div>   
      </div>
    );;
  }
}
  

export default App;
