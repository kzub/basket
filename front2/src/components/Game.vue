<template>
  <div>
    <div v-if="!mxAvailableSlots(game.slots)" class="card-title btn-danger rounded mt-2 mb-3 py-2">
      Свободных мест нет
    </div>

    <div v-if="isAdmin" class="m-1 p-2 rounded btn-danger">
      Режим администратора
    </div>

    <div>
      <div class="text-left m-2">Список игроков:</div>
      <div v-for="(slot, index) in game.slots" :key="'p'+index">
        <div v-if="!isBackupPlayer(slot)">
          <router-link class="d-flex" :to="goLink(game, slot)" tag="div">
            <b-button href="#" class="m-1 slot" :variant="bgColors[slot.type]">
              {{ slot.text }}
            </b-button>
            <div v-if="modifyAllowed(game, slot)" class="arrow">
              <i class="right"></i>
            </div>
          </router-link>
        </div>
      </div>
      
      <div v-if="backupPlayersExist(game)">
        <hr/>
        
        <div class="text-left m-2">Список запасных:</div>
        <div v-for="(slot, index) in game.slots" :key="'r'+index">
          <div v-if="isBackupPlayer(slot)">
            <router-link class="d-flex" :to="goLink(game, slot)" tag="div">
              <b-button href="#" class="m-1 slot" :variant="bgColors[slot.type]">
                {{ slot.text }}
              </b-button>
              <div v-if="modifyAllowed(game, slot)" class="arrow">
                <i class="right"></i>
              </div>
            </router-link>
          </div>
        </div>
      </div>
      
      <hr/>
      
      <div no-body class="mb-2 text-left pl-2">
        <Organizer :name="game.organizer.name" :phone="game.organizer.phone" />

        <div v-if="game.payment.type == 'prepay'">
          Стоимость: {{ game.payment.amount }} р.
        </div>
        <div v-else-if="game.payment.type == 'preorder'">
          Стоимость зала: {{ game.payment.amount }} р. <br>
          Делится на всех <span class="font-weight-bolder font-italic text-danger">до</span> игры
        </div>
        <div v-else-if="game.payment.type == 'postpay'">
          Стоимость зала: {{ game.payment.amount }} р. <br>
          Делится на всех <span class="font-weight-bolder font-italic text-danger">после</span> игры
        </div>      
      </div>

      <div class="mt-4 mb-5">
        <b-btn v-b-toggle="'collapsePlace' + game.gameId" variant="outline-primary">
          Информация о площадке
        </b-btn>

        <b-collapse :id="'collapsePlace' + game.gameId" class="mt-4">
            <p class="card-text">{{ game.place.description }}</p>
            <a :href="'https://www.google.com/maps/search/' + game.place.position +'/'">Координаты входа</a>
            <b-btn class="mt-2" block href="tg://join?invite=CE3oJA6vM82vZHQXf03yyA" variant="link">
              Чат площаки
            </b-btn>
        </b-collapse>  
      </div>

    </div>
  </div>
</template>

<script>

import GameUtils from '../mixins/game.js'
import Organizer from './Organizer.vue'

export default {
  name: 'Game',
  props: ['game'],
  mixins: [GameUtils],
  components: {
    Organizer,
  },
  data: function() {
    return  {
      bgColors: {
        'empty': 'primary',
        'paid': 'success',
        'reserved': 'warning',
        'waitlist': 'secondary',
        'empty-backup': 'secondary',
      },
    }
  },
  computed: {
    isAdmin () {
      return this.$store.state.user.userId === this.game.organizer.userId
    },
    user () {
      return this.$store.state.user
    },
  },
  methods: {
    modifyAllowed (game, slot) {
      if (slot.type.indexOf('empty') == 0) {
        return false
      }
      return (this.user.userId == slot.userId) || this.isAdmin
    },
    isBackupPlayer (slot) {
      return ['waitlist', 'empty-backup'].includes(slot.type)
    },
    backupPlayersExist (game) {
      return game.slots.some(s => this.isBackupPlayer(s))
    },
    goLink (game, slot) {
      if (slot.type.indexOf('empty') == 0) {
        if (this.$store.state.user && this.$store.state.user.auth) {
          return {
            // book slot
            path: '/pay',
            query: { gameId: game.gameId, slotType: slot.type }
          }
        }
        return {
          // redirect to auth page
          path: '/profile',
          query: { retUrl: '/pay', gameId: game.gameId, slotType: slot.type }
        }
      }

      if (!this.modifyAllowed(game, slot)) {
        return {
          // do nothing
          path: '/',
          query: { gameId: game.gameId }
        }
      }

      if (this.$store.state.user && this.$store.state.user.auth) {
        return {
          // book slot
          path: '/reservation',
          query: { gameId: game.gameId, rsvId: slot.rsvId }
        }
      }
      return {
        // redirect to auth page
        path: '/profile',
        query: { retUrl: '/reservation', gameId: game.gameId, rsvId: slot.rsvId }
      }
    }
  },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.game {
  border: 1px solid black;
  margin: 1px;
}
.slot {
  width: 100%;
}

.arrow {
  position: absolute;
  margin-left: 85%;
  margin-top: 9px;
}

i {
  border: solid black;
  border-width: 0 3px 3px 0;
  display: inline-block;
  padding: 3px;
}

.right {
  transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
}

</style>
