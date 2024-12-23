<template>
  <main>
        <div class="single-appointment-container">
            <div class="countdown">
                <p id="timer"></p>
                
            </div>
            <div class="single-appointment-card">
                <h2>Appointment overview:</h2>
                <ol style="list-style: square;">
                    <li><p>Date: {{ this.date }}</p></li>
                    <li><p>Start: {{ this.appointmentStart }}</p></li>
                    <li><p>End: {{ this.appointmentEnd }}</p></li>
                    <li><p>Type of appointment: {{ appointment.type_of_appointment ? appointment.type_of_appointment : "General checkup"}}</p></li>
                </ol>
                
                
                
            </div>
            <div class="divider-50"></div>
            <hr>
            
            <ul>
                <li><p><em>The time slot is now reserved for you to prevent double-bookings. Please finish the booking process before the time is up!</em></p></li>
                <li><p><em>The appointment is reserved until the time is up or <span style="color: red;"> until you leave the page.</span></em></p></li>
                <li><p><em>Please note that updating you contact information here means a change to contact information on your account.</em></p></li>
            </ul>
            <hr>
            
            
            <h1>Patient information form</h1>
            <div class="patient-information-form">
                <label>Full name: </label>
                <!-- <input type="text" id="patient-name"  v-model="patient.name"> -->
                <label for="">{{ patient.name }}</label>
                <hr>
                <label>Social Security Number (SSN): </label>
                <!-- <input type="text" id="patient-ssn" v-model="patient.ssn"> -->
                 <label for="">{{ patient.ssn }}</label>
                <hr>

                <label>Phone number: </label>
                <input type="text" id="patient-phone" v-model="patient.phone_number">
                <hr>

                <label>Email: </label>
                <input type="email" id="patient-email" v-model="patient.email">
                <hr>

                <label>Address: </label>
                <input type="address" id="patient-address" v-model="patient.address">
                <hr>
                <button class="submit-button" @click="updatePatientInfo()">Update my information</button>
                <!-- <button class="submit-button" @click="openPopup()">Confirm Appointment</button> -->
                <button class="submit-button" @click="openPopup()">Confirm Appointment</button>
                <router-link to="/privacy_policy">Read about how we handle your information</router-link>
                <div class="confirmation_message">{{ confirmation_message }}</div>
                <div class="error_message">{{ error_message }}</div>
            </div>
        </div>
        <div class="popup-container" >
            <!-- <button type="submit" class="btn"> Submit!</button> -->
            <div class="popup" id="popup">
                <h2>Is this the appointment you want to book?</h2>
                <p>Date: {{date}} Time: {{appointmentStart}}</p>
                <button type="button" @click="bookAppointment()">Yes</button>
                <button type="button" @click="closePopup()">No</button>
            </div>
        </div>
  </main>
</template>


<script>



// @ is an alias to /src
import { Api } from '@/Api'
import router from '@/router'


