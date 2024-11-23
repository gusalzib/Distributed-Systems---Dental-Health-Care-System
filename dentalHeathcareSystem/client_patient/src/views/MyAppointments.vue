<template>
  <main>
    <div class="my-appointments-container">
        <h1>My Appointments</h1>
        <div class="my-appointments-card">
            <!-- /*I added these span tags to the appointment card. I don't think it is necessary at the moment but later on, if we add more 
                information to the cards, we might need to increase their visual separation to make it easier to read. Right now, there are no labels on
                the card, which is also something that we might need to add later.*/ -->
            <h2><span class="clinic-name">Clinic name</span>  | <span class="appointment-date">09-08-2022 </span> 
                | <span class="appointment-time">13:30 </span> | <span class="appointment-address">Andersson Street 34E</span></h2>
            <button>Contact Clinic</button>
            <button class="cancel-button">Cancel Appointment</button>
            
        </div>

        <div class="my-appointments-card">
            <h2>Clinic name | 09-08-2022 | 13:30 | Andersson Street 34E</h2>
            <button>Contact Clinic</button>
            <button class="cancel-button">Cancel Appointment</button>
        </div>

        <div class="my-appointments-card">
            <h2>Clinic name | 09-08-2022 | 13:30 | Andersson Street 34E</h2>
            <button>Contact Clinic</button>
            <button class="cancel-button" @click="confirmCancellation()">Cancel Appointment</button>
        </div>
    </div>

    <div id="modal">
        <h2>You are cancelling your appointment at [Clinic name]. Are you sure you want to proceed?</h2>
        <button class="cancel-button">Yes</button>
        <button @click="rejectCancellation()">NO</button>
    </div>
  </main>
</template>


<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'my_appointments',
  data() {
    return {

    }
  },
  mounted() {

  },
    methods: {
        confirmCancellation() {
            var modal = document.getElementById('modal');
            modal.style.display = "block";
        },
        rejectCancellation() {
            var modal = document.getElementById('modal');
            modal.style.display = "none"
    }
  }
}
</script>

<style src="../assets/main.css"></style>