<template>
  <div role="tablist">

    <div v-for="game in place.games" :key="game.id">
      <b-card no-body class="mb-3 w-100">
        <b-card-header header-tag="header" class="p-0" role="tab">
          <b-btn class="btn" block href="#" v-b-toggle="'gameAccordion' + game.id" variant="white" @touchstart="gameClick(game.id)">
            <div class="d-flex justify-content-between">
              <span>{{mxDateWeekDay(game.date)}}, {{mxDateDayAndMonth(game.date)}}</span>
              <span class="badge badge-primary p-1 m-1" :class="mxAvailableSlots(game.slots) == 0 ? 'badge-danger':''">
                {{mxAvailableSlots(game.slots)}}
              </span>
            </div>
            <div  class="d-flex">
              {{game.timeFrom}} - {{game.timeTo}}              
            </div>
          </b-btn>
        </b-card-header>
        
        <b-collapse :id="'gameAccordion' + game.id" :visible="isExpanded(game.id)"  accordion="game-acc" role="tabpanel">
          <b-card-body class="p-2">
            <Game :game="game" :place="place"/>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>

    <div class="mt-4 mb-3">
      <b-btn v-b-toggle="'collapsePlace' + place.id" variant="outline-primary">
        Информация о площадке
      </b-btn>

      <b-collapse :id="'collapsePlace' + place.id" class="mt-4">
        <b-card>
          <p class="card-text">{{ place.description }}</p>
          <a :href="'https://www.google.com/maps/search/' + place.position +'/'">map</a>
          <b-btn class="mt-2" block href="tg://join?invite=CE3oJA6vM82vZHQXf03yyA" variant="link">
            Чат площаки
          </b-btn>
        </b-card>
      </b-collapse>  
    </div>

  </div>
</template>

<script>

import Game from './Game.vue'
import DateTime from '../mixins/datetime.js'
import GameUtils from '../mixins/game.js'

export default {
  name: 'Playground',
  props: ['place'],
  mixins: [DateTime, GameUtils],
  computed: {
  },
  methods: {
    isExpanded: function (gameId) {
      if (this.mxReturnInfo){
        return gameId === this.mxReturnInfo.gameId
      }

      return this.place.games.length == 1;
    },
    gameClick: function (gameId) {
      this.$router.push({ query: { placeId: this.place.id, gameId: gameId } })
    },
  },
  components: {
    Game,
  },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
