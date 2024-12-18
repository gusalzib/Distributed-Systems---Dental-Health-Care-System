<template>
  <main>
        <div class="login-container">
            
            <div class="patient-login-form">
                <h1>Login</h1>

                <!-- <label>Social Security Number (SSN):* </label>
                <input type="text" id="patient-ssn" v-model="patient.ssn" required>
                <hr> -->

                <label>Email:* </label>
                <input type="email" id="patient-email" v-model="patient.email" required>
                <hr>

                <label>Password:* </label>
                <input type="password" id="patient-password" v-model="patient.password" required>
                <hr>
                <button class="submit-button" @click="login()">Login</button>

                <router-link to="/privacy_policy">Read about how we handle your information</router-link>
                <router-link to="/registration">Not registered yet? Register your account by following this link</router-link>
                <p>Obligatory fields *</p>
                <div class="confirmation_message">{{ confirmation_message }}</div>
                <div class="error_message">{{ error_message }}</div>
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
          email: '',
          password: ''
      },

      login_url: '',
      confirmation_message: '',
      error_message: '',

    }
  },
    mounted() {
      this.login_url = import.meta.env.VITE_LOGIN_URL;
  },
    methods: {
      async login() {

        try {
          const response = await Api.post(`${this.login_url}`, this.patient)

          if (response.status === 200 ) {
            this.$route.push('/');
            this.confirmation_message = 'Login successfull!';
            setTimeout(() => {
                this.confirmation_message = ''
            }, 5000);
          }
        } catch (error) {
            this.error_message = 'Login failed. Please check password and email.';
            setTimeout(() => {
                this.error_message = ''
            }, 5000);
        }
        
          
        }
  }
}
</script>

<style src="../assets/main.css"></style>