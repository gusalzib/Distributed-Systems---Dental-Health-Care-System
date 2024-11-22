<template>
  <main>
        <div class="login-container">
            
            <div class="patient-login-form">
                <h1>Login</h1>

                <label>Social Security Number (SSN):* </label>
                <input type="text" id="patient-ssn" v-model="patient.ssn" required>
                <hr>

                <label>Email:* </label>
                <input type="email" id="patient-email" v-model="patient.email" required>
                <hr>

                <label>Password:* </label>
                <input type="password" id="patient-password" v-model="patient.password" required>
                <hr>
                <button class="submit-button">Login</button>

                <router-link to="/privacy_policy">Read about how we handle your information</router-link>
                <router-link to="/registration">Not registered yet? Register your account by following this link</router-link>
                <p>Obligatory fields *</p>
            </div>
        </div>
  </main>
</template>


<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'login',
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