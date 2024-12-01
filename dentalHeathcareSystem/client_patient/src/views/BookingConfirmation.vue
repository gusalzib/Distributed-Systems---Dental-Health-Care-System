<template>
    <main>
      <div class="booking-confirmation-container">
          <h1>Confirmation:</h1>
          <div class="booking-confirmation-details">
            <h2>You have booked this kind of appointment: "kind of appointment"</h2>
              <h2>Date: {{date}} | Time: {{ appointmentStart }}  | Clinic name: clinic name</h2>
              
              <p>Address to clinic: "Address to clinic" </p>
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
            clinic_name:"",
            clinic_adress:"",

        },
        date: '',
        appointmentStart: '',
        appointmentEnd: '',
        error_message:"",
        confirmation_message: "",
  
      }
    },
    mounted() {
      this.getAppointment();
      this.extractTimeAndDate();
    },
      methods: {
        async getAppointment(){
            const appointmentID = this.$route.params.appointmentID;
            await Api.get(`/appointments/${appointmentID}`).then(response =>{
                if(response.status === 200){
                    this.appointment = response.data.appointment
                }
            }).catch(error =>{
                this.error_message = error.response?.data.message;
                setTimeout(() => {
                            this.error_message = ''
                        }, 5000);
            })
        },
        async getClinic(){
            const clinic_id = this.appointment.dentist_clinic_id
            await Api.get(`/clinics/${clinic_id}`).then(response =>{
                if(response.status === 200){
                    this.clinic = response.data.clinic;   
                    
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