<template>
  <div>

      <div class="single-patient-container">
            <div class="single-patient-sidebar">
                <div id="single-patient-sidebar-menu">
                    <h3>Control Panel</h3>
                    <a id="sidebar-links" @click.native="setActive('my_profile')">My profile</a>
                    <a id="sidebar-links" @click.native="setActive('edit_profile')">Edit profile</a>
                    <a id="sidebar-links" @click.native="setActive('add_subscription')" @click="">Add Subscriptions</a>
                    <a id="sidebar-links" @click.native="setActive('subscriptions')" @click="">My Subscriptions</a>
                    <a id="sidebar-links" @click.native="setActive('booked_appointments')"> Booked Appointments</a>
                    <a id="sidebar-links" @click.native="setActive('medical_journal')" >My Medical Journal</a>
                </div>
            </div>

            <div id="single-patient-card">
                <div id="edit-profile" v-if="activeSection === 'edit_profile'">
                    <h3>Edit Profile</h3>

                        <label>Name: </label>
                        <input v-model="patient.name" type="text" id="name"/>
                        <br>
                        <label>Email: </label>
                        <input v-model="patient.email" type="email" id="email"/>
                        <br>
                        <label>SSN: </label>
                        <input v-model="patient.ssn" type="text" id="ssn"/>
                        <br>
                        <label>Phone number: </label>
                        <input v-model="patient.phone_number" type="text" id="phone_number"/>
                        <br>
                        <label>Address: </label>
                        <input v-model="patient.address" type="address" id="address"/>
                        <br>
                        <label>Password: </label>
                        <input v-model="patient.password" type="password" id="password"/>
                        <input type="checkbox" v-on:click="toggle()">
                        <br>

                        <button id="update-button" class="submit-button" v-on:click="updatePatientInfo()" type="button">Update</button>
                </div>


              <div v-else-if="activeSection === 'add_subscription'">
                <h3>Add A Subscription</h3>
                <div id="add-subscriptions">
                  <label>Subscription from: </label>
                  <input v-model="subscription.period_sub_from"
                         type="datetime-local" id="subscription-from"/>
                  <label>Subscription until: </label>
                  <input v-model="subscription.period_sub_until"
                         type="datetime-local" id="subscription-until"/>
<!--                  <label>Appointment type: </label>-->
<!--                  <input v-model="subscription.appointment_type" type="text" id="ssn"/>-->
                  <label>Notification Preference:</label>
                  <div class="radio-group">
                  <input v-model="subscription.notification_preference" type="radio" id="yes" value="true"/>
                  <label for="yes">Yes</label>
                  <input v-model="subscription.notification_preference" type="radio" id="no" value="false"/>
                  <label for="no">No</label>
                  </div>
                  <label>Notification Email: </label>
                  <input v-model="subscription.email_notification" type="email" id="email"/>
                  <label>Notification Phone Number: </label>
                  <input v-model="subscription.phone_notification" type="tel" id="phone_number"/>

                  <button id="update-button" class="submit-button" v-on:click="createSubscription()" type="button">Subscribe</button>
                </div>
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
                    <h3>Medical Journal</h3>
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
        subscription: {
          period_sub_from: "",
          period_sub_until: "",
          appointment_type: "",
          notification_preference: false,
          email_notification: "",
          phone_notification: ""
        },
      error_message: '',
          confirmation_message: '',
          activeSection: '',
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
          },
          patient_get_specific_url: '',
          update_patient_specific_url: '',
          create_subscription: ''
        // currentDate: ""
    }
    },
    mounted() {
        // this.setCurrentDate();
        this.patient_get_specific_url = import.meta.env.VITE_PATIENT_GET_SPECIFIC_URL;
        this.update_patient_specific_url = import.meta.env.VITE_UPDATE_PATIENT_SPECIFIC_URL;
        this.getPatientInformation();
        this.create_subscription = import.meta.env.VITE_CREATE_NEW_SUBSCRIPTION;
    },
    methods: {
        setActive(section) {
            try {
                this.activeSection = section;

                if (section === "add_subscription") {
                  this.setSubDateBoundaries();
                }
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

            await Api.get(`${this.patient_get_specific_url}`).then(response => {
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
            await Api.put(`${this.update_patient_specific_url}`, this.patient).then(response => {
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

      setSubDateBoundaries() {
          this.$nextTick(() => {
            //   //setting min date attribute to current time-picking date
            //   // 2024-12-25T08:00
            const currentDate = new Date().toISOString().slice(0, 16);

            //change minimum selectable date of the "subscription from" to current date
            document.getElementById("subscription-from").setAttribute("min", currentDate);
            //change minimum selectable date of the "subscription until" to current date
            document.getElementById("subscription-until").setAttribute("min", currentDate);

            const anotherCurrentDate = new Date();
            anotherCurrentDate.setMonth(anotherCurrentDate.getMonth() + 6);
            const sixMonthsLater = anotherCurrentDate.toISOString().slice(0, 16);

            //change maximum selectable date of the "subscription from" to 6 months from current date
            document.getElementById("subscription-from").setAttribute("max", sixMonthsLater);
            //change maximum selectable date of the "subscription until" to 6 months from current date
            document.getElementById("subscription-until").setAttribute("max", sixMonthsLater);

          });
      },

      /*
          subscription: {
          period_subscription: {
            sub_from: "",
            sub_ultil: ""
          },
          appointment_type: "",
          notification_preference: false,
          email_notification: "",
          phone_notification: ""
        },*/

      async createSubscription() {
        try {
          const response = await Api.post(`${this.create_subscription}`, this.subscription);

          if (response.status === 200) {
            this.confirmation_message = 'Subscribed to time period!';
          }
        } catch (error) {
            this.error_message = 'Subscription failed!';
            setTimeout(() => {
              this.error_message = ''
            }, 10000);
          }
      }
      // async addSubscription() {
      //     var formData = new FormData();
      //     formData.append('sub_from', this.subscription.period_subscription.sub_from);
      //     formData.append('sub_until', this.subscription.period_subscription.sub_ultil);
      //     formData.append('notification_preference', this.subscription.notification_preference);
      //     formData.append('email_notification', this.subscription.email_notification);
      //     formData.append('phone_notification', this.subscription.phone_notification);
      //
      // try {
      //   const response = await fetch()
      // }
      // }


      // async getSubscriptions() {
      //   await Api.get(`${this.patient_get_specific_url}${this.current_patient_placeholder}`).then(response => {
      //     if (response.status === 200) {
      //       this.patient = response.data.patients;
      //
      //
      //     }
      //   }).catch(error => {
      //     this.error_message = 'Something went wrong. Patient information not found!'
      //     setTimeout(() => {
      //       this.error_message = ''
      //     }, 5000);
      //     console.log(error.message)
      //   })
      //
      //
      // },
  }
}
</script>

<style src="../assets/main.css"></style>