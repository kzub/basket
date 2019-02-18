<template>
  <div>
    <div v-if="!(mxReturnInfo && mxGameInfo(mxReturnInfo.placeId, mxReturnInfo.gameId))" class="my-2">
      <img height=32 width=32 src="https://i.pinimg.com/originals/3e/f0/e6/3ef0e69f3c889c1307330c36a501eb12.gif"/>
    </div>
    <div v-else>
      <b-btn class="btn-lg mb-3 rounded-0" block @click="back" variant="warning">
        Назад
      </b-btn>

      <div class="mb-0">
        <!-- <b-card-header header-tag="header" class="p-1" role="tab"> -->
          <b-btn class="rounded-0 btn-lg" block href="#" variant="primary">
            {{ info.place.title }}
          </b-btn>
        <b-card-body class="p-2">
          <h5>{{mxDateWeekDay(info.game.date)}}, {{mxDateDayAndMonth(info.game.date)}}</h5>
          <span class="font-weight-bold btn-lg">
            {{info.game.timeFrom}} - {{info.game.timeTo}}
          </span>
        </b-card-body>
        <!-- </b-card-header> -->
      </div>

      <b-card no-body>
        <b-card-body>
          <b-form @submit="onPaySubmit">
            <div class="text-left">
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
                              placeholder="Введите телефон"
                              :value="user.phone">
                </b-form-input>
              </b-form-group>
            </div>

            <div v-if="mxReturnInfo.slotType == 'empty-backup'">
              <div class="btn-danger py-1 px-1 rounded">
                Резерв, на случай, если кто-то откажется
              </div>
            </div>
            <div v-else-if="info.game.payment.type == 'prepay'">
              <span class="">
                Стоимость: {{ info.game.payment.amount }} р.
                <span class="form-text small mt-0">(30 минут на оплату)</span>
              </span>
            </div>
            <div v-else-if="info.game.payment.type == 'preorder'">
              <span>
                Стоимость зала: {{ info.game.payment.amount }} р. <br>
              </span>
              Делится на всех до игры
            </div>
            <div v-else-if="info.game.payment.type == 'postpay'">
              <span>
                Стоимость зала: {{ info.game.payment.amount }} р. <br>
              </span>
              Делится на всех после игры
            </div>

            <div class="mt-3">
              <div v-if="mxReturnInfo.slotType == 'empty-backup'">
                <b-btn type="submit" variant="primary btn-lg">Записаться запасным</b-btn>
              </div>
              <div v-else-if="info.game.payment.type == 'prepay'">
                <b-btn type="submit" variant="primary btn-lg">Оплатить</b-btn>
              </div>
              <b-btn v-else type="submit" variant="primary  btn-lg">Забронировать</b-btn>
            </div>
          </b-form>
        </b-card-body>
      </b-card>

      <div class="pl-4 mt-3 text-left">
        <div>Организатор: {{ info.game.organizer.name }}</div>
      </div>

    </div>
  </div>
</template>

<script>

import DateTime from '../mixins/datetime.js'
import GameUtils from '../mixins/game.js'

export default {
  name: 'Pay',
  mixins: [DateTime, GameUtils],
  components: {
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
    info: function() {
      return this.mxGameInfo(this.mxReturnInfo.placeId, this.mxReturnInfo.gameId)
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
          placeId: this.mxReturnInfo.placeId,
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
