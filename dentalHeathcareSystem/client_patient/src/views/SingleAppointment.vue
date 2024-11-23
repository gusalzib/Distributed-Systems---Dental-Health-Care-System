<template>
  <main>
        <div class="single-appointment-container">
            <div class="countdown">
                <p id="timer"></p>
                
            </div>
            <p><em>The time slot is now reserved for you to prevent double-bookings. Please finish the booking process before the time is up!</em></p>
            <h1>Patient information form</h1>
            <div class="patient-information-form">
                <label>Full name: </label>
                <!-- <input type="text" id="patient-name"  v-model="patient.name"> -->
                <label for="">{{ patient.name }}</label>
                <hr>
                <label>Social Security Number (SSN): </label>
                <!-- <input type="text" id="patient-ssn" v-model="patient.ssn"> -->
                 <label for="">{{ patient.ssn }}</label>
                <hr>

                <label>Phone number: </label>
                <input type="text" id="patient-phone" v-model="patient.phone_number">
                <hr>

                <label>Email: </label>
                <input type="email" id="patient-email" v-model="patient.email">
                <hr>

                <label>Address: </label>
                <input type="address" id="patient-address" v-model="patient.address">
                <hr>
                <button class="submit-button" @click="updatePatientInfo()">Update my information</button>
                <button class="submit-button">Confirm Appointment</button>
                <router-link to="/privacy_policy">Read about how we handle your information</router-link>
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
  name: 'singleAppointment',
  data() {
    return {
        patient: {
            name: '',
            email: '',
            phone_number: '',
            ssn: '',
            address: '',
        },
        patient_service_url: 'http://localhost:3000/api',
        current_patient_placeholder: '673a5173934efda9cdfa63a3',
        temp_appointment_id: '6742008522e2c7311c869e7a',
        confirmation_message: '',
        error_message: '',
        appointment: {
            available: false,
        },
    }
  },
    mounted() {
        this.getPatientInformation();
        this.countdown();
        this.reserveAppointment();
  },
    methods: {
        async bookAppointment(){
            await Api.post(`/appointments/${this.current_patient_placeholder}`).then(response => {
                if (response.status === 200) {
                    this.confirmation_message = 'Thanks for using Dentime. Appoitment booked successfully!';
                    setTimeout(() => {
                            this.confirmation_message = ''
                        }, 5000);
                }
            }).catch(error => {
                this.error_message = error.response?.data.message;
                setTimeout(() => {
                            this.error_message = ''
                        }, 5000);
            })
        },
        async reserveAppointment() {
            /* The appointment is reserved until the countdown timer is over or the appointment is booked */
            await Api.put(`/appointments/${this.temp_appointment_id}`, this.appointment).then(response => {
                if (response.status === 200) {
                    this.confirmation_message = 'The appointment is reserved in the system until the timer is up!';
                    setTimeout(() => {
                            this.confirmation_message = ''
                        }, 5000);
                }
            }).catch(error => {
                this.error_message = error.response?.data.message;
                setTimeout(() => {
                            this.error_message = ''
                        }, 5000);
            })
        },
        async getPatientInformation() {
            /* fetch the current patient information. This is needed to display the information to the user upon 
            booking the appointment. The information is displayed in editable input fields. The patient has the option to change the details 
            prior to booking the appointment. Example: the patient wants to change the contact phone number or email for this particular appointment */

            await Api.get(`/patients/${this.current_patient_placeholder}`).then(response => {
                if (response.status === 200) {
                    this.patient = response.data.patients;
                }
            }).catch(error => {
                console.log(error.message)
            })

            
        },
        async updatePatientInfo() {
            await Api.put(`/patients/${this.current_patient_placeholder}`, this.patient).then(response => {
                if (response.status === 200) {
                    this.confirmation_message = 'Updated successfully'
                    setTimeout(() => {
                            this.confirmation_message = ''
                        }, 5000);
                }
            }).catch(error => {
                setTimeout(() => {
                    this.error_message = error.message;
                }, 5000);
            })
        },
        countdown() {

            //set the timer 3 mintues ahead of the current time
            var countDownDate = new Date();
            countDownDate.setMinutes(countDownDate.getMinutes() + 3);
            countDownDate = countDownDate.getTime();


            // Update the count down time every 1 second until it reaches the end of 3 minutes
            var x = setInterval(function() {
                var now = new Date().getTime();

                var distance = countDownDate - now;

                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                document.getElementById("timer").innerHTML =  minutes + "m " + seconds + "s ";
                    
                if (distance < 0) {
                    clearInterval(x);
                    document.getElementById("timer").innerHTML = "EXPIRED";
                }
            }, 1000);
        }
  }
}
</script>

<style src="../assets/main.css"></style>