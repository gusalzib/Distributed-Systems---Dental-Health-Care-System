<!-- <script setup>
import { RouterLink, RouterView } from 'vue-router'
</script> -->

<template>

  <div class="navbar">
    <div class="menu-icon-container">
      <img id="menu-icon" class="menu-icon rotated-icon" src="@/assets/drop-down.png" @click="toggle()" alt="menu">
      
    </div>
    <img alt="Vue logo" class="logo" src="@/assets/no-bg-logo1.png" width="250" height="125" @click="toggle()"/>


        <nav id="nav" class="nav">
          <RouterLink class="desktop-header-link" to="/">Home</RouterLink>
          <!-- <RouterLink class="desktop-header-link" to="/my_appointments">My Appointments</RouterLink> -->
          <RouterLink class="desktop-header-link" to="/profile">My profile</RouterLink>
          <RouterLink class="desktop-header-link" to="/new/appointment">New Appointment</RouterLink>
          <!-- <RouterLink class="desktop-header-link" to="/medical_journal">Medical Journal</RouterLink> -->
          <RouterLink class="desktop-header-link" to="/registration">Register</RouterLink>
          <RouterLink class="desktop-header-link" to="/login">Login</RouterLink>
        </nav>


    <div class="notification-icon-container">
      <router-link to="/notifications"><img class="notification-icon" src="@/assets/notification.png" alt="notification" @click="toggleNotifications()"></router-link>
      
      
    </div>
        <!-- <a href="https://www.flaticon.com/free-icons/drop-down-menu" title="drop down menu icons">Drop down menu icons created by sonnycandra - Flaticon</a> -->
        <!-- <a href="https://www.flaticon.com/free-icons/notification" title="notification icons">Notification icons created by Pixel perfect - Flaticon</a> -->
        <!--<a href="https://www.flaticon.com/free-icons/notification" title="notification icons">Notification icons created by Pixel perfect - Flaticon</a>  -->
  </div>
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
      var icon = document.getElementsByClassName('menu-icon')[0];

      if (menu) {
        menu.classList.toggle('open-menu');
        icon.classList.toggle('rotated-icon');
      } 
    },
    toggleNotifications() {
      /*method could be used to switch between an idle notification icon to an active one that has a red dot on top to indicate the 
      existence of new notifications */

      var notification = document.getElementsByClassName('notification-icon');
      console.log(notification)
      notification.src = 'bell.png'
    }
  }
}
</script>

<style>

</style>
