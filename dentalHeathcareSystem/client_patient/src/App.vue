<!-- <script setup>
import { RouterLink, RouterView } from 'vue-router'
</script> -->

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/no-bg-logo1.png" width="250" height="125" @click="toggle()"/>


      <nav id="nav" class="nav">
        <RouterLink class="desktop-header-link" to="/">Home</RouterLink>
        <RouterLink class="desktop-header-link" to="/my_appointments">My Appointments</RouterLink>
        <RouterLink class="desktop-header-link" to="/new/appointment">New Appointment</RouterLink>
        <RouterLink class="desktop-header-link" to="/medical_journal">Medical Journal</RouterLink>
        <RouterLink class="desktop-header-link" to="/registration">Register</RouterLink>
        <RouterLink class="desktop-header-link" to="/login">Login</RouterLink>
      </nav>
  </header>

  <RouterView />
</template>
<script>
import { Api } from './Api'


export default {
  data: () => ({

  }),

  mounted() {

  },
  methods: {
    toggle() {
      var menu = document.getElementsByClassName('nav')[0];
      console.log(menu)
      if (menu) {
        menu.classList.toggle('open-menu');
      } 
      

    }
  }
}
</script>

<style>

</style>
