<template>
  <div id="app">
    <transition name="slide">
      <router-view/>
    </transition>
  </div>

</template>

<script>

import VueRouter from 'vue-router'


import Main from './components/Main.vue'
import Admin from './components/Admin.vue'
import Profile from './components/Profile.vue'
import Pay from './components/Pay.vue'
import Reservation from './components/Reservation.vue'

const router = new VueRouter({
  routes :[
    { path: '/', component: Main },
    { path: '/admin', component: Admin },
    { path: '/profile', component: Profile },
    { path: '/pay', name:'pay', component: Pay },
    { path: '/reservation', name:'reservation', component: Reservation },
  ],
})

export default {
  name: 'app',
  components: {
    Main,
    Admin,
    Profile,
    Pay,
  },
  router,
}

</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  /*margin-top: 60px;*/
}

.slide-enter {
  left: 100%;
}
.slide-enter-to {
  left: 0%;
}

.slide-enter-active {
  position: absolute;
  width: 100%;
  transition: left 0.3s;
}

.slide-leave {
  left: 0%;
  opacity: 1.0;
}
.slide-leave-to {
  left: 100%;
  opacity: 0.0;
}

.slide-leave-active {
  position: fixed;
  width: 100%;

  transition: left 0.3s, opacity 0.3s;
}


</style>
