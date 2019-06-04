import axios from 'axios'

const updateReservation = ({ commit, state }, updateInfo) => {
  setTimeout(function() {
    commit()
  }, 1000)
}

const bookSlot = ({ commit, state }, bookInfo) => {
  console.log(this)
  console.log('woho', bookInfo)
  return axios.post(`/api/v2/book?userId=${state.user.userId}&gameId=${bookInfo.gameId}`, { bookInfo })
  .then((result) => {
    console.log('woho result:', result.data)
    commit('bookSlot', result.data.rsvId)
    throw 'some error'
    return result.data
  }).catch(err => {
    console.log('woho err:', err.message)
  })
}

const updateGamesData = ({ commit, state }) => {
  return axios
    .get(`/api/v2/games`)
    .then(response => {
      console.log('/api/v2/games response:', response.data);
      commit('games', response.data);
    })
    .catch(error => {
      console.log('/api/v2/games error:', error);
      commit('games', []);
    });
};

const getUserInfo = ({ commit, state }) => {
  return axios
    .get(`/api/v2/user`)
    .then(response => {
      console.log('/api/v2/user response:', response.data);
      commit('user', response.data);
    })
    .catch(error => {
      console.log('/api/v2/user error:', error);
    });
};

const init = ({ commit, state, dispatch }) => {
  dispatch('getUserInfo').then(
  dispatch('updateGamesData'))
}

export default {
  updateReservation,
  bookSlot,
  updateGamesData,
  getUserInfo,
  init,
}