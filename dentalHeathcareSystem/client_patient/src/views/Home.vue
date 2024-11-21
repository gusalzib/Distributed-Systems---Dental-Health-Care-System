
<template>
  <main>
    <div class="map-container">
      <h2>Map of all dentists in Gothenburg (Just a placeholder map actually :-])</h2>
      <iframe id="google-map" src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d20820.916983666586!2d11.9831004988628!3d57.70592486446396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sse!4v1732126327706!5m2!1sen!2sse"  allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
    </div>

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
        <h2>How to book your appointment?</h2>
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
            If you want to learn more about how we handle your personal information, please visit this page </p><router-link class="additional-links"  to="/signup">Privacy policy</router-link>
        </div>

        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Confirm your booking:</span> review your details and click on the "Confirm Appointment" button. You will see a confirmation message shortly.</p>
        </div>
        
        <div class="instruction-card">
          <p class="instruction-item"><span class="instruction-span">Support:</span> do not hesitate to contact us if you run into problems or have any questions!</p>
        </div>
      </div>
    </div>
  </main>
</template>


<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'home',
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