<template>
  <main>
    <div class="subscription-container">
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

        <div id="confirmation_message" class="confirmation_message">{{ confirmation_message }}</div>
        <div id="error_message" class="error_message">{{ error_message }}</div>

      </div>
    </div>
  </main>
</template>


<script>
// @ is an alias to /src
import { Api } from '@/Api'

export default {
  name: 'subscribe',
  data() {
    return {
      subscription: {
        period_sub_from: "",
        period_sub_until: "",
        appointment_type: "",
        notification_preference: false,
        email_notification: "",
        phone_notification: ""
      },
      create_subscription: '',
      confirmation_message: '',
      error_message: ''
    }
  },
  mounted() {
    this.setSubDateBoundaries();
    this.create_subscription = import.meta.env.VITE_CREATE_NEW_SUBSCRIPTION;
  },
  methods: {
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
    async createSubscription() {
      try {
        const validatedPeriod = this.validatePeriod();
        if (!validatedPeriod) {
          this.error_message = 'subscription period is invalid';
          console.log(this.error_message);
          // return this.error_message;
        } else {
          console.log("we got to the else after validating the period")
        const response = await Api.post(`${this.create_subscription}`, this.subscription);
        if (response.status === 200) {
          this.confirmation_message = 'Subscribed to time period!';
        }}
      } catch (error) {
        this.error_message = 'Subscription failed!';
        setTimeout(() => {
          this.error_message = ''
        }, 10000);
      }
    },
    validatePeriod() {
      let subFrom = this.subscription.period_sub_from;
      let subUntil = this.subscription.period_sub_until;
      console.log(subFrom + " is from date");
      console.log(subUntil + " is until date");

      if (subFrom >= subUntil) {
        this.error_message = "subscription period is invalid"
        console.log("we are returning false in validation")
        return false;
      } else {
        console.log("we are returning true in validation")
        return true;
      }
    }
  }
}
</script>

<style src="../assets/main.css"></style>