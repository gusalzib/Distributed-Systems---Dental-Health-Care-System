<template>
  <main>
        <div class="appointments-container">
          <h2>Available appointments</h2>
          <div class="appointments-filter">
            <div class="filter">
              <input id="day" type="date">
            </div>
            <div class="filter">
              <input id="time" type="time">
            </div>
            <div class="filter">
              <input id="clinic-name" type="search" placeholder="Search for clinic">
            </div>
            <div class="filter-button">
              <button>Apply filter</button>
            </div>
            
          </div>

          <hr>

          <!-- Later on, the select button will have the responsibility of triggering the countdown timer for the booking process -->
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>          
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>          
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>

          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>

          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button" @click="redirectToAppointment()">Select</button>
          </div>
        </div>

  </main>
</template>


<script>
// @ is an alias to /src
import { Api } from '@/Api'
import router from '@/router'

export default {
  name: 'newAppointment',
  data() {
    return {

    }
  },
  mounted() {

  },
    methods: {
        redirectToAppointment() {
        router.push({path: '/single_appointment'})
    }
  }
}
</script>

<style src="../assets/main.css"></style>