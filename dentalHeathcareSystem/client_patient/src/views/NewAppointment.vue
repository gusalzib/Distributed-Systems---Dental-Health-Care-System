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

          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>          
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>          
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>

          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>

          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>
          <div class="appointments-card">
            <h2><strong>Clinic name </strong>| 01-07-2024 | 12:00 AM | Svensson Street 23D</h2>
            <button class="select-button">Select</button>
          </div>
        </div>

  </main>
</template>


<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'newAppointment',
  data() {
    return {

    }
  },
  mounted() {

  },
  methods: {
  }
}
</script>

<style src="../assets/main.css"></style>