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
              <div class="appointment-details">
                <h3><strong>{{appointment.clinic_name}}</strong></h3>
                <p>Date: {{appointment.date}}</p>
                <p>Time: {{appointment.time }}</p>
                <p>Type of appointment: {{appointment.type_of_appointment }}</p>
                <p>Address: {{appointment.clinic_address}}</p>
              </div>
              
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
        available: "",
        clinic_address: '',
        clinic_name: '',
        date: '',
        time: '',
      },

      appointments: [],
      clinics: [],
      clinicID: "",
      clinic_address: "",
      error_message: '',
      confirmation_message: '',

      appointments_get_specific_url: '',
      update_appointment_url: '',
      get_available_appointments_url: '',

        
    }
  },
  mounted() {
    this.appointments_get_specific_url = import.meta.env.VITE_GET_SPECIFIC_APPOINTMENTS_URL;
    this.update_appointment_url = import.meta.env.VITE_UPDATE_APPOINTMENT_URL;
    this.get_available_appointments_url = import.meta.env.VITE_GET_AVAILABLE_APPOINTMENTS_URL;
    this.clinics_get_all_ulr = import.meta.env.VITE_GET_ALL_CLINICS_URL;
    this.getAllClinics();
    this.getAvailableAppointments();
  },
    methods: {
      async getAllClinics(){
      await Api.get(`${this.clinics_get_all_ulr}`).then(response =>{
        if(response.status === 200){
          this.clinics = response.data.clinics
        }
      }).catch(error =>{
        this.error_message = error.response?.data.message;
            setTimeout(() => {
                this.error_message = '';
            }, 5000);
        })
    },
    async getAvailableAppointments(){
      await Api.get(`${this.get_available_appointments_url}`).then(response =>{
        if(response.status === 200){
          this.appointments = response.data.appointments;


          this.clinics.forEach(clinic => {
            var clinicName = clinic.name;
            var clinicAddress = clinic.location.formattedAddress;

            //add clinic name and clinic address to appointment object if the ids match 
            for (let index = 0; index < this.appointments.length; index++) {
              const appointment = this.appointments[index];
              if (appointment.dentist_clinic_id === clinic._id) {
                appointment.clinic_name = clinicName;
                appointment.clinic_address = clinicAddress;

              }

              //fix the time and date formatting and store them inside appointment to be displayed
              var result = this.extractTimeAndDate(appointment.date_and_time_from)
              console.log('this is result: ', result);
              
              appointment.date = result[0];
              appointment.time = result[1];

              this.appointment[index] = appointment;
              // console.log('this is the new appointment object: ', this.appointment[index] );
              
            }
          });
        }
      }).catch(error =>{
        this.error_message = 'Sorry. There are no available appointments currently. Please check again later.';
            setTimeout(() => {
                this.error_message = '';
            }, 5000);
      })
    },
    async updateAppointment(appointmentID){
      this.appointment.available = false;
      await Api.put(`${this.update_appointment_url}${appointmentID}`,this.appointment).then(response => {
      }).catch(error => {
        console.log(error.message);
      })

      },
      async checkAvailability(appointmentID) {
        Api.get(`${this.appointments_get_specific_url}${appointmentID}`).then(response => {
          if (response.status === 200) {
            this.appointment = response.data
            var clinicID = this.appointment.appointments.dentist_clinic_id 
            if (!this.appointment.appointments.available) {
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
            router.push({path: `${targetPath}`})
      },
    extractTimeAndDate(date_and_time) {
          var date = '';
          var time = '';
          console.log(date_and_time);
          
          var tempArr = date_and_time.split('T');
          date = tempArr[0];

          var tempTime = tempArr[1].split(':')
          time = tempTime[0] + ':' + tempTime[1];

          var date_and_time_arr = [date, time]
          return date_and_time_arr;
        },
  }, 
  
  

}
</script>

<style src="../assets/main.css"></style>