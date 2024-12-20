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
                <input type="password" id="password" v-model="patient.password" required>
                <strong>Show Password</strong>
                <input type="checkbox" v-on:click="toggle()">
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
      find_patient_url: '',
      confirmation_message: '',
      error_message: '',

    }
  },
    mounted() {
      this.login_url = import.meta.env.VITE_LOGIN_URL;
      this.find_patient_url = import.meta.env.VITE_FIND_PATIENT;
  },
    methods: {
      async login() {

        try {
          // const response = await Api.post(`${this.login_url}`, this.patient)
          console.log(this.find_patient_url);
          const response = await Api.post(`${this.find_patient_url}`, this.patient)
          
          console.log(response.status);
          
          if (response.status === 200) {
            setTimeout(() => {
              this.$router.push('/');
            }, 1000)
            
            this.confirmation_message = 'Login successfull!';
            setTimeout(() => {
                this.confirmation_message = ''
            }, 5000);
            
          }

        } catch (error) { 
          console.log(error.message);
             if ( error.response?.status === 401) {
              this.error_message = 'Incorrect password!';
              setTimeout(() => {
                  this.error_message = ''
              }, 5000);

            }else if (error.response?.status === 404) {
              this.error_message = 'There is no user with this email';
              setTimeout(() => {
                  this.error_message = ''
              }, 5000);

            } else {
              this.error_message = 'Login failed. Please check password and email.';
              setTimeout(() => {
                  this.error_message = ''
              }, 10000);
          }


        }
        
        
          
      },
    toggle() {
          
            let temp = document.getElementById("password");
             
            if (temp.type === "password") {
                temp.type = "text";
            }
            else {
                temp.type = "password";
            }
        
      },
  }
}
</script>

<style src="../assets/main.css"></style>