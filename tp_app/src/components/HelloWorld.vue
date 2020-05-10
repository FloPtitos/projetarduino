<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <div id="app">
       <label for="MAC">Adresse MAC:</label>
      <input type="text" id="MAC" name="MAC"><br><br>
      <md-button class="md-accent md-raised" type="button" v-on:click="ajoutMAC()">Ajouter MAC en tant qu'invité</md-button>
      <Chart  :k="componentKey" :which_esps= "which_esps"/>
    </div>
    <!-- <md-input v-model="name"></md-input>
    <md-button class="md-primary md-raised" v-on:click="addFloat(name)">Add to fleet</md-button>-->
      
    <h1>LED states</h1>
    <md-table>
      <md-table-row slot="md-table-row">
        <md-table-head md-label="Name">ESP</md-table-head>
        <md-table-head md-label="Actions">Action</md-table-head>
      </md-table-row>
      <md-table-row>
        <md-table-cell md-label="Name">B4:E6:2D:96:78:D9</md-table-cell>

        <md-table-cell md-label="Actions">
          <md-button class="md-primary md-raised" v-on:click="switchState('B4:E6:2D:96:78:D9')">PING</md-button>
        </md-table-cell>
      </md-table-row>
      <md-table-row>
        <md-table-cell md-label="Name">80:7D:3A:FD:DD:08</md-table-cell>
        <md-table-cell md-label="Actions">
          <md-button class="md-primary md-raised" v-on:click="switchState('80:7D:3A:FD:DD:08')">PING</md-button>
        </md-table-cell>
      </md-table-row>
      <md-table-row>
        <md-table-cell md-label="Name">30:AE:A4:86:CA:7C</md-table-cell>
        <md-table-cell md-label="Actions">
          <md-button class="md-primary md-raised" v-on:click="switchState('30:AE:A4:86:CA:7C')">PING</md-button>
        </md-table-cell>
      </md-table-row>
      <md-table-row>
        <md-table-cell md-label="Name">{{ which_esps[3] }}</md-table-cell>
        <md-table-cell md-label="Actions">
          <md-button class="md-primary md-raised" v-on:click="switchState(which_esps[3])">PING</md-button>
        </md-table-cell>
      </md-table-row>
    </md-table>
  </div>
</template>

<script>
//var Highcharts = require("highcharts");
import Chart from "./Chart";

//import highcharts from 'https://code.highcharts.com/highcharts.js'
export default {
  name: "HelloWorld",
  data() {
    return {
      states: [],
      node_url: "http://51.83.77.127:3000",
      which_esps: [
        "B4:E6:2D:96:78:D9",
        "80:7D:3A:FD:DD:08",
        "30:AE:A4:86:CA:7C",
        ""
      ],
      name: "",
      componentKey: 0
    };
  },
  components: {
    Chart
  },
  props: {
    msg: String
  },
  mounted() {},

  methods: {
    ajoutMAC() {
      var adMac = document.getElementById("MAC");
      console.log("MAC: " + adMac.value);
      this.which_esps[3] = adMac.value;
      console.log(this.which_esps);
     // this.start();
      this.forceRerender();
    },
     forceRerender() {
      this.componentKey += 1;  
    },
    start: function() {
      for (var i = 0; i < this.which_esps.length; i++) {
        this.getStates("/esp/light", [], this.which_esps[i]);
      }
      for (var j = 0; j < this.which_esps.length; j++) {
        this.getStates("/esp/temp", [], this.which_esps[j]);
      }
    },
    getStates(path_on_node, serie, wh) {
      this.node_url = "http://51.83.77.127:3000";

      //https://openclassrooms.com/fr/courses/1567926-un-site-web-dynamique-avec-jquery/1569648-le-fonctionnement-de-ajax
      var liste = [];
      let url = this.node_url + path_on_node + "?who=" + wh;
      fetch(url)
        .then(responseJSON => {
          return responseJSON.json();
        })
        .then(responseJS => {
          this.items = responseJS;

          if (this.items) {
            this.items.forEach(function(element) {
              liste.push([Date.parse(element.date), element.value]);
            });
          }
          serie.data = liste;
        });
    },

    async switchState(wh) {
      var url = this.node_url + "/esp/led";
      var message = "on";
      var header = new Headers();
      header.append("Content-Type", "application/json");
      await fetch(url, {
        method: "POST",
        headers: header,
        body: JSON.stringify({
          message: message,
          who: wh
        })
      });
    },

    async addFlotte(wh) {
      this.which_esps.append(wh);
      var url = this.node_url + "/flotte";
      var header = new Headers();
      header.append("Content-Type", "application/json");
      await fetch(url, {
        method: "POST",
        headers: header,
        body: JSON.stringify({
          who: wh
        })
      });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.md-table-head {
  text-align: center;
}
</style>
