const express = require('express')
const app =  express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const bodyParser = require('body-parser')
const path = require('path')
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))
app.set('views' , path.join(__dirname , 'views'))
app.engine('html' , require('ejs').renderFile)
app.set('view engine' , 'html')

app.get('/' , (req , res) => res.render('index'))

http.listen(port , () => console.log(`Server running on port ${port}`))


let users = {}
let gameId = 0

io.on('connection' , socket => {
  console.log('connected')
  console.log(socket.id)
  
  users[socket.id] = {
    socket_id: socket.id ,
    id: null ,
    username: null,
    inGame: null ,
    player: null ,
    gameRoom: null ,
    inc: 0 ,
  }

  socket.on('waiting' , data => {
    socket.userId = data.id
    socket.username = data.username 
    
    users[socket.id].username = data.username 
    users[socket.id].id = data.id

    console.log(users)
    
    socket.join('waiting room')
    
    socket.emit('send data socket' , {
      data: users[socket.id]
    })

    joinAndWaitingPlayers(data.id , data.username)
    console.log('\n')
    console.log('all users' , users)
  })

  socket.on('inc' , data => {
    console.log(data)
    users[data.socket_id].inc = data.inc
    io.sockets.in('game' + users[socket.id].gameRoom).emit('receive inc' , {
      player1: users[data.players[0].socket_id].username ,
      inc1: users[data.players[0].socket_id].inc ,
      inc2: users[data.players[1].socket_id].inc ,
      player2: users[data.players[1].socket_id].username
    })

    if (users[data.socket_id].inc == 10) {
      io.sockets.in('game' + users[socket.id].gameRoom).emit('win' , {
        players: users[data.socket_id] ,
        text: 'winner!'
      })
    }
  })

  socket.on('disconnect' , () => {
    console.log(socket.username , 'disconnect')
    leaveGame(socket)
    delete users[socket.id]
    console.log(users)
  })

})

function leaveGame(socket) {
  if (users[socket.id].inGame !== null) {
    io.in('game' + users[socket.id].gameRoom).emit('leave' , {
      text: `${users[socket.id].username} has left game...`
    })

    users[socket.id].inGame = null
    users[socket.id].player = null 
    users[socket.id].gameRoom = null 

    socket.leave('game' + users[socket.id].gameRoom)
  } else {
    socket.leave('waiting room')
  }
}

function getClients(room , user_id , username) {
  let clients = []
  let rooms = io.sockets.adapter.rooms[room].sockets
  console.log('\n')
  console.log('Object keys' , Object.keys(rooms)[0])
  console.log('room' , io.sockets.adapter.rooms[room].sockets)
  console.log(rooms)
  for (let i in rooms) {
    clients.push(io.sockets.adapter.nsp.connected[i])
    // console.log('connected' ,)
    // console.log('rrom id', io.sockets.adapter.nsp.connected[i] )
  }
  return clients
  console.log('\n')
  console.log('clients' , clients)
}

function joinAndWaitingPlayers(user_id , username) {
  let player = getClients('waiting room', user_id , username)
  console.log('\n')
  console.log('player' , player.length)
  if (player.length == 2) {
    gameId++
    console.log('\n')
    console.log('ready to play' , users , gameId)

    player[0].leave('waiting room')
    player[1].leave('waiting room')

    player[0].join('game' + gameId)
    player[1].join('game' + gameId)

    let tempusers = []

    tempusers.push({
      player1: users[player[0].id] ,
      player2: users[player[1].id] ,
    })

    users[player[0].id].player = 1
    users[player[0].id].inGame = true
    users[player[0].id].gameRoom = gameId 
    users[player[1].id].player = 2
    users[player[1].id].inGame = true
    users[player[1].id].gameRoom = gameId 

    io.sockets.in('game' + gameId).emit('join' , {
      room: gameId ,
      text: 'start games' ,
      players: tempusers
    })
    // player[0].socket_id.leave('waiting room')
    // player[1].socket.id.leave('waiting room')

    console.log('\n')
    console.log('waiting room')

    console.log(io.sockets.adapter.rooms['waiting room'])
  }
  // console.log('get clients' , player)
}
