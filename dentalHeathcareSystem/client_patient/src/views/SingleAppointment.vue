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
                <input type="text" id="patient-name"  v-model="patient.name">
                <hr>
                <label>Social Security Number (SSN): </label>
                <input type="text" id="patient-ssn" v-model="patient.ssn">
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
                <button class="submit-button">Confirm Appointment</button>
                <router-link to="/privacy_policy">Read about how we handle your information</router-link>
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
    }
  },
  mounted() {
      this.countdown();
  },
    methods: {
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