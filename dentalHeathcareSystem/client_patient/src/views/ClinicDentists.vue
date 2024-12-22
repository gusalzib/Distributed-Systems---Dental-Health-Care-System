<template>
 <div >
    <h1>{{headerMessage}}</h1>
    <div v-for="dentist in dentists" :key = "dentist._id">
        <div>
            <hr>
            <p>{{ dentist.name }}</p> 
        </div>
    </div>
</div>
                
</template>
<script>
import { Api } from '@/Api'

export default {
    name: 'clinicDentists',
    data() {
        return {
            dentists: [],
            headerMessage: '',
            confirmation_message: '',
            error_message: '',
            current_clinic_placeholder: '675e05333c2458fc67c6ac9a',
        }
    },

    mounted(){
        this.clinics_get_dentists_url = import.meta.env.VITE_GET_CLINICS_DENTISTS_URL;
        this.getDentistsFromSpecificClinic();

    },
    methods: {
    async getDentistsFromSpecificClinic(){
        try{
            console.log("TEST dentist");
            this.clinicID = this.$route.params.clinicID;
            const response = await Api.get(`${this.clinics_get_dentists_url}${this.clinicID}`)
                if(response.status === 200){
                this.dentists = response.data.dentists;
                this.headerMessage = "Dentists working in this clinic are:";
                console.log(this.dentists.length);
            }
        }catch(error) {
            this.error_message = error.response?.data.message;
            this.headerMessage = "This clinic has no dentists."
            setTimeout(() => {
                this.error_message = '';
            }, 5000);
        }
        }
    }
}
</script>