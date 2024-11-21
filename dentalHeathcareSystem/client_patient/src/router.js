import { createRouter, createWebHistory } from "vue-router";

import Home from "./views/Home.vue";
import NewAppointment from "./views/NewAppointment.vue";
import PrivacyPolicy from "./views/PrivacyPolicy.vue";
import MyAppointments from "./views/MyAppointments.vue";
import SingleAppointment from "./views/SingleAppointment.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/new/appointment", name: "newAppointment", component: NewAppointment },
  { path: '/privacy_policy', name: 'privacy_policy', component: PrivacyPolicy },
  { path: '/my_appointments', name: 'my_appointments', component: MyAppointments },
  {path: '/single_appointment', name: 'singleAppointment', component: SingleAppointment}

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
