<template>
  <div>
    <div v-if="!(mxReturnInfo && mxGameInfo(mxReturnInfo.gameId))" class="my-2">
      <div class="d-flex justify-content-center">
        <div class="spinner-border" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>

    <div v-else>
      <b-btn class="btn-lg mb-3 rounded-0" block @click="back" variant="warning">
        Назад
      </b-btn>
      <GameInfo :game="game"/>
      <div v-if="!booking" class="mx-2 mt-5">
        <b-btn class="w-100 btn-lg" @click="bookSlot" variant="success">
          Забронировать
        </b-btn>
      </div>
      <div v-else class="spinner-border" role="status">
        <span class="sr-only">Бронирую...</span>
      </div>
    </div>

    <div>
      <b-modal ref="errModal" title="Ошибка бронирования" ok-variant="danger" ok-title="ОК" cancel-variant="hidden"
        @ok="handleError">
        <h5 class="my-4 text">Не удалось забронировать место, проверьте связь с интернетом и наличие свободных мест</h5>
      </b-modal>
    </div>
  </div>
</template>

<script>

import DateTime from '../mixins/datetime.js'
import GameUtils from '../mixins/game.js'
import Organizer from './Organizer.vue'
import GameInfo from './GameInfo.vue'
import axios from 'axios'

export default {
  name: 'Book',
  mixins: [DateTime, GameUtils],
  components: {
    GameInfo,
  },
  data : function () {
    return {
      booking: false
    };
  },
  computed: {
    game: function() {
      return this.mxGameInfo(this.mxReturnInfo.gameId)
    },
    user () {
      return this.$store.state.user
    },
  },
  methods: {
    back: function() {
      this.$router.push({
        path: '/',
        query: {
          gameId: this.mxReturnInfo.gameId,
        }
      })
    },
    bookSlot: function() {
      this.booking = true
      const { game, user } = this

      this.$store.dispatch('bookSlot', {
        gameId: game.gameId,
        userId: user.userId,
      })
      .then((data) => {
        // console.log('dispatch.then', data)
        this.$router.push({
          path: '/reservation',
          query: {
            gameId: game.gameId,
            rsvId: data.rsvId,
          }
        });
      })
      .catch(error => {
        console.log('/api/v2/book error:', error)
        this.$refs.errModal.show()
      })
      .finally(() => this.booking = false)
    },
    handleError: function () {
      this.$router.push({
          path: '/',
          query: {
            gameId: this.game.gameId,
          }
        });
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

</style>
<style>
.btn-hidden {
  display: none;
}  
</style>
