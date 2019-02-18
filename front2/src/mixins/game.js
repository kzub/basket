const mxAvailableSlots = (slots) => {
	const len = slots.filter(s => {
    return s.type === 'empty'
  }).length
  return len
}

const mxReturnInfo = function () {
  const placeId = Number(this.$router.currentRoute.query.placeId)
  const gameId = Number(this.$router.currentRoute.query.gameId)
  const retUrl = this.$router.currentRoute.query.retUrl
  const slotType = this.$router.currentRoute.query.slotType

  return { placeId, gameId, retUrl, slotType }
}

const mxGameInfo = function (placeId, gameId) {
	const place = this.$store.state.places.filter(p => p.id === placeId)[0]

  if (!place) {
    if (this.$store.state.places.length) {
      console.log('no place found', placeId)
      this.$router.push('/')          
    }
    return 
  }

  const game = place.games.filter(g => g.id === gameId)[0]

  if (!game) {
    if (this.$store.state.places.length) {
      console.log('no game found', gameId)
      this.$router.push('/')
    }
    return 
  }

  return { place, game }
}

export default {
	computed: {
    mxReturnInfo,
	},
  methods: {
    mxAvailableSlots,
    mxGameInfo,
  }
}