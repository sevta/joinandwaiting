import React , { Component } from 'react'
import ReactDOM from 'react-dom'
import io from 'socket.io-client'
import uuid from 'uuid'

import './app.scss'

class App extends Component {
  constructor(props) {
    super(props)
    this.socket = io()
    this.state = {
      id: '' ,
      socket_id: '',
      username: '',
      waiting: false ,
      startGame: false ,
      players: [] ,
      notification: '',
      inc: 0 ,
      data_ingame: null ,
      win: false
    }
    
    this.socket.on('join' , data => this.handleStartGame(data))
    this.socket.on('send data socket' , data => this.setState({ socket_id: data.data.socket_id }))
    this.socket.on('receive inc' , data => this.setState({ data_ingame : data } , () => console.log(this.state)))
    this.socket.on('win' , data => this.setState({ notification: `${data.players.username} Winner!!` , win: true }))
    this.socket.on('leave' , data => this.leaveRoom(data))
  }

  leaveRoom(data) {
    console.log(data)
    this.setState({ notification: `${data.text} You win` })
  }

  handleStartGame(data) {
    console.log(data)
    this.state.players = [data.players[0].player1 , data.players[0].player2]
    this.setState({ startGame: true , players: this.state.players , notification: 'Game started'} , () => {
      console.log(this.state)
    })
  }

  _increments = () => {
    this.setState({ inc: this.state.inc + 1 } , () => {
      this.socket.emit('inc' , {
        socket_id: this.state.socket_id ,
        inc: this.state.inc ,
        players: [this.state.players[0] , this.state.players[1]]
      })
    })
  }

  _handleChange = e => {
    let key = e.target.name 
    let value = e.target.value
    this.setState({ [key] : value })
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
    const { username , waiting , startGame , players , notification , inc , data_ingame , win} = this.state 

    let allplayer = null


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
                  <h3>{ notification }</h3>
                  <ListPlayer 
                    players={players}
                    isStarted={startGame}
                    onClick={this._increments}
                    data={inc}
                    isWin={win}
                  />
                  {data_ingame !== null && (
                    <ul>
                      <li> <b>{ data_ingame.player1 }</b> {data_ingame.inc1} </li>
                      <li> <b>{ data_ingame.player2 }</b> {data_ingame.inc2} </li>
                    </ul>
                  )}
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

const ListPlayer = ({isWin , players , onClick , data }) => {
  return (
    <div>
      <ul>
        { players.map((player , index) => {
          return <li key={index}>{player.username}</li>
        }) }
      </ul>
      <div className="container">
        <div className="row">
          <div className="col">
            <h1>{data}</h1>
            {isWin ? null : (
              <button className="btn btn-info" onClick={onClick}>Increments</button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

let roots = document.querySelector('#app')
ReactDOM.render(<App /> , roots)