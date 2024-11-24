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
          <div v-for="appointment in appointments" :key="appointment._id">
            {{ appointment._id }}
            <!-- Later on, the select button will have the responsibility of triggering the countdown timer for the booking process -->
            <div class="appointments-card">
              <h2><strong>{{clinic_name}} </strong>|{{appointment.date_and_time_from}} | {{appointment.date_and_time_until }} | {{clinic_address}}</h2>
              <button class="select-button" @click="redirectToAppointment(appointment._id)">Select</button>
            </div>
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
      appointment:{
        patient_id: "",
        dentist_id:"",
        dentist_clinic_id: "",
        type_of_appointment:"",
        date_and_time_from:"",
        date_and_time_until:"",
        available:"",
      },
      appointments: [],
      clinic_name: "",
      clinic_address: "",

    }
  },
  mounted() {
    this.getAllAppointments()
  },
    methods: {
        redirectToAppointment(appointmentID) {
          this.updateAppointment(appointmentID)
        router.push({path: '/single_appointment'})
    },
    async getAllAppointments(){
      await Api.get("/appointments").then(response =>{
        if(response.status === 200){
          this.appointments = response.data.appointments
        }
      }).catch(error =>{
        console.log(error.message);
      })
    },
    async updateAppointment(appointmentID){
      this.appointment.available = false;
      await Api.put(`/appointments/${appointmentID}`,this.appointment).then(response => {

      }).catch(error => {
        console.log(error.message);
      })

    }
  } 
}
</script>

<style src="../assets/main.css"></style>