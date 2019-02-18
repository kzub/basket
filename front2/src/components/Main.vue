<template>
  <div>
    <Auth/>
    <div role="tablist">
      <div v-for="place in places" :key="place.id">
        <b-card no-body class="mb-2">
          <b-card-header header-tag="header" class="p-1" role="tab">
            <b-btn class="btn-lg" block href="#" v-b-toggle="'placeAccordion' + place.id" variant="primary" @touchstart="placeClick(place)">
              {{place.title}}
            </b-btn>
          </b-card-header>
          
          <b-collapse :id="'placeAccordion' + place.id" :visible="isExpanded(place.id)" accordion="place-acc" role="tabpanel">
            <b-card-body class="p-2">
              <Playground :place="place"/>
            </b-card-body>
          </b-collapse>
        </b-card>
      </div>
    </div>

    <b-btn class="btn-lg mt-4 rounded-0" block href="tg://join?invite=CE3oJA6vM82vZHQXf03yyA" variant="secondary">
        Наш чат в телеграм
    </b-btn>
  </div>
</template>

<script>

import Playground from './Playground.vue'
import Auth from './Auth.vue'
import GameUtils from '../mixins/game.js'
  
export default {
  name: 'Main',
  mixins: [GameUtils],
  components: {
    Playground,
    Auth,
  },
  computed: {
    places () {
      return this.$store.state.places
    },
  },
  methods: {
    isExpanded: function (placeId) {
      if (this.mxReturnInfo) {
        return placeId === this.mxReturnInfo.placeId
      }
      return this.places.length == 1 
    },
    placeClick: function (place) {
      this.$router.push({ query: { placeId: place.id } })
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
