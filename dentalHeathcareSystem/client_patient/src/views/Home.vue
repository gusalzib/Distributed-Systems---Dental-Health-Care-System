
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