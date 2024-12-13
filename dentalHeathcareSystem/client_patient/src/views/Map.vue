
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
        map: '',
        get_all_clinics_url: '',
        error_message: '',
        confirmation_message: '',
    }
  },
    mounted() {
      this.initializeMap();
    this.get_all_clinics_url = import.meta.env.VITE_GET_ALL_CLINICS_URL;
      this.getClinics();
      window.addEventListener('resize', this.onResize);

  },
  methods: {
    initializeMap() {
        mapboxgl.accessToken = 'pk.eyJ1IjoiaWJyYWhpbS1hbHoiLCJhIjoiY200bG81NzNpMDN4ODJpc2Njbm80czRvayJ9.kSStc_U7hL0xeFYjXyAhkA';
        this.map = new mapboxgl.Map({
            container: 'mapbox',
            // style: 'mapbox://styles/mapbox/standard-satellite',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [11.9746, 57.7089],
            zoom: 8,
            collectResourceTiming: false,
            
        });
          this.map.on('load', () => {
              this.map.resize();
          });
    },
    onResize(){
      this.map.resize();
      },
      async getClinics() {
          
          var  clinicArr = [];
          try {
              var response = await Api.get(`${this.get_all_clinics_url}`);

              if (response.status === 200) {
                
                  clinicArr = response.data.clinics;

              }
          } catch (error) {
                this.error_message = 'Something went wrong. Clinics information not found!'
                setTimeout(() => {
                        this.error_message = ''
                }, 5000);
          }
          

          var clinics = clinicArr.map(clinic => {
              return {
                  type: 'Feature',
                  geometry: {
                      type: 'Point',
                      coordinates: [
                          clinic.location.coordinates[0],
                          clinic.location.coordinates[1],

                      ]
                  },
                  properties: {
                      icon: 'hospital'
                  }
              }

          });

          this.loadMap(clinics)
      },
      loadMap(clinics) {
          this.map.on('load', () => {
              this.map.addLayer({
                  id: 'points', 
                  type: 'symbol',
                  source: {
                      type: 'geojson',
                      data: {
                          type: 'FeatureCollection',
                          features: clinics,
                        
                    }
                  },
                  layout: {
                      'icon-image': '{icon}-15',
                      'icon-size': 3,
                      'icon-color': 'red',
                      'text-field': '{clinic_name}',
                      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                      'text-offset': [0, 0.9],
                      'text-anchor': 'top',


                }
            })
        })
    }
  }
}
</script>

<style src="../assets/main.css"></style>