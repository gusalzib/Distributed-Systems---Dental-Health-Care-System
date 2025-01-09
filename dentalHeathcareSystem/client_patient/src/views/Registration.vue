<template>
  <main>
        <div class="registration-container">
            
            <div class="patient-information-form">
                <h1>Registration form</h1>
                <label>Full name:* </label>
                <input type="text" id="patient-name"  v-model="patient.name" placeholder="sven svensson" required>
                <hr>
                <label>Social Security Number (SSN):* </label>
                <input type="text" id="patient-ssn" v-model="patient.ssn" placeholder="yyyymmdd-digits" required>
                <hr>

                <label>Phone number:* </label>
                <input type="tel" id="patient-phone" v-model="patient.phone_number" placeholder="07xx xxx xxx" required>
                <hr>

                <label>Email:* </label>
                <input type="email" id="patient-email" v-model="patient.email" placeholder="myemail@gmail.com" required>
                <hr>

                <label>Address:* </label>
                <input type="address" id="patient-address" v-model="patient.address" placeholder="mystreet 44e 41432 göteborg" required>
                <hr>
                <label>Select the region you prefer:*</label>
                <select id="patient-region" v-model="patient.region" required>
                  <option value="" disabled selected> Select you region </option>
                  <option value="Blekinge">Blekinge</option>
                  <option value="Dalarna">Dalarna</option>
                  <option value="Gotland">Gotland</option>
                  <option value="Gävleborg">Gävleborg</option>
                  <option value="Göteborg">Göteborg</option>
                  <option value="Halland">Halland</option>
                  <option value="Jämtland">Jämtland</option>
                  <option value="Jönköping">Jönköping</option>
                  <option value="Kalmar">Kalmar</option>
                  <option value="Kronoberg">Kronoberg</option>
                  <option value="Norrbotten">Norrbotten</option>
                  <option value="Skåne">Skåne</option>
                  <option value="Stockholm">Stockholm</option>
                  <option value="Södermanland">Södermanland</option>
                  <option value="Uppsala">Uppsala</option>
                  <option value="Värmland">Värmland</option>
                  <option value="Västerbotten">Västerbotten</option>
                  <option value="Västernorrland">Västernorrland</option>
                  <option value="Västmanland">Västmanland</option>
                  <option value="Västra Götaland">Västra Götaland</option>
                  <option value="Örebro">Örebro</option>
                  <option value="Östergötland">Östergötland</option>
                </select>
                <label>Password:* </label>
                <input type="password" id="password" v-model="patient.password" required>
                <strong>Show Password</strong>
                <input type="checkbox" v-on:click="toggle()">
                <hr>
                <button class="submit-button" @click="registerUser()">Register</button>
                <router-link to="/privacy_policy">Read about how we handle your information</router-link>
                <router-link to="/login">Already registered? Login in to your account by following this link</router-link>
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
  name: 'registration',
  data() {
    return {
        patient: {
            name: '',
            email: '',
            phone_number: '',
            ssn: '',
            address: '',
            password: '',
            region: ''
      },

      signup_url: '',
      find_patient_url: '',
      confirmation_message: '',
      error_message: '',
    }
  },
    mounted() {
      this.signup_url = import.meta.env.VITE_CREATE_PATIENT_URL;
      this.find_patient_url = import.meta.env.VITE_FIND_PATIENT;
  },
    methods: {
      async registerUser() {
          try {
            const response = await Api.post(`${this.signup_url}`, this.patient);
            
            if (response.status === 200) {
              this.confirmation_message = 'Account created successfully!';
              setTimeout(() => {
                  this.confirmation_message = ''
              }, 10000);
              
              setTimeout(() => {
                this.$router.push('/login');
              }, 1000);
            }
          } catch (error) {
              if ( error.response?.status === 401) {
                this.error_message = 'A user with this email already exists!';
                setTimeout(() => {
                    this.error_message = ''
                }, 10000);

              } else if (error.response?.status === 400) {
                this.error_message = error.response?.data.message;
                setTimeout(() => {
                    this.error_message = ''
                }, 10000);

              } else {
                this.error_message = 'Registration failed!';
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