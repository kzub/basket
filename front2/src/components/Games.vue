<template>
  <div role="tablist">

    <div v-for="game in games" :key="game.gameId">
      <b-card no-body class="my-3 w-100">
        <b-card-header header-tag="header" class="p-0" role="tab">
          <b-btn :class="gameBorderColor(game)" block variant="primary" @touchstart="gameClick(game.gameId)">
            <div class="d-flex flex-row  justify-content-between py-1">
              <div class="d-flex flex-column justify-content-start align-items-start">
                <div>
                  {{mxDateWeekDay(game.date)}}, {{mxDateDayAndMonth(game.date)}}
                </div>
                <div>
                  {{game.timeFrom}} - {{game.timeTo}}
                </div>
                <div>
                  {{gameType(game)}}
                </div>
              </div>
              <div class="d-flex flex-column align-items-end">
                <div>
                  <div class="badge px-2 my-1" :class="mxAvailableSlots(game.slots) == 0 ? 'badge-danger' : 'badge-light'">
                    {{mxAvailableSlots(game.slots)}}
                  </div>
                </div>
                <div class="badge px-2 my-1 badge-light w-100">
                  {{ game.place.title }}
                </div>
              </div>
            </div>
          </b-btn>
        </b-card-header>
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
    gameType: function (game) {
      if (game.status === 'poll') {
        return 'Предварительная запись'
      }
      return 'Игра запланирована'
    },
    gameBorderColor: function (game) {
      let mode = '';
      if (game.payment.type === 'manualBook') {
        mode += ' manualBookMode'
      }
      else if (game.payment.type === 'manualPay') {
        mode += ' manualPayMode'
      }
      if (this.$store.state.user && this.$store.state.user.userId === game.organizer.userId) {
        mode += ' userIsAdmin'
      }
      return mode
    },
    isExpanded: function (gameId) {
      if (this.mxReturnInfo.gameId) {
        return gameId === this.mxReturnInfo.gameId
      }
      return this.games.length == 1;
    },
    gameClick: function (gameId) {
      this.$router.push({ 
        path: '/game',
        query: { gameId: gameId } 
      })
    },
  },
  components: {
    Game,
  },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.userIsAdmin {
  /*border: 2px dotted #dc3545;*/
  border-left: 10px solid #dc3545;
}
.manualBookMode {
  /*border-left: 5px solid #dc3545;*/
  background-color: #557aa2;
  border-color: #557aa2;
}
.manualPayMode {
  /*border-left: 5px solid #17a2b8;*/
}
</style>
