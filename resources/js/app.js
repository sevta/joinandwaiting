import React , { Component } from 'react'
import ReactDOM from 'react-dom'
import io from 'socket.io-client'
import uuid from 'uuid'

class App extends Component {
  constructor(props) {
    super(props)
    this.socket = io()
    this.state = {
      id: '' ,
      username: '',
      waiting: false ,
      startGame: false ,
      players: []
    }
    
    this.socket.on('join' , data => this.handleStartGame(data))
  }

  handleStartGame(data) {
    console.log(data)
    for (let i in data.players) {
      this.state.players.push(data.players[i])
    }
    this.setState({ startGame: true , players: data.players} , () => {
      console.log(this.state)
    })
  }

  _handleChange = e => {
    let key = e.target.name 
    let value = e.target.value
    this.setState({ [key] : value } , () => console.log(this.state))
  }

  toWaitingRoom = () => {
    const { id , username } = this.state
    this.socket.emit('waiting' , {
      id , username 
    })
  }

  _handlePress = e => {
    const { username } = this.state
    if (e.key == 'Enter') {
        if (username == '') {
          alert('ga bole kosong dlu broh')
        } else {
          this.setState({ id: uuid.v1() } , () => {
            this.toWaitingRoom()
            this.setState({ waiting: true })
            console.log(this.state)
          })
        }
    }
  }

  render() {
    const { username , waiting , startGame , players } = this.state 

    let allplayer = null

    if (startGame) {
      allplayer = players[0]
      // let mapplayer = players[0].map((player) => player)
      // console.log(mapplayer)
    }


    const renderWaiting = waiting ?   
      <p>waiting for player..</p> : 
      <Input name='username' onChange={this._handleChange} 
      onKeyPress={this._handlePress}
      /> 

    return (
      <div className='container'>
        <div className='row'>
          <div className="col-12">
            <h1>join and waiting</h1>
          </div>
          <div className="col-4">
            {
              startGame ? (
                <div>
                  <h3>game started</h3>
                  
                </div>
              ): renderWaiting
            }
          </div>
        </div>
      </div>
    )
  }
}

const Input = ({name , onChange , onKeyPress}) => (
  <div className="form-group">
    <input type="text" className='form-control' onKeyPress={onKeyPress} name={name} onChange={onChange} placeholder='your name...'/>
  </div>
)

let roots = document.querySelector('#app')
ReactDOM.render(<App /> , roots)