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

          <div class="confirmation_message">{{ confirmation_message }}</div>
          <div class="error_message">{{ error_message }}</div>

          <hr>
          <div v-for="appointment in appointments" :key="appointment._id">
            {{ appointment._id }}
            <!-- Later on, the select button will have the responsibility of triggering the countdown timer for the booking process -->
            <div class="appointments-card">
              <h2><strong>{{clinic_name}} </strong>|{{appointment.date_and_time_from}} | {{appointment.date_and_time_until }} | {{clinic_address}}</h2>
              <button class="clinic-button" @click="rerouting(`/clinic/${appointment.dentist_clinic_id}`)">Contact Clinic</button>
              <button class="select-button" @click="checkAvailability(appointment._id)">Select</button>
              
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
      clinics: [],
      clinicID: "",
      clinic_address: "",
      error_message: '',
      confirmation_message: ''

    }
  },
  mounted() {
    this.getAllAppointments(),
    this.getAllClinics();
  },
    methods: {
      async getAllClinics(){
      await Api.get("/clinics").then(response =>{
        if(response.status === 200){
          this.clinics = response.data.clinics
          console.log(this.clinics)
        }
      }).catch(error =>{
        console.log(error.message);
      })
    },
    async getAllAppointments(){
      await Api.get("/appointments/available/appointment").then(response =>{
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

      },
      async checkAvailability(appointmentID) {
        Api.get(`/appointments/${appointmentID}`).then(response => {
          if (response.status === 200) {
            this.appointment = response.data.appointment
            var clinicID = this.appointment.dentist_clinic_id 
            console.log(this.appointment);
            if (!this.appointment.available) {
              this.error_message = 'Sorry this apointment was just taken by another user. '
                + 'Please choose another one!';

                setTimeout(() => {
                    this.error_message = '';
                }, 8000);
            } else {
              this.updateAppointment(appointmentID)
              router.push({path: `/single/appointment/${appointmentID}`})
            }
          }
        }).catch(error => {
          this.error_message = error.response?.data.message;
            setTimeout(() => {
                this.error_message = '';
            }, 5000);
        })
    },
    rerouting(targetPath){
      console.log("target",targetPath);
            router.push({path: `${targetPath}`})
    },
  }, 
  
  

}
</script>

<style src="../assets/main.css"></style>