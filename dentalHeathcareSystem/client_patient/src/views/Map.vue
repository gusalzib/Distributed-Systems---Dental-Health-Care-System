
<template>
<main>
    <div class="map-container">
      <h2>Map of all dentists in Gothenburg </h2>
      <div id='mapbox'></div>
    </div>
</main>
</template>

<script>
// @ is an alias to /src
import { Api } from '@/Api'
import mapboxgl from 'mapbox-gl'
export default {
  name: 'Map',
  data() {
    return {
      map: ''
    }
  },
  mounted() {
    this.initializeMap();
    window.addEventListener('resize', this.onResize)
  },
  methods: {
    initializeMap() {
      mapboxgl.accessToken = 'pk.eyJ1IjoiaWJyYWhpbS1hbHoiLCJhIjoiY200bG81NzNpMDN4ODJpc2Njbm80czRvayJ9.kSStc_U7hL0xeFYjXyAhkA';
      this.map = new mapboxgl.Map({
        container: 'mapbox',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [11.9746, 57.7089],
        zoom: 8
      });

      this.map.on('load', () => {
        this.map.resize();
      })
    },
    onResize(){
      this.map.resize();
    }
  }
}
</script>

<style src="../assets/main.css"></style>