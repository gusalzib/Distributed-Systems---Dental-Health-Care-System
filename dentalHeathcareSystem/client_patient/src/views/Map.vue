
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
        get_all_clinic_appointments: '',
        error_message: '',
        confirmation_message: '',
        clinicID: '',
        icon_color: 'red',

    }
  },
    mounted() {
        this.initializeMap();
        this.get_all_clinic_appointments = import.meta.env.VITE_GET_CLINICS_APPOINTMENTS_URL;
        this.get_all_clinics_url = import.meta.env.VITE_GET_ALL_CLINICS_URL;
        this.getClinics();
        
        window.addEventListener('resize', this.onResize);

  },
  methods: {
    initializeMap() {
        mapboxgl.accessToken = 'pk.eyJ1IjoiaWJyYWhpbS1hbHoiLCJhIjoiY200bG81NzNpMDN4ODJpc2Njbm80czRvayJ9.kSStc_U7hL0xeFYjXyAhkA';
        this.map = new mapboxgl.Map({
            container: 'mapbox',
            style: 'mapbox://styles/mapbox/standard-satellite',
            // style: 'mapbox://styles/mapbox/streets-v11',
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
      async checkAvailableAppointments(clinicID) {

        var clinicAppointments = []
        try {
            var response = await Api.get(`${this.get_all_clinic_appointments}${clinicID}`);
            if (response.status === 200) {
                clinicAppointments = response.data.appointments;
                
            }

            

            if (clinicAppointments.length > 0) {                
                clinicAppointments.forEach(appointment => {
                    // console.log("this is the appointment printed: ", appointment);
                    if (appointment.available) {
                        this.icon_color = 'green'
                        return;
                    }
                    
                });
            }
            const hasAvailableAppointment = false;


        } catch (error) {
            console.log(error.message);
            
            this.error_message = 'Something went wrong. Clinics appointment information not found!'
            setTimeout(() => {
                    this.error_message = ''
            }, 5000);
        }
      },
      async getClinics() {
          
          var  clinicArr = [];
          try {
              var response = await Api.get(`${this.get_all_clinics_url}`);

              if (response.status === 200) {
                
                  clinicArr = response.data.clinics;

                  clinicArr.forEach(clinic => {
                    this.checkAvailableAppointments(clinic._id);
                  });

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
                      clinic_name: clinic.name,
                      icon: 'hospital',
                  }
              }

          });

          this.loadMap(clinics)
      },
      loadMap(clinics) {
          this.map.on('load', () => {

              this.map.addSource('clinics',{
                  type: 'geojson',
                  data: {
                      type: 'FeatureCollection',
                      features: clinics,

                  }
              });

              this.map.addLayer({
                  id: 'clinic-circles',
                  type: 'circle',
                  source: 'clinics',
                  paint: {
                      'circle-radius': 8,
                      'circle-color': this.icon_color,
                      'circle-stroke-width': 2,
                      'circle-stroke-color': 'black',

                  }
              });

              this.map.addLayer({
                  id: 'clinic-labels',
                  type: 'symbol',
                  source: 'clinics',
                  layout: {
                    'text-field': ['get', 'clinic_name'],
                    'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
                    'text-offset': [0, 1.5],
                    'text-anchor': 'top',
                  }, 
                  paint: {
                      'text-color': 'black',
                      'text-halo-width': 1,
                      'text-halo-color': 'white',
                    
                  }
              })

              // below is the code for hospital clinic icon. The icon color cannot be changed which is why i replaced with a circle. 
            //   this.map.addLayer({
            //       id: 'points', 
            //       type: 'symbol',
            //       source: 'clinics',
            //       layout: {
            //           'icon-image': '{icon}-15',
            //           'icon-size': 3,
            //           'icon-color': 'red',
            //           'text-field': '{clinic_name}',
            //           'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            //           'text-offset': [0, 0.9],
            //           'text-anchor': 'top',
            //     },
            //       paint: {
            //           'icon-color': ['get', 'color'],
            //           'text-color': 'black',
                    
            //     }
            // })
        })
    }
  }
}
</script>

<style src="../assets/main.css"></style>