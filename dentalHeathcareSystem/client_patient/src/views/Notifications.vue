<template>
  <main>
    <div class="notifications-container">
        <div class="notification">
            <div class="notification-header">
                <div class="circle"></div>
                <h2>Cancelled appointment</h2>
            </div>
            <div class="notification-body">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem fugit iusto repellat? Explicabo dicta adipisci vel 
                    at provident facere similique impedit exercitationem assumenda quae veniam asperiores voluptas, eius maiores deserunt?</p>
            </div>
        </div>

        <div class="notification">
            <div class="notification-header">
                <div class="circle"></div>
                <h2>Holidays coming!</h2>
            </div>
            <div class="notification-body">
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Exercitationem fugit iusto repellat? Explicabo dicta adipisci vel 
                    at provident facere similique impedit exercitationem assumenda quae veniam asperiores voluptas, eius maiores deserunt?</p>
            </div>
        </div>
    </div>
  </main>
</template>


<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'notifications',
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