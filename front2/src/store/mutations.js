import axios from 'axios'

const user = (state, p) => state.user = p;

const games = (state, p) => state.games = p;

const returnInfo = (state, p) => state.returnInfo = {...state.returnInfo, ...p};

const updateReservation = (state, rsv) => {
  state.games.filter(g => g.gameId === rsv.gameId)[0]
}

const bookSlot = (state, data) => {
  console.log('bookSlot mutatuon', data)
}

export default {
  user,
  games,
  returnInfo,
  updateReservation,
  bookSlot,
}
