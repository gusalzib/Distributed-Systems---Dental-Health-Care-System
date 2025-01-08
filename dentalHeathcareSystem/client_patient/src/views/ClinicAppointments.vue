<template>
<div id="clinic-card">    
    <h1>{{headerMessage}}</h1> 

    <div class="confirmation_message">{{ confirmation_message }}</div>
    <div class="error_message">{{ error_message }}</div>     

    <div class="pagination-controls">
        <button @click="getClinicsAppointment(currentPage - 1)" :disabled="currentPage === 1">Previous</button>
        <span>Page {{ currentPage }} of {{ totalPages }}</span>
        <button @click="getClinicsAppointment(currentPage + 1)" :disabled="currentPage === totalPages">Next</button>
    </div>

    <div v-for="appointment in appointments" :key = "appointment._id">
        <div class="clinic-appointment_card" @click="rerouting(`/single/appointment/${appointment._id}`)"> Appointment:&nbsp; 
            <p> Date:&nbsp; {{ appointment.date_and_time_from }}&nbsp; </p>
            <p> Time:&nbsp; {{ appointment.date_and_time_until }}</p>
        </div>
    </div>

</div>
</template>

<script>

import { Api } from '@/Api'
import router from '@/router'

export default {
    name: 'clinicAppointments',
    data() {
        return {
            clinic:{
                name: "",
                address:"",
                phoneNumber: "",
                email:"",
                dentists: [],
                appointments: [],
            },
            appointments: [],
            dentists: [],
            headerMessage: '',
            confirmation_message: '',
            error_message: '',
            login_check_url: '',
            loggedIn: false,
            paginationInfo: '',
            currentPage: 1,
            appointmentsPerPage: 10,
            totalPages: 0,
        }
    },

    mounted() {
        this.login_check_url = import.meta.env.VITE_LOGIN_CHECK_URL;
        this.clinics_get_specific_url = import.meta.env.VITE_GET_SPECIFIC_CLINIC_URL;
        this.get_clinics_available_appointments_url = import.meta.env.VITE_GET_CLINICS_AVAILABLE_APPOINTMENTS_URL;
        this.getSpecificClinic();
        this.getClinicsAppointment();
    },
    methods:{
        async getSpecificClinic(){
            this.clinicID = this.$route.params.clinicID;
            await Api.get(`${this.clinics_get_specific_url}${this.clinicID}`).then(response =>{
                if(response.status === 200){
                this.clinic = response.data.clinics;
            }
        }).catch(error =>{
            this.error_message = error.response?.data.message;
            setTimeout(() => {
                this.error_message = '';
            }, 5000);
        })
        },

        async getClinicsAppointment(page = 1, limit = this.appointmentsPerPage){
            this.clinicID = this.$route.params.clinicID;
            await Api.get(`${this.get_clinics_available_appointments_url}${this.clinicID}?page=${page}&limit=${limit}`).then(response =>{

                if(response.status === 200){
                    // this.appointments = response.data.appointments

                    var appointmentsArr = response.data.appointments.appointments;

                    var receivedPaginationInfo = response.data.appointments.paginationInfo;

                    this.appointments = appointmentsArr;
                    
                    this.currentPage = receivedPaginationInfo.currentPage; 
                    this.totalPages = receivedPaginationInfo.totalPages;

                    if(this.appointments.length === 0){
                        this.headerMessage = "This clinic has no available appointments."
                    }else{
                        this.headerMessage = "Available appointments:"
                    }
                    for (let i = 0; i<= this.appointments.length-1; i++){
                        var dateAndTimeArr= this.extractTimeAndDate(this.appointments[i].date_and_time_from);
                        this.appointments[i].date_and_time_from = dateAndTimeArr[0];
                        this.appointments[i].date_and_time_until = dateAndTimeArr[1];  
                    }
                }  
            }).catch(error => {
                this.error_message = error.response?.data.message;
            setTimeout(() => {
                this.error_message = '';
            }, 5000);
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

        async rerouting(targetPath) {
            await this.loginCheck();

            if (this.loggedIn) {
                router.push({ path: `${targetPath}` });
            } else {
                this.error_message = 'You need to login to book an appointment.';
                setTimeout(() => {
                    this.error_message = '';
                }, 5000);
            }
            
        },

        async loginCheck() {

            await Api.get(`${this.login_check_url}`).then(response => {
            if (response.status === 200) {
                this.loggedIn = response.data.loggedIn;
                //console.log('loggedIn: ',this.loggedIn);
                
                
            } else {
                this.loggedIn = false;
            }
            }).catch(error => {
                console.log(error.message);
            
            })
        },
    }
}

</script>