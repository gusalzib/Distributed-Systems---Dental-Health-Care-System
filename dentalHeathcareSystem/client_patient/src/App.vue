<!-- <script setup>
import { RouterLink, RouterView } from 'vue-router'
</script> -->

<template>
<div id="app">
  <div class="navbar">
    <div class="menu-icon-container">
      <img id="menu-icon" class="menu-icon rotated-icon" src="@/assets/drop-down.png" @click="toggle()" alt="menu">
      
    </div>
    <img alt="Vue logo" class="logo" src="@/assets/no-bg-logo1.png" width="250" height="125" @click="toggle()"/>


        <nav id="nav" class="nav">
          <router-link class="desktop-header-link" to="/">Home</router-link>
          <!-- <router-link class="desktop-header-link" to="/my_appointments">My Appointments</router-link> -->
          <router-link class="desktop-header-link" to="/profile" v-if="this.loggedIn">My profile</router-link>
          <router-link class="desktop-header-link" to="/new/appointment">New Appointment</router-link>
          <!-- <router-link class="desktop-header-link" to="/medical_journal">Medical Journal</router-link> -->
          <router-link class="desktop-header-link" to="/registration">Register</router-link>
          <router-link class="desktop-header-link" to="/login" v-if="!this.loggedIn">Login</router-link>
          <button class="desktop-header-link" @click="logout()"  v-if="this.loggedIn">Logut</button>
        </nav>


    <div class="notification-icon-container">
      <router-link to="/notifications"><img class="notification-icon" src="@/assets/notification.png" alt="notification" @click="toggleNotifications()"></router-link>
      
      
    </div>
        <!-- <a href="https://www.flaticon.com/free-icons/drop-down-menu" title="drop down menu icons">Drop down menu icons created by sonnycandra - Flaticon</a> -->
        <!-- <a href="https://www.flaticon.com/free-icons/notification" title="notification icons">Notification icons created by Pixel perfect - Flaticon</a> -->
        <!--<a href="https://www.flaticon.com/free-icons/notification" title="notification icons">Notification icons created by Pixel perfect - Flaticon</a>  -->
  </div>
</div>

  <RouterView />
</template>
<script>
import { Api } from './Api'


export default {
  data: () => ({
    login_check_url: '',
    logout_url: '/logout',
    loggedIn: false,
    isAdmin: false,
    isPatient: false,
    isDentist: false,
  }),

  mounted() {
    this.login_check_url = import.meta.env.VITE_LOGIN_CHECK_URL;
    this.loginCheck();

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
      notification.src = 'bell.png'
    },
    loginCheck() {

        Api.get(`${this.login_check_url}`).then(response => {
          if (response.status === 200) {
            this.loggedIn = response.data.loggedIn;
            this.isAdmin = response.data.isAdmin;
            this.isPatient = response.data.isPatient;
            this.isDentist = response.data.isDentist;
            
          } else {
            this.loggedIn = false;
            this.isAdmin = false;
            this.isPatient = false;
            this.isDentist = false;
          }
        }).catch(error => {
          console.log(error.message);
          
        })
    },
    async logout() {
      await Api.get(`${this.logout_url}`).then(response => {
        if (response.status === 200) {
          this.loggedIn = response.data.loggedIn;
          this.isAdmin = response.data.isAdmin;
          this.isPatient = response.data.isPaitent;
          this.isDentist = response.data.isDentist;
          
        }
      }).catch(error => {
        console.log( error.response?.data.message);
        
      })
    }
  }
}
</script>

<style>

</style>
