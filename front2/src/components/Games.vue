<template>
  <div role="tablist">

    <div v-for="game in games" :key="game.gameId">
      <b-card no-body class="my-3 w-100">
        <b-card-header header-tag="header" class="p-0" role="tab">
          <b-btn :class="userRole(game)" block href="#" variant="primary"
          v-b-toggle="'gameAccordion' + game.gameId" @touchstart="gameClick(game.gameId)">
            <div class="d-flex flex-row  justify-content-between py-1">
              <div class="d-flex flex-column justify-content-start align-items-start">
                <div>
                  {{mxDateWeekDay(game.date)}}, {{mxDateDayAndMonth(game.date)}}
                </div>
                <div>
                  {{game.timeFrom}} - {{game.timeTo}}              
                </div>
              </div>
              <div class="d-flex flex-column align-items-end">
                <div class="badge px-2 my-1" 
                :class="mxAvailableSlots(game.slots) == 0 ? 'badge-danger' : 'badge-light'">
                  {{mxAvailableSlots(game.slots)}}
                </div>
                <div class="badge px-2 my-1 badge-light w-100">
                  {{ game.place.title }}
                </div>
              </div>
            </div>
          </b-btn>
        </b-card-header>
        
        <b-collapse :id="'gameAccordion' + game.gameId" :visible="isExpanded(game.gameId)"  accordion="game-acc" role="tabpanel">
          <b-card-body class="p-2">
            <Game :game="game"/>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>

  </div>
</template>

<script>

import Game from './Game.vue'
import DateTime from '../mixins/datetime.js'
import GameUtils from '../mixins/game.js'

export default {
  name: 'Games',
  props: ['games'],
  mixins: [DateTime, GameUtils],
  computed: {
  },
  methods: {
    userRole: function (game) {
      if (this.$store.state.user && this.$store.state.user.userId === game.organizer.userId) {
        return 'admin'
      }
    },
    isExpanded: function (gameId) {
      if (this.mxReturnInfo.gameId) {
        return gameId === this.mxReturnInfo.gameId
      }
      return this.games.length == 1;
    },
    gameClick: function (gameId) {
      this.$router.push({ query: { gameId: gameId } })
    },
  },
  components: {
    Game,
  },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.admin {
  border-left: 5px solid red;
}
</style>
