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
                    <div  v-if="activeSection === 'available_appointments'">
                        <ClinicAppointments/> 
                    </div>

                    <div v-else-if="activeSection === 'dentists'">
                        <ClinicDentists/>
                    </div>

                    <div v-else class="clinic-contact-card">
                        <!-- {{ clinic }} -->
                        <h2>Address: {{ clinic.location.formattedAddress }}</h2>
                        <h2>Region: {{ clinic.region }}</h2>
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
import router from '@/router'
import ClinicAppointments from '@/views/ClinicAppointments.vue'
import ClinicDentists from '@/views/ClinicDentists.vue'

export default {
    name: 'clinic',
    components: {
        ClinicAppointments,
        ClinicDentists
    },
    data() {
        return {
            activeSection: "clinic",
            clinic:{
                name: "",
                region: '',
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
        this.clinics_get_specific_url = import.meta.env.VITE_GET_SPECIFIC_CLINIC_URL;
        this.clinics_get_dentists_url = import.meta.env.VITE_GET_CLINICS_DENTISTS_URL;
        this.appointments_get_clinics_appoitnments_url = import.meta.env.VITE_GET_CLINICS_APPOINTMENTS_URL
        this.get_clinics_available_appointments_url = import.meta.env.VITE_GET_CLINICS_AVAILABLE_APPOINTMENTS_URL;
        this.getSpecificClinic();
        
        

    },
    methods: {
        setActive(section) {
            try {
                this.activeSection = section;
            } catch (error) {
                this.error_message = error.message;
            } 
        },

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

        rerouting(targetPath){
            router.push({path: `${targetPath}`})
        },
    }
}

</script>