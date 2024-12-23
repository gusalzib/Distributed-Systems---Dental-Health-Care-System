<template>
  <main>
        <div class="login-container">
            
          <div class="login-navbar">
            <a id="navbar-links" @click.native="setActive('patient_login')">User Login</a>
            <a id="navbar-links" @click.native="setActive('dentist_login')">Dentist Login</a>
          </div>

          <div class="login-card">
            <!-- patient login  -->
            <div id="patient_login" class="login-form" v-if="activeSection === 'patient_login'">
                <h1>User Login</h1>

                <label>Email:* </label>
                <input type="email" id="patient-email" v-model="patient.email" required>
                <hr>

                <label>Password:* </label>
                <input type="password" id="password" v-model="patient.password" required>
                <strong>Show Password</strong>
                <input type="checkbox" v-on:click="toggle()">
                <hr>
                <button class="submit-button" @click="patientLogin()">Login</button>

                <router-link to="/privacy_policy">Read about how we handle your information</router-link>
                <router-link to="/registration">Not registered yet? Register your account by following this link</router-link>
                <p>Obligatory fields *</p>
                <div class="confirmation_message">{{ confirmation_message }}</div>
                <div class="error_message">{{ error_message }}</div>
            </div>

            <!--  dentist login  -->
            <div  id="dentist_login" class="login-form" v-if="activeSection === 'dentist_login'">
                <h1>Dentist Login</h1>

                <label>Email:* </label>
                <input type="email" id="patient-email" v-model="dentist.email" required>
                <hr>

                <label>Password:* </label>
                <input type="password" id="password" v-model="dentist.password" required>
                <strong>Show Password</strong>
                <input type="checkbox" v-on:click="toggle()">
                <hr>
                <button class="submit-button" @click="dentistLogin()">Login</button>

                <router-link to="/privacy_policy">Read about how we handle your information</router-link>
                <router-link to="/registration">Not registered yet? Register your account by following this link</router-link>
                <p>Obligatory fields *</p>
                <div class="confirmation_message">{{ confirmation_message }}</div>
                <div class="error_message">{{ error_message }}</div>
            </div>
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
      activeSection: 'patient_login',
      patient: {
          email: '',
          password: ''
      },
      dentist: {
          email: '',
          password: ''
      },
      find_patient_url: '',
      find_dentist_url: '',
      confirmation_message: '',
      error_message: '',

    }
  },
    mounted() {
      this.find_patient_url = import.meta.env.VITE_FIND_PATIENT;
      this.find_dentist_url = import.meta.env.VITE_FIND_DENTIST;
  },
  methods: {
    setActive(section) {
      this.activeSection = section; 
      },
      async patientLogin() {

        try {
          const response = await Api.post(`${this.find_patient_url}`, this.patient)          
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
          // console.log(error.message);
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
    async dentistLogin() {

        try {
          const response = await Api.post(`${this.find_dentist_url}`, this.dentist)
          
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
          // console.log(error.message);
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