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
      
      <b-card-body>
        <b-form @submit="onPaySubmit">
          <div class="text-left">
            Участник:
            <b-form-group id="userName"
                          label-for="userName"
                          description="Необходимо для прохода на площадку">
              <b-form-input id="userName"
                            type="text"
                            v-model="form.name"
                            required
                            placeholder="Фамилия и имя"
                            :value="user.name">
              </b-form-input>
            </b-form-group>
            <b-form-group id="phoneNumber"
                          label-for="userPhone"
                          description="Для связи, в случае каких-либо изменений">
              <b-form-input id="userPhone"
                            type="number"
                            v-model="form.phone"
                            required
                            disabled
                            placeholder="Введите телефон"
                            :value="user.phone">
              </b-form-input>
            </b-form-group>
          </div>

          <div v-if="mxReturnInfo.slotType == 'empty-backup'">
            <div class="btn-danger py-1 px-1 my-2 rounded">
              Резерв, если кто-то откажется
            </div>
          </div>

          <div class="mt-3 mb-4">
            <div v-if="mxReturnInfo.slotType == 'empty-backup'">
              <b-btn type="submit" variant="secondary btn-lg">Стать запасным</b-btn>
            </div>
            <div v-else-if="game.payment.type == 'prepay'">
              <b-btn v-if="isAdmin" type="submit" variant="danger">Записать без оплаты</b-btn>
              <b-btn v-else type="submit" variant="success btn-lg">Оплатить</b-btn>
            </div>
            <b-btn v-else type="submit" variant="success btn-lg">Забронировать</b-btn>
          </div>
        </b-form>
      </b-card-body>
    
    </div>
  </div>
</template>

<script>

import DateTime from '../mixins/datetime.js'
import GameUtils from '../mixins/game.js'
import Organizer from './Organizer.vue'
import GameInfo from './GameInfo.vue'

export default {
  name: 'Pay',
  mixins: [DateTime, GameUtils],
  components: {
    GameInfo,
  },
  data () {
    return {
      form: {
        phone: '',
        name: '',
        code: '',
      },
    }
  },
  computed: {
    isAdmin () {
      return this.$store.state.user.userId === this.game.organizer.userId
    },
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
    onPaySubmit: function () {

    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

</style>
