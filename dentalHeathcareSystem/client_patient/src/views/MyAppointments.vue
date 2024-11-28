<template>
  <main>
    <div class="my-appointments-container">
                <!-- /*I added these span tags to the appointment card. I don't think it is necessary at the moment but later on, if we add more 
                information to the cards, we might need to increase their visual separation to make it easier to read. Right now, there are no labels on
                the card, which is also something that we might need to add later.*/ -->

        <div class="my-appointments-card" v-for="bookedAppointment in bookedAppoinments" :key="bookedAppointment._id">
          <ul>
            <li><span>Clinic:</span> clinic name</li>
            <li><span>Date:</span> {{ bookedAppointment.date_and_time_from }}</li>
            <li><span>Time:</span> {{ bookedAppointment.date_and_time_until }}</li>
            <li><span>Type of appointment:</span> {{ bookedAppointment.type_of_appointment || 'General checkup'}}</li>
            <li><span>Clinic address:</span> clinic address</li>
          </ul>

            <button>Contact Clinic</button>
            <button class="cancel-button" @click="confirmCancellation()">Cancel Appointment</button>
        </div>
          <div class="confirmation_message">{{ confirmation_message }}</div>
          <div class="error_message">{{ error_message }}</div>
    </div>

    <div id="modal">
        <h2>You are cancelling your appointment at [Clinic name]. Are you sure you want to proceed?</h2>
        <button class="cancel-button">Yes</button>
        <button @click="rejectCancellation()">NO</button>
    </div>
  </main>
</template>


<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'my_appointments',
  data() {
    return {
        current_patient_placeholder: '673a5173934efda9cdfa63a3',
      // current_patient_placeholder:'674516312f3c59c02e4df78d',
      confirmation_message: '',
          error_message: '',
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
    }
  },
  mounted() {
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
            try {
              const response = await Api.get(`/patients/${this.current_patient_placeholder}`)
              if (response.status === 200) {
                    this.patient = response.data.patients;

                    //as we are getting the patient info, we assign the array of appointments ids that is inside the patient to 
                    //the bookedAppointmentsIds
                    this.bookedAppoinmentsIds = this.patient.appointments;

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

        var appointmentIDs = this.bookedAppoinmentsIds;
        
        for (let index = 0; index < appointmentIDs.length; index++) {

          const appointmentId = appointmentIDs[index].appointment_id;
          const response = await Api.get(`/appointments/${appointmentId}`);

          if (response.status === 200) {

            var tempBookedAppointemnt = response.data.appointment;

            var date_and_time = this.extractTimeAndDate(tempBookedAppointemnt.date_and_time_from)
            
            tempBookedAppointemnt.date_and_time_from = date_and_time[0];
            tempBookedAppointemnt.date_and_time_until = date_and_time[1];

            this.bookedAppoinments.push(tempBookedAppointemnt)
            
          } else if (response.status != 200) {
            
            this.error_message = error.response?.data.message;
              setTimeout(() => {
                  this.error_message = '';
              }, 5000);
            
          }
          
        }

        }
  }
}
</script>

<style src="../assets/main.css"></style>