export default {
  name: 'singleAppointment',
  data() {
    return {
        patient: {
            name: '',
            email: '',
            phone_number: '',
            ssn: '',
            address: '',
            appointments: []
        },
        current_patient_placeholder: '6759e3f57a30ebf177f326c7',
        // current_patient_placeholder:'674516312f3c59c02e4df78d',
        confirmation_message: '',
        error_message: '',
        appointment: {
            patient_id: "",
            dentist_id:"",
            dentist_clinic_id: "",
            type_of_appointment:"",
            date_and_time_from:"",
            date_and_time_until:"",
            available: false,
        },
        allowedTimeMinutes: 3,
        date: '',
        appointmentStart: '',
        appointmentEnd: '',

        patient_get_specific_url: '',
        appointments_get_specific_url: '',
        update_appointment_url: '',
        update_patient_specific_url: '',
        appointmentID: '',
        
    }
  },
  mounted() {
        this.patient_get_specific_url = import.meta.env.VITE_PATIENT_GET_SPECIFIC_URL;
        this.update_patient_specific_url = import.meta.env.VITE_UPDATE_PATIENT_SPECIFIC_URL;
        this.appointments_get_specific_url = import.meta.env.VITE_GET_SPECIFIC_APPOINTMENTS_URL;
        this.update_appointment_url = import.meta.env.VITE_UPDATE_APPOINTMENT_URL;
        
        this.watchActivity();
        this.getAppointmentInfo();
        this.extractTimeAndDate();
        this.getPatientInformation();
        this.countdown();
        
        
  },
  beforeRouteEnter: async (to,from,next) => {           //Updates appointment.available to false upon entering the page
    try {
        const appointmentID = to.params.appointmentID;
        const update_appointment_url = import.meta.env.VITE_UPDATE_APPOINTMENT_URL
        await Api.put(`${update_appointment_url}${appointmentID}`, {available: false});
        next();
        
    } catch(error) {
        console.error = 'Failed to update appointments availability';
        
    }
  },
  beforeRouteLeave(to, from, next) {                          //Updates appointment.available to true if page is left without booking
    
    if(to.path.startsWith(`/bookingConfirmation/`)){
        next();
    }else{
        this.updateAppointment();
        next();
    }
  },

    methods: {
        openPopup(){
            var popup = document.getElementById("popup");
            popup.classList.add("open-popup")
        },

        closePopup(){
            var popup = document.getElementById("popup");
            popup.classList.remove("open-popup")
        },

        async getAppointmentInfo() {
            const appointmentID = this.$route.params.appointmentID;
            
            await Api.get(`${this.appointments_get_specific_url}${appointmentID}`).then(response => {
                if (response.status === 200) {
                    this.appointment = response.data.appointments;
                    
                }
            }).catch(error => {
                this.error_message = error.response?.data.message;
                setTimeout(() => {
                            this.error_message = ''
                        }, 5000);
            })
        },
        async bookAppointment() {
            this.closePopup();
            await this.addAppointmentToPatient();
            const appointmentID = this.$route.params.appointmentID;
            this.appointment.available = false; 
            
            this.appointment.patient_id = this.current_patient_placeholder;
                await Api.put(`${this.update_appointment_url}${appointmentID}`, this.appointment).then(response => {
                if (response.status === 200) {
                    router.push({path: `/bookingConfirmation/${appointmentID}`})
                }
            }).catch(error => {
                this.error_message = error.response?.data.message;
                setTimeout(() => {
                            this.error_message = ''
                        }, 5000);
            })
        },
        async updateAppointment() {
            const appointmentID = this.$route.params.appointmentID;
            this.appointment.available = true; //update the state of the appointment before sending the put request
            
            /* The appointment is reserved until the countdown timer is over or the appointment is booked */
            await Api.put(`${this.update_appointment_url}${appointmentID}`, this.appointment).then(response => {
                if (response.status === 200) {
                    this.confirmation_message = 'The appointment is reserved in the system until the timer is up!';
                    setTimeout(() => {
                            this.confirmation_message = ''
                        }, 5000);
                }
            }).catch(error => {
                this.error_message = error.response?.data.message;
                setTimeout(() => {
                            this.error_message = ''
                        }, 5000);
            })
        },
        async getPatientInformation() {
            /* fetch the current patient information. This is needed to display the information to the user upon 
            booking the appointment. The information is displayed in editable input fields. The patient has the option to change the details 
            prior to booking the appointment. Example: the patient wants to change the contact phone number or email for this particular appointment */

            await Api.get(`${this.patient_get_specific_url}${this.current_patient_placeholder}`).then(response => {
                if (response.status === 200) {
                    this.patient = response.data.patients;    
                    
                }
            }).catch(error => {
                this.error_message = 'Something went wrong. Patient information not found!'
                setTimeout(() => {
                        this.error_message = ''
                    }, 5000);
            })

            
        },
        async updatePatientInfo() {
            await Api.put(`${this.update_patient_specific_url}${this.current_patient_placeholder}`, this.patient).then(response => {
                if (response.status === 200) {
                    this.confirmation_message = 'Updated successfully'
                    setTimeout(() => {
                            this.confirmation_message = ''
                        }, 5000);
                }
            }).catch(error => {
                this.error_message = error.response?.data.message;
                setTimeout(() => {
                    this.error_message = '';
                }, 5000);
            })
        },
        async addAppointmentToPatient() {
            
            const appointmentID =  (`${this.$route.params.appointmentID}`);
            var newAppointment= {appointment_id: appointmentID};
            this.patient.appointments.push(newAppointment);
            
            await Api.put(`${this.update_patient_specific_url}${this.current_patient_placeholder}`,this.patient).then(response => {
                if (response.status === 200) {
                    this.confirmation_message = 'Updated successfully'
                    this.getPatientInformation();
                    setTimeout(() => {
                            this.confirmation_message = ''
                        }, 5000);
                }
            }).catch(error => {
                this.error_message = error.response?.data.message;
                setTimeout(() => {
                    this.error_message = ''
                }, 5000);
            })
        },
        countdown() {

            //set the timer 3 mintues ahead of the current time
            var countDownDate = new Date();
            countDownDate.setMinutes(countDownDate.getMinutes() + this.allowedTimeMinutes);
            countDownDate = countDownDate.getTime();


            // Update the count down time every 1 second until it reaches the end of 3 minutes
            var x = setInterval(() => {
                var now = new Date().getTime();

                var distance = countDownDate - now;

                var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                var seconds = Math.floor((distance % (1000 * 60)) / 1000);

                var timer = document.getElementById("timer")
                if (timer) {
                    timer.innerHTML =  minutes + "m " + seconds + "s ";
                }
                
                    
                if (distance < 0) {
                    clearInterval(x);
                    document.getElementById("timer").innerHTML = "EXPIRED";

                    //make appointment available again for other users and exit the page
                    this.exitPage();


                }
            }, 1000);
        },
        async extractTimeAndDate() {
            await this.getAppointmentInfo();

            var tempFrom = this.appointment.date_and_time_from
            var fromArr = tempFrom.split("T");

            this.date = fromArr[0];
            this.appointmentStart = fromArr[1];
            var appStartArr = this.appointmentStart.split(":");
            this.appointmentStart = appStartArr[0] + ":" + appStartArr[1]

            var tempUntil = this.appointment.date_and_time_until
            var unitlArr = tempUntil.split("T");

            this.appointmentEnd = unitlArr[1];
            var appEndArr = this.appointmentEnd.split(":");
            this.appointmentEnd = appEndArr[0] + ":" + appEndArr[1]

        },
        watchActivity() {
            //watch the user activity. if the user leaves, then the appointment slot if released and set to available = true again.
            document.addEventListener("visibilitychange", () => {
                if (document.hidden) {
                    this.exitPage();
                }
            })
        },
        exitPage() {
            
            this.updateAppointment();
            window.location.replace('/');
        }
  }
}
</script>

<style src="../assets/main.css"></style>