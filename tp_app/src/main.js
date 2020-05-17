import Vue from 'vue'
import App from './App.vue'
import VueMaterial from 'vue-material';
import 'vue-material/dist/vue-material.min.css'
import 'vue-material/dist/theme/default.css'
import HighchartsVue from "highcharts-vue";
import VueRouter from 'vue-router';

Vue.config.productionTip = false

Vue.use(HighchartsVue);
Vue.use(VueMaterial);
Vue.use(VueRouter);


import Home from './components/Home.vue';
import Data from './components/Data.vue';
import Details from './components/Details.vue';
import List from './components/List.vue';

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/', component: Home },
    { path: '/list/:id/data', component: Data },
    { path: '/list', component: List },
    { 
      path: '/list/:id', 
      component: Details 
    }
  ]
});
new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
