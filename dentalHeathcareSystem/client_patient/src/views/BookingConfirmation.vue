<template>
    <main>
      <div class="booking-confirmation-container">
          <h1>Confirmation:</h1>
          <div class="booking-confirmation-details">
            <h2>You have booked this kind of appointment: {{appointment.type_of_appointment}}</h2>
            <h2>Date: {{date}} | Time: {{ appointmentStart }}  | Clinic name: {{clinic.name}}</h2>
            <p>Address to clinic: {{clinic.address}} </p>
            <br>
            <p>Note: Please note that cancelling an appointment less than 24 hours in 
              advance will result in additional fees up to 200 SEK. If the appointment 
              was cancelled by the clinic for any reason, you will be notified via email.</p>
            <hr>
          </div>
          <button class="booking-confirmation-button" @click="rerouting('/')">Done</button>
          <div class="confirmation_message">{{ confirmation_message }}</div>
          <div class="error_message">{{ error_message }}</div>
      </div>
    </main>
  </template>
  
  
  <script>
  // @ is an alias to /src
  import { Api } from '@/Api'
  import router from '@/router'
  
  export default {
    name: 'bookingConfirmation',
    data() {
      return {
        appointment: {
            patient_id: "",
            dentist_id:"",
            dentist_clinic_id: "",
            type_of_appointment:"",
            date_and_time_from:"",
            date_and_time_until:"",
            available:"",
        },
        clinic:{
            name:"",
            address:"",

        },
        date: '',
        appointmentStart: '',
        appointmentEnd: '',
        error_message:"",
        confirmation_message: "",
  
      }
    },
    mounted() {
      this.appointments_get_specific_url = import.meta.env.VITE_GET_SPECIFIC_APPOINTMENTS_URL;
      this.clinics_get_specific_url = import.meta.env.VITE_GET_SPECIFIC_CLINIC_URL;
      this.getAppointment();
      this.extractTimeAndDate();
      this.getClinic()
    },
      methods: {
        async getAppointment(){
            const appointmentID = this.$route.params.appointmentID;
            await Api.get(`${this.appointments_get_specific_url}${appointmentID}`).then(response =>{
                if(response.status === 200){
                    this.appointment = response.data.appointments;
                }
            }).catch(error =>{
                this.error_message = error.response?.data.message;
                setTimeout(() => {
                            this.error_message = ''
                        }, 5000);
            })
        },
        async getClinic(){
            await this.getAppointment();
            const clinic_id = this.appointment.dentist_clinic_id
            await Api.get(`${this.clinics_get_specific_url}${clinic_id}`).then(response =>{
                if(response.status === 200){
                    this.clinic = response.data.clinics;
                    this.clinic.address = this.clinic.location.formattedAddress;
                    
                }
            }).catch(error =>{
                this.error_message = error.response?.data.message;
                setTimeout(() => {
                            this.error_message = ''
                        }, 5000);
            })
        },
        async extractTimeAndDate() {
          
            await this.getAppointment();

            var tempFrom = this.appointment.date_and_time_from
            var fromArr = tempFrom.split("T");

            this.date = fromArr[0];
            this.appointmentStart = fromArr[1];
            var appStartArr = this.appointmentStart.split(":");
            this.appointmentStart = appStartArr[0] + ":" + appStartArr[1]

        },

        rerouting(targetPath){
            router.push({path: `${targetPath}`})
        }
    }
  }
  </script>
  
  <style src="../assets/main.css"></style>