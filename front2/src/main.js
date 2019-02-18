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
    places: [],
  },
  mutations: {
    user: (state, p) => state.user = p,
    places: (state, p) => state.places = p,
    returnInfo: (state, p) => state.returnInfo = {...state.returnInfo, ...p}
  }
})

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')


setTimeout(() => { 
  console.log('update!')
  store.commit('places', serverModel.places)
  store.commit('user', {
    auth: true,
    name: 'Зубков Константин',
    phone: '89166206605',
    id: 324242,
  })
}, 500)

// setInterval(() => {
//   console.log('interval')
//   serverModel.places[0].games[0].slots[0].text = Math.random();
// }, 1000)

var serverModel = {
  places: [{
      id: 1,
      title: 'Манхетенн',
      description: 'м. Дмитровская, проезд дегева 2А',
      position: '55.806886,+37.588821',
      games: [{
          id: 1,
          timeFrom: '09:00',
          timeTo: '10:00',
          date: '2019-01-21',
          organizer: {
            id: 1,
            name: 'Зубков Константин',
            contact: '+79154729813',
          },
          payment: {
            type: 'prepay', // 'postpay'
            // allowed: true,
            amount: 400,
            walletId: '2323232323',
            message: 'На карту 1111 3333 2222 4444',
          },
          slots: [{
              id: 323,
              text: 'Зубков Константин',
              type: 'paid',
            },{
              id: 324,
              text: 'Молотков Денис',
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
              hr: true,
            },{
              type: 'empty-backup',
              text: 'Запас',
            },
          ]
        }
      ], 
    },
    //-----------
    {
      id: 2,
      title: 'Образцова',
      description: 'м. Дмитровская, проезд дегева 2А',
      position: {
        lat:232323,
        lon:111111
      },
      games: [{
          id: 2,
          timeFrom: '10:00',
          timeTo: '11:00',
          date: '2019-01-21',
          organizer: {
            id: 1,
            name: 'Зубков Константин',
            contact: '+79154729813',
          },
          payment: {
            type: 'postpay',
            amount: 4000,
            walletId: '2323232323',
            message: 'на карту 1111 3333 2222 4444',
          },
          slots: [{
              id: 323,
              text: 'Зубков Константин',
              type: 'paid',
            },{
              id: 324,
              text: 'Молотков Денис',
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
              hr: true,
            },{
              type: 'empty-backup',
              text: 'Запас',
            },{
              type: 'empty-backup',
              text: 'Запас',
            }]
        },
        {
          id: 3,
          timeFrom: '18:00',
          timeTo: '19:00',
          date: '2019-01-21',
          organizer: {
            id: 1,
            name: 'Зубков Константин',
            contact: '+79154729813',
          },
          payment: {
            type: 'preorder',
            amount: 4000,
            walletId: '2323232323',
            message: 'На карту 1111 3333 2222 4444',
          },
          slots: [{
              id: 323,
              text: 'Зубков Константин',
              type: 'paid',
            },{
              id: 324,
              text: 'Молотков Денис',
              type: 'reserved',
            },{
              text: 'Иванов Антон',
              type: 'reserved',
            },{
              text: 'Горелов Василий',
              type: 'reserved',
            },{
              text: 'Андрей Гончаров',
              type: 'reserved',
            },{
              hr: true,
            },{
              type: 'waitlist',
              text: 'Иванов Андрей',
            },{
              type: 'waitlist',
              text: 'Дубов Алексей',
            }]
        },
      ], 
    },
  ]
}
