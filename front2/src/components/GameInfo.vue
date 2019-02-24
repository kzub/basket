<template>
  <div class="mx-2">
    <b-btn class="btn-lg" block href="#" variant="primary">
      {{ game.place.title }}
    </b-btn>
    <b-card-body class="p-2 m-2">
      <h5>
        {{ mxDateWeekDay(game.date) }}, {{ mxDateDayAndMonth(game.date) }}
      </h5>
      <span class="font-weight-bold btn-lg">
        {{game.timeFrom}} - {{game.timeTo}}
      </span>
    </b-card-body>
    <hr/>
    <div no-body class="text-left pl-2">
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
      <hr/>    
    </div>
  </div>
</template>

<script>
import DateTime from '../mixins/datetime.js'
import Organizer from './Organizer.vue'
export default {
  name: 'GameInfo',
  mixins: [DateTime],
  props: ['game'],
  components: {
    Organizer,
  },
}
</script>
