<template>
  <main>
        <div class="appointments-container">
          <h2>Available appointments</h2>
          <div class="appointments-filter">
            <div class="filter">
              <input id="day" type="date" v-model="filters.day" @input="applyFilter('day', filters.day)">
            </div>
            <!-- <div class="filter">
              <input id="time" type="time" v-model="filters.time" @input="applyFilter('time', filters.time)">
            </div> -->
            <div class="filter">
              <input id="clinic-name" type="search" placeholder="Search for clinic">
            </div>
            <div class="filter">
                <select id="patient-region" v-model="filters.patientRegion" @change="applyFilter('region', filters.patientRegion)">
                  <option value="" disabled selected> Select you region </option>
                  <option value="Blekinge">Blekinge</option>
                  <option value="Dalarna">Dalarna</option>
                  <option value="Gotland">Gotland</option>
                  <option value="Gävleborg">Gävleborg</option>
                  <option value="Göteborg">Göteborg</option>
                  <option value="Halland">Halland</option>
                  <option value="Jämtland">Jämtland</option>
                  <option value="Jönköping">Jönköping</option>
                  <option value="Kalmar">Kalmar</option>
                  <option value="Kronoberg">Kronoberg</option>
                  <option value="Norrbotten">Norrbotten</option>
                  <option value="Skåne">Skåne</option>
                  <option value="Stockholm">Stockholm</option>
                  <option value="Södermanland">Södermanland</option>
                  <option value="Uppsala">Uppsala</option>
                  <option value="Värmland">Värmland</option>
                  <option value="Västerbotten">Västerbotten</option>
                  <option value="Västernorrland">Västernorrland</option>
                  <option value="Västmanland">Västmanland</option>
                  <option value="Västra Götaland">Västra Götaland</option>
                  <option value="Örebro">Örebro</option>
                  <option value="Östergötland">Östergötland</option>
                </select>
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
                <p>Region: {{ appointment.region }}</p>
              </div>
              
              <button class="clinic-button" @click="rerouting(`/clinic/${appointment.dentist_clinic_id}`)">Contact Clinic</button>
              <button class="select-button" @click="checkAvailability(appointment._id)">Select</button>
              
            </div>
          </div>
        </div>

  </main>
</template>


<script>

document.addEventListener("DOMContentLoaded", () => {
  const filters = {
    day: document.getElementById("day"),
    time: document.getElementById("time"),
    clinicName: document.getElementById("clinic-name"),
    patientRegion: document.getElementById("patient-region"),
  }
});



// @ is an alias to /src
import { Api } from '@/Api'
import router from '@/router'

export default {
  name: 'newAppointment',
  data() {
    return {
      filters: {
        day: '',
        time: '',
        clinicName: '',
        patientRegion: '',
      },
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
        region: '',
      },
      patient: {
          name: '',
          email: '',
          phone_number: '',
          ssn: '',
          address: '',
          appointments: [],
          region: ''
        },
      loggedIn: false,
      login_check_url: '',
      appointments: [],
      filteredAppointments: [],
      clinics: [],
      clinicID: "",
      clinic_address: "",
      error_message: '',
      confirmation_message: '',

      appointments_get_specific_url: '',
      update_appointment_url: '',
      get_available_appointments_url: '',
      get_cuurent_patient_info_url: '',
      get_filtered_appointments_url: '',

        
    }
  },
  mounted() {
    this.login_check_url = import.meta.env.VITE_LOGIN_CHECK_URL;
    this.appointments_get_specific_url = import.meta.env.VITE_GET_SPECIFIC_APPOINTMENTS_URL;
    this.update_appointment_url = import.meta.env.VITE_UPDATE_APPOINTMENT_URL;
    this.get_available_appointments_url = import.meta.env.VITE_GET_AVAILABLE_APPOINTMENTS_URL;
    this.clinics_get_all_ulr = import.meta.env.VITE_GET_ALL_CLINICS_URL;
    this.get_cuurent_patient_info_url = import.meta.env.VITE_PATIENT_GET_SPECIFIC_URL;
    this.get_filtered_appointments_url = import.meta.env.VITE_FILTERED_APPOINTMENTS_URL;


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
              
              appointment.date = result[0];
              appointment.time = result[1];

              this.appointment[index] = appointment;
              
            }
          });
        }
      }).catch(error => {       
        this.error_message = 'Sorry. There are no available appointments currently. Please check again later.';
            setTimeout(() => {
                this.error_message = '';
            }, 5000);
      })
    },
    
      async checkAvailability(appointmentID) {
        await this.loginCheck();
        
        if (this.loggedIn === true) {

          await Api.get(`${this.appointments_get_specific_url}${appointmentID}`).then(response => {
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
              
                router.push({path: `/single/appointment/${appointmentID}`})
              }
            }
          }).catch(error => {          
            this.error_message = error.response?.data.message;
              setTimeout(() => {
                  this.error_message = '';
              }, 5000);
          })
        } else {
            this.error_message = 'You need to be logged in to book an appointment'
              setTimeout(() => {
                  this.error_message = '';
              }, 10000);
        }

    },
    rerouting(targetPath){
            router.push({path: `${targetPath}`})
      },
    extractTimeAndDate(date_and_time) {
          var date = '';
          var time = '';
          
          var tempArr = date_and_time.split('T');
          date = tempArr[0];

          var tempTime = tempArr[1].split(':')
          time = tempTime[0] + ':' + tempTime[1];

          var date_and_time_arr = [date, time]
          return date_and_time_arr;
      },
    async loginCheck() {

        await Api.get(`${this.login_check_url}`).then(response => {
          if (response.status === 200) {
            this.loggedIn = response.data.loggedIn;
          } else {
            this.loggedIn = false;
          }
        }).catch(error => {
          console.log(error.message);
          
        })
      },

      async applyFilter(filterType, value) {
        try {
          const payload = { [filterType]: value }

          const response = await Api.post(`${this.get_filtered_appointments_url}`, payload);

          if (response.status === 200) {
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
                
                appointment.date = result[0];
                appointment.time = result[1];

                this.appointment[index] = appointment;
                
              }
            });
            
          }

        } catch (error) {
            this.error_message = error.response?.data.message || 'An error occured while applying filter.';
            setTimeout(() => {
                this.error_message = '';
            }, 5000);
      }
    }
  }, 
  
  

}
</script>

<style src="../assets/main.css"></style>