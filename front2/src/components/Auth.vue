<template>
  <div class="mb-4">
    <div v-if="!user" class="my-2">
      <img height=32 width=32 src="https://i.pinimg.com/originals/3e/f0/e6/3ef0e69f3c889c1307330c36a501eb12.gif"/>
    </div>
    <div v-else>
      <router-link to="/profile" tag="div">
        <b-btn v-if="user.auth" class="btn-lg rounded-0" block variant="warning">
          {{ user.name }}
        </b-btn>
        <b-btn v-else class="btn-lg rounded-0" block variant="warning">
          Зарегистрироваться
        </b-btn>
      </router-link>
    </div>
  </div>
</template>

<script>


export default {
  name: 'Auth',
  computed: {
    user () {
      return this.$store.state.user
    },
  },
  methods: {
  },
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.user {
  line-height: 32px;
}
</style>
