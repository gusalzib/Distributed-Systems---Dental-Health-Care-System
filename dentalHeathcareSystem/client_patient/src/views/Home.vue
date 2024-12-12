
<template>
  <main>
    <Map></Map>

    <div id="divider"></div>

    <div class="home-page-container">
      <div class="announcements-container">
        <h1>Announcements</h1>
        <div class="announcement">
          <h2>Attention</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolor architecto dicta voluptate cupiditate voluptatum, harum magnam aut nulla hic, laudantium dolores dolore similique consequatur fugiat. Placeat assumenda asperiores neque ratione?</p>
        
        </div>
        <hr>
        <div class="announcement">
          <h2>Attention</h2>
          <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolor architecto dicta voluptate cupiditate voluptatum, harum magnam aut nulla hic, laudantium dolores dolore similique consequatur fugiat. Placeat assumenda asperiores neque ratione?</p>
        
        </div>
      </div>

      <br/>

      <div class="instructions-container">
        <h2>How to book an appointment?</h2>
        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Login:</span> before making a new appointment you have to login to your account, 
            or register yourself if you don't already have an account. You can register </p><router-link class="additional-links" to="/signup">here</router-link>
        </div>

        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Choose a time slot:</span> select an available time for your appointment. <em>Only open slots will be displayed. </em> </p><router-link class="additional-links" to="/signup">Make a new appointment</router-link>
        </div>
        
        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Pick your clinic:</span>Use the search bar to find and choose your preferred dental clinic. You can search either by name or address.</p>
        </div>

        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Fill in your personal information:</span> After selecting the clinic, date and time slot, fill in your name, 
            contact information and any additional notes for the dentist. 
            If you want to learn more about how we handle your personal information, please visit this page </p><router-link class="additional-links"  to="/privacy_policy">Privacy policy</router-link>
        </div>

        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Confirm your booking:</span> review your details and click on the "Confirm Appointment" button. You will see a confirmation message shortly.</p>
        </div>
        
        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Support:</span> do not hesitate to contact us if you run into problems or have any questions!</p>
        </div>
      </div>
          
      <div class="instructions-container">
        <h2>How to cancel an appointment?</h2>
        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Login:</span> before cancelling an appointment you have to login to your account using your credentials. </p>
        </div>

        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Navigate to your appointments:</span> go to "My Appointments" page. You can find it at the top once you have logged in or access it from here: 
           </p><router-link class="additional-links" to="/my_appointments">My Appointments</router-link>
        </div>
        
        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Cancel the appointment:</span> click on the "Cancel Appointment" button. <em>You will be asked to confirm your cancellation</em></p>
        </div>

        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Note:</span> Please note that cancelling an appointment less than 24 hours in 
            advance will result in additional fees up to <span style="color: red;">200 SEK</span>. If the appointment was cancelled by the clinic for any reason, 
            you will be notified via email.</p>
        </div>


      </div>
    </div>
  </main>
</template>

<script>
// @ is an alias to /src
import { Api } from '@/Api'
import mapboxgl from 'mapbox-gl'
import  Map  from "@/views/Map.vue";
export default {
  name: 'home',
  components: {
    Map
  },
  data() {
    return {
    }
  },
  mounted() {

  },
  methods: {
    
  }
}
</script>

<style src="../assets/main.css"></style>