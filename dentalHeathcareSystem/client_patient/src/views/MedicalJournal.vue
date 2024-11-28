<template>
  <main>
    <div class="journal-container">
        <h1>{{ patient.name }}'s medical journal:</h1>
        <div class="journal-details" v-for="journal in patient.medical_journal" :key="journal._id">
            <h2>{{ journal.date }} |Clinic name</h2>
            <p>{{ journal.journal }}</p>
            <hr>
        </div>
    </div>
  </main>
</template>


<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'medicalJournal',
  data() {
    return {
          current_patient_placeholder: '673a5173934efda9cdfa63a3',
          // current_patient_placeholder:'674516312f3c59c02e4df78d',
          confirmation_message: '',
          error_message: '',
          patient: {
              name: '',
              email: '',
              phone_number: '',
              ssn: '',
              address: '',
              appointments: [],
              medical_journal: {
                journal: '',
                date: '',
              }
          },

    }
  },
  mounted() {
    this.getPatientInformation();

  },
  methods: {
      async getPatientInformation() {
            try {
              const response = await Api.get(`/patients/${this.current_patient_placeholder}`)
              if (response.status === 200) {
                this.patient = response.data.patients;
                this.patient.medical_journal = response.data.patients.medical_journal
                    console.log(this.patient.medical_journal);
                    

                }
            } catch (error) {
                this.error_message = 'Something went wrong. Patient information not found!'
                setTimeout(() => {
                        this.error_message = ''
                    }, 5000);
                console.log(error.message)
            }
      },
  }
}
</script>

<style src="../assets/main.css"></style>