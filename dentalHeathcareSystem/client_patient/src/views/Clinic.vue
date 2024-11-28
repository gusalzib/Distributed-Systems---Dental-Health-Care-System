<template>
    
<div class="clinic-container">
    <div class="clinic-sidebar">
        <div id="clinic-sidebar-menu">
            <h3>Control Panel</h3>
            <a id="sidebar-links" @click ="setActive('contact_info')">Contact info</a>
            <a id="sidebar-links" @click ="setActive('dentists')" >Dentists</a>
            <a id="sidebar-links" @click ="setActive('available appointments')">Available appointments</a>
        </div>
    </div>
    <div>
        <h1>{{clinic.name}}</h1>
    </div>
            
    
    
</div>
</template>
<script>
import { Api } from '@/Api'

export default {
    name: 'home',
    data() {
        return {
            clinic:{
                name: "",
                address:"",
                phoneNumber: "",
                email:"",
                dentists: [],
                appointments: [],
            }

        }
    },
    mounted() {
        this.getSpecificClinic()
        

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
            var clinicID = this.$route.params.clinicID;
        await Api.get(`/clinics/${clinicID}`).then(response =>{
            if(response.status === 200){
            this.clinic = response.data.clinic
            }
        }).catch(error =>{
            console.log(error.message);
        })
        },
    }
}

</script>