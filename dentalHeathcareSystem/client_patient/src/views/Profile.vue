<template>
  <div>

      <div class="single-patient-container">
            <div class="single-patient-sidebar">
                <div id="single-patient-sidebar-menu">
                    <h3>Control Panel</h3>
                    <a id="sidebar-links" @click.native="setActive('my_profile')">My profile</a>
                    <a id="sidebar-links" @click.native="setActive('edit_profile')">Edit profile</a>
                    <a id="sidebar-links" @click.native="setActive('subscriptions')" @click="">Subscriptions</a>
                    <a id="sidebar-links" @click.native="setActive('booked_appointments')"> Booked Appointments</a>
                    <a id="sidebar-links" @click.native="setActive('medical_journal')" >My Medical Journal</a>
                </div>
            </div>

            <div id="single-patient-card">
                <div id="edit-profile" v-if="activeSection === 'edit_profile'">
                    <h3>Edit Profile</h3>
                    
                        <label>Name: </label>
                        <input v-model="patient.name" type="text" id="name"/>
                        </br>
                        <label>Email: </label>
                        <input v-model="patient.email" type="email" id="email"/>
                        </br>
                        <label>SSN: </label>
                        <input v-model="patient.ssn" type="text" id="ssn"/>
                        </br>
                        <label>Phone number: </label>
                        <input v-model="patient.phone_number" type="text" id="phone_number"/>
                        </br>
                        <label>Address: </label>
                        <input v-model="patient.address" type="address" id="address"/>
                        </br>
                        <label>Password: </label>
                        <input v-model="patient.password" type="password" id="password"/>
                        <input type="checkbox" v-on:click="toggle()">
                        </br>

                        <button id="update-button" class="submit-button" v-on:click="updatePatientInfo()" type="button">Update</button>
                </div>

                <div v-else-if="activeSection === 'subscriptions'">
                    <h3>My Subscriptions</h3>
                    <div class="subs-container">
                        <div class="sub">
                            <h4>Subscription 1</h4>
                            <p>Time period: 13.00 to 14.00</p>
                            <button>Unsubscribe</button>
                        </div>
                        <hr>
                        <div class="sub">
                            <h4>Subscription 1</h4>
                            <p>Time period: 13.00 to 14.00</p>
                            <button>Unsubscribe</button>
                        </div>
                        <hr>
                    </div>

                </div>
                <div v-else-if="activeSection === 'booked_appointments'">
                    <h3>My Appointments</h3>
                    <MyAppointments />
                </div>
                <div v-else-if="activeSection === 'medical_journal'">
                    <h3>Medicla Journal</h3>
                    <MedicalJournal />
                </div>
                <div v-else>
                    <h3 id="single-patient-detail">{{ patient.name }}</h3>
                    <hr>
                    <p >Phone: {{ patient.phone_number }} </p>
                    <p >E-mail:  {{ patient.email }}</p>
                    <p >Address:  {{ patient.address }}</p>
                    <p >SSN:  {{ patient.ssn }}</p>
                </div>
                <div id="confirmation_message" class="confirmation_message">{{ confirmation_message }}</div>
                  <div id="error_message" class="error_message">{{ error_message }}</div>
            </div>
      </div>



    
  </div>
</template>

<script>

// @ is an alias to /src
import { Api } from '@/Api';
import MyAppointments from '@/views/MyAppointments.vue';
import MedicalJournal from '@/views/MedicalJournal.vue';

export default {
    name: 'profile',
    components: {
        MyAppointments,
        MedicalJournal
  },
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
      error_message: '',
          confirmation_message: '',
          activeSection: '',
        current_patient_placeholder: '673a5173934efda9cdfa63a3',
          // current_patient_placeholder:'674516312f3c59c02e4df78d',
          bookedAppoinmentsIds: [],
          bookedAppoinments: [],
          bookedAppointemnt: {
            patient_id: "",
            dentist_id:"",
            dentist_clinic_id: "",
            type_of_appointment:"",
            date_and_time_from:"",
            date_and_time_until:"",
            available:"",
          }
    }
    },
    mounted() {
        this.getPatientInformation();
        
  },
    methods: {
        setActive(section) {
            try {
                this.activeSection = section;
            } catch (error) {
                this.error_message = error.message;
            }
        }, 
        toggle() {
            
                let temp = document.getElementById("password");
                
                if (temp.type === "password") {
                    temp.type = "text";
                }
                else {
                    temp.type = "password";
                }
            
        },
        async getPatientInformation() {
            /* fetch the current patient information. This is needed to display the information to the user upon 
            booking the appointment. The information is displayed in editable input fields. The patient has the option to change the details 
            prior to booking the appointment. Example: the patient wants to change the contact phone number or email for this particular appointment */

            await Api.get(`/patients/${this.current_patient_placeholder}`).then(response => {
                if (response.status === 200) {
                    this.patient = response.data.patients;
                    
                    
                }
            }).catch(error => {
                this.error_message = 'Something went wrong. Patient information not found!'
                setTimeout(() => {
                        this.error_message = ''
                    }, 5000);
                console.log(error.message)
            })

            
        },
        async updatePatientInfo() {
            await Api.put(`/patients/${this.current_patient_placeholder}`, this.patient).then(response => {
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
        }
  }
}
</script>

<style src="../assets/main.css"></style>