<template>
<div id="clinic-card">    
    <h1>{{headerMessage}}</h1>            
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
import { onMounted } from 'vue';



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
        }
    },

    mounted(){
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

        async getClinicsAppointment(){
            this.clinicID = this.$route.params.clinicID;
            await Api.get(`${this.get_clinics_available_appointments_url}${this.clinicID}`).then(response =>{
                if(response.status === 200){
                    this.appointments = response.data.appointments
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
        rerouting(targetPath){
            router.push({path: `${targetPath}`})
        },
    }
}

</script>