<template>
  <div>
    <div v-if="!mxAvailableSlots(game.slots)" class="card-title btn-danger rounded my-2 py-2">
      Свободных мест нет
    </div>

    <div no-body class="mb-2 text-left pl-2">
        <div class="d-flex">Организатор: 
          <div class="pl-1">{{ game.organizer.name }}</div>
        </div>        
        <div v-if="game.payment.type == 'prepay'">
          Стоимость: {{ game.payment.amount }} р.
        </div>
        <div v-else-if="game.payment.type == 'preorder'">
          Стоимость зала: {{ game.payment.amount }} р. <br>
          Делится на всех до игры
        </div>
        <div v-else-if="game.payment.type == 'postpay'">
          Стоимость зала: {{ game.payment.amount }} р. <br>
          Делится на всех после игры
        </div>      
    </div>

    <div v-for="(slot, index) in game.slots" :key="index">
      <hr v-if="slot.hr"/>
      <router-link class="d-flex"  v-else :to="goLink(slot, place, game)" tag="div">
        <b-button href="#" class="m-1 slot" :variant="bgColors[slot.type]">
            {{ slot.text }}
            <span v-if="slot.type === 'waitlist'">(запасной)</span>
        </b-button>
        <b-button v-if="slot.userId === user.id" href="#" class="m-2" variant="danger">
          X
        </b-button>
      </router-link>
    </div>

  </div>
</template>

<script>

import GameUtils from '../mixins/game.js'

export default {
  name: 'Game',
  props: ['place', 'game'],
  mixins: [GameUtils],
  data: function() {
    return  {
      bgColors: {
        'empty': 'primary',
        'paid': 'success',
        'reserved': 'warning',
        'waitlist': 'secondary',
        'empty-backup': 'outline-secondary',
      },
    }
  },
  computed: {
    user () {
      return this.$store.state.user
    },
  },
  methods: {
    goLink (slot, place, game) {
      if (slot.type.indexOf('empty') == 0) {
        // book slot
        if (this.$store.state.user && this.$store.state.user.auth) {
          return {
            path: '/pay',
            query: { placeId: place.id, gameId: game.id, slotType: slot.type }
          }
        }
        // redirect to auth page
        return {
          path: '/profile',
          query: { retUrl: '/pay', placeId: place.id, gameId: game.id, slotType: slot.type }
        }
      }
      // do nothing
      return {
        path: '/',
        query: { placeId: place.id, gameId: game.id }
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

</style>
