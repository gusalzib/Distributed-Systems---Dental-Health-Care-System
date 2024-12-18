<template>
  <main>
    <div class="my-appointments-container">
                <!-- /*I added these span tags to the appointment card. I don't think it is necessary at the moment but later on, if we add more 
                information to the cards, we might need to increase their visual separation to make it easier to read. Right now, there are no labels on
                the card, which is also something that we might need to add later.*/ -->

        <div class="my-appointments-card" v-for="bookedAppointment in bookedAppointments" :key="bookedAppointment._id">
          <ul>
            <li><span>Clinic:</span> clinic name</li>
            <li><span>Date:</span> {{ bookedAppointment.date_and_time_from }}</li>
            <li><span>Time:</span> {{ bookedAppointment.date_and_time_until }}</li>
            <li><span>Type of appointment:</span> {{ bookedAppointment.type_of_appointment || 'General checkup'}}</li>
            <li><span>Clinic address:</span> clinic address</li>
          </ul>
        <div id="modal">
          <h2>You are cancelling your appointment at [Clinic name]. Are you sure you want to proceed?</h2>
          <button class="cancel-button" @click="cancelAppointment(bookedAppointment._id)">Yes</button>
          <button @click="rejectCancellation()">NO</button>
        </div>
            <button @click="rerouting(`/clinic/${bookedAppointment.dentist_clinic_id}`)" >Contact Clinic</button>
            <button class="cancel-button" @click="confirmCancellation()">Cancel Appointment</button>
        </div>
          <div class="confirmation_message">{{ confirmation_message }}</div>
          <div class="error_message">{{ error_message }}</div>

    </div>


  </main>
</template>


<script>
// @ is an alias to /src
import { Api } from '@/Api'
import axios from 'axios';
import router from '@/router'


export default {
  name: 'my_appointments',
  data() {
    return {
        current_patient_placeholder: '6759e3f57a30ebf177f326c7',
    //  current_patient_placeholder:'674516312f3c59c02e4df78d',
        confirmation_message: '',
        error_message: '',
        bookedAppointmentsIds: [],
        bookedAppointments: [],
        bookedAppointemnt: {
          patient_id: "",
          dentist_id:"",
          dentist_clinic_id: "",
          type_of_appointment:"",
          date_and_time_from:"",
          date_and_time_until:"",
          available:"",
      },  
        patient: {
            name: '',
            email: '',
            phone_number: '',
            ssn: '',
            address: '',
            appointments: []
      },
      patient_get_specific_url: '',
      appointments_get_specific_url: '',
      update_appointment_url: '',
      update_patient_specific_url: '',

        
    }
  },
  mounted() {
    this.patient_get_specific_url = import.meta.env.VITE_PATIENT_GET_SPECIFIC_URL;
    this.update_patient_specific_url = import.meta.env.VITE_UPDATE_PATIENT_SPECIFIC_URL;
    this.appointments_get_specific_url = import.meta.env.VITE_GET_SPECIFIC_APPOINTMENTS_URL;
    this.update_appointment_url = import.meta.env.VITE_UPDATE_APPOINTMENT_URL;
    
    this.getPatientInformation();
  },
  methods: {
    extractTimeAndDate(date_and_time) {
      var date = '';
      var time = '';
      console.log(date_and_time);
      
      var tempArr = date_and_time.split('T');
      date = tempArr[0];

      var tempTime = tempArr[1].split(':')
      time = tempTime[0] + ':' + tempTime[1];

      var date_and_time_arr = [date, time]
      return date_and_time_arr;
        },
        confirmCancellation() {
            var modal = document.getElementById('modal');
            modal.style.display = "block";
        },
        rejectCancellation() {
            var modal = document.getElementById('modal');
            modal.style.display = "none"
      },
      async getPatientInformation() {
            /* fetch the current patient information. This is needed to display the information to the user upon 
            booking the appointment. The information is displayed in editable input fields. The patient has the option to change the details 
            prior to booking the appointment. Example: the patient wants to change the contact phone number or email for this particular appointment */
            this.bookedAppointments = []
            this.bookedAppointmentsIds = []

            try {
              const response = await Api.get(`${this.patient_get_specific_url}${this.current_patient_placeholder}`)
              if (response.status === 200) {
                    this.patient = response.data.patients;

                    //as we are getting the patient info, we assign the array of appointments ids that is inside the patient to 
                    //the bookedAppointmentsIds
                    this.bookedAppointmentsIds = this.patient.appointments;
                                        
                    //extract appointments using the array of appointment ids 

                    await this.extractAppointments()
                    
                }
            } catch (error) {
                this.error_message = 'Something went wrong. Patient information not found!'
                setTimeout(() => {
                        this.error_message = ''
                    }, 5000);
                console.log(error.message)
            }
      },
      async extractAppointments() {

        var appointmentIDs = this.bookedAppointmentsIds;
        for (let index = 0; index < appointmentIDs.length; index++) {

          const appointmentId = appointmentIDs[index].appointment_id ? appointmentIDs[index].appointment_id : appointmentIDs[index].appointment_id;
          const response = await Api.get(`${this.appointments_get_specific_url}${appointmentId}`);

          if (response.status === 200) {

            var tempBookedAppointemnt = response.data.appointments;
            var date_and_time = this.extractTimeAndDate(tempBookedAppointemnt.date_and_time_from)
            
            tempBookedAppointemnt.date_and_time_from = date_and_time[0];
            tempBookedAppointemnt.date_and_time_until = date_and_time[1];

            this.bookedAppointments.push(tempBookedAppointemnt)
            
          } else if (response.status != 200) {
            
            this.error_message = error.response?.data.message;
              setTimeout(() => {
                  this.error_message = '';
              }, 5000);
            
          }
          
        }

    },
    async cancelAppointment(appointmentId) {
      this.bookedAppointemnt.available = true;
      this.bookedAppointemnt.patient_id = "00000000000000000000000a";
      console.log(appointmentId);
      
      try {
        const response = await Api.put(`${this.update_appointment_url}${appointmentId}`, this.bookedAppointemnt); 

        if (response.status === 200) {
          await this.removeBookedAppointment(appointmentId)
          this.confirmation_message = 'Appointment is cancelled'
          setTimeout(() => {
              this.confirmation_message = '';
          }, 5000);
        }
      } catch (error) {
        this.error_message = error.response?.data.message;
          setTimeout(() => {
              this.error_message = '';
          }, 5000);
      }

    },
    async removeBookedAppointment(appointmentId) {
      
      this.bookedAppointments = this.bookedAppointments.filter(appointment => appointment._id !== appointmentId);
      
      this.bookedAppointmentsIds = this.bookedAppointmentsIds.filter(appointment => appointment.appointment_id !== appointmentId);  
      this.patient.appointments = this.bookedAppointmentsIds;
    
      try {
        const response = await Api.put(`${this.update_patient_specific_url}${this.current_patient_placeholder}`, this.patient)
          if (response.status === 200) {
              this.confirmation_message = 'Appointment cancelled'
              await this.getPatientInformation();
                setTimeout(() => {
                        this.confirmation_message = ''
                    }, 5000);
            }

      } catch (error) {
          this.error_message = error.response?.data.message;
            setTimeout(() => {
                this.error_message = '';
            }, 5000);
      }        
    },
    rerouting(targetPath){
            router.push({path: `${targetPath}`})
    },
  }
}
</script>

<style src="../assets/main.css"></style>