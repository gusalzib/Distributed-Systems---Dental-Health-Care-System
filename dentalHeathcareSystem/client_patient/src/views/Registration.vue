<template>
  <main>
        <div class="registration-container">
            
            <div class="patient-information-form">
                <h1>Registration form</h1>
                <label>Full name:* </label>
                <input type="text" id="patient-name"  v-model="patient.name" required>
                <hr>
                <label>Social Security Number (SSN):* </label>
                <input type="text" id="patient-ssn" v-model="patient.ssn" required>
                <hr>

                <label>Phone number:* </label>
                <input type="text" id="patient-phone" v-model="patient.phone_number" required>
                <hr>

                <label>Email:* </label>
                <input type="email" id="patient-email" v-model="patient.email" required>
                <hr>

                <label>Address:* </label>
                <input type="address" id="patient-address" v-model="patient.address" required>
                <hr>

                <label>Password:* </label>
                <input type="password" id="patient-address" v-model="patient.password" required>
                <hr>
                <button class="submit-button">Register</button>
                <router-link to="/privacy_policy">Read about how we handle your information</router-link>
                <router-link to="/login">Already registered? Login in to your account by following this link</router-link>
                <p>Obligatory fields *</p>
            </div>
        </div>
  </main>
</template>


<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'registration',
  data() {
    return {
        patient: {
            name: '',
            email: '',
            phone_number: '',
            ssn: '',
            address: '',
            password: ''
        },
    }
  },
    mounted() {
    
  },
    methods: {
        
  }
}
</script>

<style src="../assets/main.css"></style>