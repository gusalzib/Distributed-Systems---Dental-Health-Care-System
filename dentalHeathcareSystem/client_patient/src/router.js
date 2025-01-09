import { createRouter, createWebHistory } from "vue-router";

import Home from "./views/Home.vue";
import NewAppointment from "./views/NewAppointment.vue";
import PrivacyPolicy from "./views/PrivacyPolicy.vue";
import MyAppointments from "./views/MyAppointments.vue";
import SingleAppointment from "./views/SingleAppointment.vue";
import Registration from "./views/Registration.vue";
import Login from "./views/Login.vue";
import MedicalJournal from "./views/MedicalJournal.vue";
import Notifications from "./views/Notifications.vue";
import Profile from "./views/Profile.vue";
import ClinicAppointments from "./views/ClinicAppointments.vue";
import ClinicDentists from "./views/ClinicDentists.vue";
import BookingConfirmation from "./views/BookingConfirmation.vue"
import Clinic from "./views/Clinic.vue"
import CreateSubscription from "@/views/CreateSubscription.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/new/appointment", name: "newAppointment", component: NewAppointment },
  { path: '/privacy_policy', name: 'privacy_policy', component: PrivacyPolicy },
  { path: '/my_appointments', name: 'my_appointments', component: MyAppointments },
  { path: '/single/appointment/:appointmentID', name: 'singleAppointment', component: SingleAppointment },
  { path: '/registration', name: 'registration', component: Registration },
  { path: '/login', name: 'login', component: Login },
  { path: '/medical_journal', name: 'medicalJournal', component: MedicalJournal },
  { path: '/notifications', name: 'notifiations', component: Notifications },
  { path: '/profile', name: 'profile', component: Profile },

  {path: '/bookingConfirmation/:appointmentID', name: 'bookingConfirmation', component: BookingConfirmation},
  {path: '/clinic/:clinicID', name: 'clinic', component: Clinic},
  {path: '/clinicAppointments/:clinicID', name: 'clinicAppointments', component: ClinicAppointments},
  {path: '/clinicDentists/:clinicID', name: 'clinicDentists', component: ClinicDentists},
  {path: '/new/subscription', name: 'subscribe', component: CreateSubscription}

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
