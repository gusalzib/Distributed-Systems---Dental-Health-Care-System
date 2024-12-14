
<template>
<main>
    <div class="map-container">
      <h2>Map of all dentists in Gothenburg </h2>
      <div id='mapbox'></div>
      <div class="error_message">{{ error_message }}</div>
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
        get_specific_appointment_url: '',
        error_message: '',
        confirmation_message: '',
        clinicID: '',
        icon_color: '',
        
        clinics: [{
            name: '',
            availabilityFlag: false,
            clinicColor: '',
            email: '',
            phoneNumber: '',
            appointments: [],
            dentists: [],
            location: {
                type: '',
                coordinates: [],
                formattedAddress: '',
            },
            
        }]

    }
  },
    mounted() {
        this.initializeMap();
        this.get_specific_appointment_url = import.meta.env.VITE_GET_SPECIFIC_APPOINTMENTS_URL;
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

      async checkAppointmentAvailability(appointmentsArr) {
        var tempArr = []
        appointmentsArr.forEach(appointment => {
            if (this.getAppointment(appointment.appointment_id)) {
                tempArr.push(appointment)
            } 
          });
        if (tempArr.length === 0) {
            return false;
        }else{
            return  true;
        }
        //return appointmentsArr.some(appointment => appointment.appointments.available)
      },
      async getAppointment(appointmentID){
        try {
            var response = await Api.get(`${this.get_specific_appointment_url}${appointmentID}`)

            if (response.status === 200) {
                var available = response.data.appointments.available
                // console.log("availability checks ", available, 'appointment id: ', appointmentID);
                
                if (available === true) {
                    return available;
                } else {
                    return false;
                }
            } 
        } catch (error) {
                this.error_message = 'Something went wrong. Appointments information not found!'
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
                
                  this.clinics = response.data.clinics;

                  await Promise.all(
                    this.clinics.map(async (clinic) => {
                        clinic.availabilityFlag = await this.checkAppointmentAvailability(clinic.appointments);
                        console.log('addresses ', clinic.location.formattedAddress)
                        if (clinic.availabilityFlag) {
                            clinic.clinicColor = 'green'
                        } else {
                            clinic.clinicColor = 'red'
                        }
                    })
                  )
              }
            //   await this.checkAppointmentAvailability(clinicArr)
              console.log("all clinics", this.clinics);
              
              let clinics = this.clinics.map((clinic) => {        
                
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
                        color: clinic.clinicColor,
                        formattedAddress: clinic.location.formattedAddress,
                        icon: 'hospital',
                    }
                }
            });
            this.loadMap(clinics)
          } catch (error) {
                this.error_message = 'Something went wrong. Clinics information not found!'
                setTimeout(() => {
                        this.error_message = ''
                }, 5000);
          }
          
          
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
                      'circle-color': ['get', 'color'],
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

              const popup = new mapboxgl.Popup({
                  closeButton: false,
                  closeOnClick: false,
                
              })

                this.map.on('mouseenter', 'clinic-circles', (element) => {
                    this.map.getCanvas().style.cursor = 'Pointer';

                    const coordinates = element.features[0].geometry.coordinates.slice();
                    const formattedAddress = element.features[0].properties.formattedAddress;

                    if (['mercator', 'equirectangular'].includes(this.map.getProjection().name)) {
                        while (Math.abs(element.lngLat.lng - coordinates[0]) > 180) {
                            coordinates[0] += element.lngLat.lng > coordinates[0] ? 360 : -360;
                        }
                    }
                    popup.setLngLat(coordinates).setHTML(`<p>${formattedAddress}</p>`).addTo(this.map);

                });

                this.map.on('mouseleave', 'clinic-circles', () => {
                    this.map.getCanvas().style.cursor = '';

                    popup.remove();
                });
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