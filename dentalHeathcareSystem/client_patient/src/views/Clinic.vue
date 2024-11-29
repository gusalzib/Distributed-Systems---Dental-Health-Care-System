<template>
    <div>
  
        <div class="clinic-container">
            <div class="single-patient-sidebar">
                <div id="single-patient-sidebar-menu">
                    <h3>Control Panel</h3>
                    <a class="sidebar-links" @click="setActive('clinic')">Clinic information</a>
                    <a class="sidebar-links" @click="setActive('available_appointments')">Available appointments</a>
                    <a class="sidebar-links" @click="setActive('dentists')" >Dentists</a>
                
                </div>
            </div>

            <div class="clinic-right-side">

                <div class="clinic-title">
                    <h1>{{clinic.name }}</h1>
                </div>

                <div id="clinic-card">
                    <div id="edit-profile" v-if="activeSection === 'available_appointments'">
                        <div v-for="appoinment in appointments" :key = "appointment_id">
                            <div class="clinic-appointment_card">
                                <p>Date: {{ appoinment.date_and_time_from }}</p>
                                <p>Time: {{ appoinment.date_and_time_until }}</p>
                            </div>
                        </div>  
                    </div>

                    <div v-else-if="activeSection === 'dentists'">
                        <h1>Dentists working in this clinic are:</h1>
                        <div v-for="dentist in dentists" :key = "dentist_id">
                            <div>
                                <hr>
                                <p>{{ dentist.dentist_id }}</p>
                            </div>
                        </div>
                    </div>

                    <div v-else class="clinic-contact-card">
                        <h2>Address: {{ clinic.address }}</h2>
                        <h2>Phone number: {{ clinic.phoneNumber }}</h2>
                        <h2>Email: {{ clinic.email }}</h2>
                    </div>
                
                </div>
            </div>
            <div id="confirmation_message" class="confirmation_message">{{ confirmation_message }}</div>
            <div id="error_message" class="error_message">{{ error_message }}</div>
        </div>
  
  
  
      
    </div>
  </template>
<script>
import { Api } from '@/Api'

export default {
    name: 'home',
    data() {
        return {
            activeSection: "clinic",
            clinic:{
                name: "",
                address:"",
                phoneNumber: "",
                email:"",
                dentists: [],
                appointments: [],
            },
            clinicID:"",
            appointments: [],
            dentists: [],
            confirmation_message: '',
            error_message: '',
        }
    },
    mounted() {
        this.getSpecificClinic();
        this.getClinicsAppointment();
        

    },
    methods: {
        setActive(section) {
            try {
                this.activeSection = section;
            } catch (error) {
                this.error_message = error.message;
                console.log(this.message);
            } 
        },

        async getSpecificClinic(){
            this.clinicID = this.$route.params.clinicID;
            await Api.get(`/clinics/${this.clinicID}`).then(response =>{
                if(response.status === 200){
                this.clinic = response.data.clinic;
                }
            this.getDentistsFromSpecificClinic();
        }).catch(error =>{
            console.log(error.message);
        })
        },

        async getDentistsFromSpecificClinic(){
            this.clinicID = this.$route.params.clinicID;
            await Api.get(`/clinics/${this.clinicID}/dentists`).then(response =>{
                if(response.status === 200){
                this.dentists = response.data.clinicDentists;
            }
        }).catch(error =>{
            console.log(error.message);
        })
        },
        

        async getClinicsAppointment(){
            this.clinicID = this.$route.params.clinicID;
            await Api.get(`/appointments/${this.clinicID}/clinics/appointment`).then(response =>{
                if(response.status === 200){
                    this.appointments = response.data.appointments
                    for (let i = 0; i<= this.appointments.length-1; i++){
                        var dateAndTimeArr= this.extractTimeAndDate(this.appointments[i].date_and_time_from);
                        this.appointments[i].date_and_time_from = dateAndTimeArr[0];
                        this.appointments[i].date_and_time_until = dateAndTimeArr[1];
                    }
                }
            })
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
    }
}

</script>