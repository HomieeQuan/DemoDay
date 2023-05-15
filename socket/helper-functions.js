// #region OUR SOCKET.IO HELPER FUNCTIONS
const moment = require('moment')
const users = []

const userJoin = (id, username, room) => {
    console.log('user joined the room')
  const user = { id, username, room}
  users.push(user)
  return user
  }

  const getCurrentUser = (id) => {
    return users.find(user => user.id === id)
  }

const formatMessage = (username, text) => {
  return {
    username,
    text,
    time: moment().format('h:mm a')
  };
}

const getUsersInRoom = (room) => {
    return users.filter(user => user.room === room)
  }

const userLeave = (id) => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}


module.exports = {
    userJoin,
    getCurrentUser, 
    userLeave,
    getUsersInRoom, 
    formatMessage
  }