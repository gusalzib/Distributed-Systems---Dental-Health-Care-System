
<template>
<main>
    <div class="map-container">
      <h2>Map of all dental clinics in Gothenburg </h2>
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
        get_clinics_available_appointments_url: '',
        get_specific_appointment_url: '',
        mapbox_access_token: '',
        error_message: '',
        confirmation_message: '',
        clinicID: '',
        icon_color: '',
        
        clinics: [{
            _id:'',
            name: '',
            availabilityFlag: false,
            numOfAvailableAppointments: 0,
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
        
        this.mapbox_access_token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
        this.get_specific_appointment_url = import.meta.env.VITE_GET_SPECIFIC_APPOINTMENTS_URL;
        this.get_clinics_available_appointments_url = import.meta.env.VITE_GET_CLINICS_AVAILABLE_APPOINTMENTS_URL;
        this.get_all_clinics_url = import.meta.env.VITE_GET_ALL_CLINICS_URL;
        this.initializeMap();
        this.getClinics();
        
        window.addEventListener('resize', this.onResize);

  },
  methods: {
    initializeMap() {
        mapboxgl.accessToken = this.mapbox_access_token;
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
      if(this.map) this.map.resize();                             
      },
      
      async getClinics() {
          
          try {
              const response = await Api.get(`${this.get_all_clinics_url}`);

              if (response.status === 200) {
                  this.clinics = response.data.clinics;
                  
                  for(const clinic of this.clinics){
                    try{
                        var responseArr = await Api.get(`${this.get_clinics_available_appointments_url}${clinic._id}`);
                       
                        clinic.appointments = responseArr.data.appointments.appointments;
                        
                        var tempArr = responseArr.data.appointments.appointments;
                        clinic.numOfAvailableAppointments = tempArr.length;
                        
                        if (clinic.numOfAvailableAppointments === 0) {
                            clinic.clinicColor = 'red'
                        } else {
                            clinic.clinicColor = 'green'
                        }
                    }catch(error) {
                        this.error_message = error.message;
                        clinic.clinicColor = 'blue'
                    }
                }
              
                const validClinics = this.clinics
                    .map(clinic => ({
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
                            numOfAppointments: clinic.numOfAvailableAppointments,
                            clinicID: clinic._id,
                            icon: 'hospital',
                        }
                    }));

                this.loadMap(validClinics);
            }
          } catch (error) {
            this.error_message = 'Something went wrong. Clinics information not found!'
            setTimeout(() => {
                this.error_message = ''
            }, 10000);
          }
      },

      loadMap(clinics) {
            if(this.map.getSource('clinics')){
                this.map.getSource('clinics').setData({
                    type: 'FeatureCollection',
                    features: clinics
                });
            }else{
                this.map.addSource('clinics',{
                    type: 'geojson',
                    data: {
                      type: 'FeatureCollection',
                      features: clinics,
                    },
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
                    },
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
                    },
                });
            }
        

            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,    
            });

            this.map.on('mouseenter', 'clinic-circles', (element) => {
                this.map.getCanvas().style.cursor = 'pointer';

            
                const coordinates = element.features[0].geometry.coordinates.slice();
                const formattedAddress = element.features[0].properties.formattedAddress;
                const availableAppointments = element.features[0].properties.numOfAppointments;

                    if (['mercator', 'equirectangular'].includes(this.map.getProjection().name)) {
                        while (Math.abs(element.lngLat.lng - coordinates[0]) > 180) {
                            coordinates[0] += element.lngLat.lng > coordinates[0] ? 360 : -360;
                        }
                    }
                    popup.setLngLat(coordinates).setHTML(`<p><span>Address:</span> ${formattedAddress}</p>
                    <p><span>Number of available appointments:</span> ${availableAppointments}</p>
                    <p><em>Click to go to clinic page<em></p>`).addTo(this.map);

                });

                this.map.on('mouseleave', 'clinic-circles', () => {
                    this.map.getCanvas().style.cursor = '';

                    popup.remove();
                });

                this.map.on('click', 'clinic-circles', (element) => {
                    const properties = element.features[0].properties;

                    const clinicID = properties.clinicID;

                    if (clinicID) {
                        this.$router.push(`/clinic/${clinicID}`)
                    } else {
                        this.error_message = 'Something went wrong. Clinics information not found!'
                        setTimeout(() => {
                                this.error_message = ''
                        }, 10000);
                    }

                });
                

            },
        },
    
    } 

</script>

<style src="../assets/main.css"></style>