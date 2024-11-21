import { createRouter, createWebHistory } from "vue-router";

import Home from "./views/Home.vue";
import NewAppointment from "./views/NewAppointment.vue";

const routes = [
  { path: "/", name: "home", component: Home },
  { path: "/new/appointment", name: "newAppointment", component: NewAppointment },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
