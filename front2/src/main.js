import Vue from 'vue'
import VueRouter from 'vue-router'
import Vuex from 'vuex'
import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue)
Vue.use(VueRouter)
Vue.use(Vuex)

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'

Vue.config.productionTip = false


const store = new Vuex.Store({
  state: {
    user: undefined,
    games: [],
  },
  mutations: {
    user: (state, p) => state.user = p,
    games: (state, p) => state.games = p,
    returnInfo: (state, p) => state.returnInfo = {...state.returnInfo, ...p},
    updateReservation: (state, rsv) => {
      state.games.filter(g => g.gameId === rsv.gameId)[0]
    }
  },
  actions: {
    updateReservation({ commit, state }, updateInfo) {
      setTimeout(function() {
        commit()
      }, 1000)
    },
  },
})

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')


setTimeout(() => { 
  console.log('update!')
  let n = JSON.parse(JSON.stringify(serverModel.games[0]))
  n.gameId = 10
  n.organizer.userId = 324
  n.organizer.name = 'Артем Васильев'
  serverModel.games.unshift(n)  

  store.commit('games', serverModel.games)
  store.commit('user', {
    auth: true,
    name: 'Зубков Константин',
    phone: '89166206605',
    userId: 323,
  })
}, 500)

// setInterval(() => {
//   console.log('interval')
//   serverModel.places[0].games[0].slots[0].text = Math.random();
// }, 1000)

var serverModel = {
  games: [
    {
      place: {
        title: 'Манхетенн',
        description: 'м. Дмитровская, проезд дмитровский 2А',
        position: '55.806886,+37.588821',
      },
      gameId: 2,
      timeFrom: '10:00',
      timeTo: '11:00',
      date: '2019-01-21',
      organizer: {
        userId: 323,
        name: 'Зубков Константин',
        phone: '89154729813',
      },
      payment: {
        type: 'prepay', // 'postpay'
        amount: 400,
        walletId: '2323232323',
        message: 'На карту 1111 3333 2222 4444',
      },
      slots: [{
          rsvId: 12312,
          userId: 323,
          text: 'Зубков Константин',
          type: 'paid',
          phone: '89166206605',
        },{
          rsvId: 12318,
          userId: 323,
          text: 'Зубков Константин 2',
          type: 'reserved',
          phone: '89166206605',
        },{
          rsvId: 12313,
          userId: 324,
          text: 'Молотков Денис',
          type: 'reserved',
          phone: '89268212200',
        },{
          text: 'Забронировать',
          type: 'empty',
        },{
          text: 'Забронировать',
          type: 'empty',
        },{
          text: 'Забронировать',
          type: 'empty',
        }
      ]
    },
    {
      place: {
        title: 'Образцова',
        description: 'м. Савеловская, Образцова 14',
        position: '55.806886,+37.588821',
      },
      gameId: 3,
      timeFrom: '18:00',
      timeTo: '19:00',
      date: '2019-01-22',
      organizer: {
        userId: 324,
        name: 'Молотков Денис',
        phone: '89154729813',
      },
      payment: {
        type: 'preorder',
        amount: 4000,
        walletId: '2323232323',
        message: 'На карту 1111 3333 2222 4444',
      },
      slots: [{
          rsvId: 12312,
          userId: 323,
          text: 'Зубков Константин',
          type: 'paid',
        },{
          rsvId: 12313,
          userId: 323,
          text: 'Молотков Денис',
          type: 'reserved',
        },{
          rsvId: 12314,
          userId: 325,
          text: 'Иванов Антон',
          type: 'reserved',
        },{
          rsvId: 12315,
          userId: 326,
          text: 'Горелов Василий',
          type: 'reserved',
        },{
          rsvId: 12316,
          userId: 327,
          text: 'Андрей Гончаров',
          type: 'reserved',
        },{
          text: 'Забронировать',
          type: 'empty',
        },{
          rsvId: 12317,
          userId: 328,
          type: 'waitlist',
          text: 'Иванов Андрей',
        },{
          rsvId: 12318,
          userId: 329,
          type: 'waitlist',
          text: 'Дубов Алексей',
        }
      ]
    },
    {
      place: {
        title: 'Образцова',
        description: 'м. Савеловская, Образцова 14',
        position: '55.806886,+37.588821',
      },
      gameId: 4,
      timeFrom: '09:00',
      timeTo: '10:00',
      date: '2019-01-24',
      organizer: {
        userId: 324,
        name: 'Молотков Денис',
        phone: '89154729813',
      },
      payment: {
        type: 'postpay',
        amount: 4000,
        walletId: '2323232323',
        message: 'на карту 1111 3333 2222 4444',
      },
      slots: [{
          rsvId: 22312,
          userId: 323,
          text: 'Зубков Константин',
          type: 'paid',
        },{
          rsvId: 22313,
          userId: 324,
          text: 'Молотков Денис',
          type: 'reserved',
        },{
          rsvId: 22314,
          userId: 323,
          text: 'Иванов Антон',
          type: 'reserved',
        },{
          text: 'Забронировать',
          type: 'empty',
        },{
          text: 'Забронировать',
          type: 'empty',
        },{
          text: 'Забронировать',
          type: 'empty',
        },{
          type: 'empty-backup',
          text: 'Записаться',
        },
      ]
    }
  ]
}
