<template>
  <div id ="Chart">
    <md-button class="md-primary md-raised" @click="start">Start simulation</md-button>
    <md-button class="md-accent md-raised" @click="switchState(arduino.macAddress)">Turn on sprinkler</md-button>
    <br />
    <br />
    <h1> {{ this.arduino.name}} </h1>
    <br>
     
    <highcharts :options="options" ref="highcharts"></highcharts>
    <highcharts :options="options2" ref="highcharts"></highcharts>
  </div>
</template>

<script>
import { Chart } from "highcharts-vue";
import Highcharts from "highcharts";
import exportingInit from "highcharts/modules/exporting";
import stockInit from "highcharts/modules/stock";

stockInit(Highcharts);
exportingInit(Highcharts);

var options = {
  chart: {
    type: "spline"
  },
  title: {
    text: "Temperature",
    x: -20 //center
  },
  xAxis: {
    title: {
      text: "Heure"
    },
    type: "datetime"
  },
  yAxis: {
    title: {
      text: "Temperature (°C)"
    },
    plotLines: [
      {
        value: 0,
        width: 1,
        color: "#808080"
      }
    ]
  },
  tooltip: {
    valueSuffix: "°C"
  },
  legend: {
    layout: "vertical",
    align: "right",
    verticalAlign: "middle",
    borderWidth: 0
  },
  series: [
    {
      name: "ESP",
      data: []
    }
  ]
};
var options2 = {
  chart: {
    type: "spline"
  },
  title: {
    text: "Lumière",
    x: -20 //center
  },
  xAxis: {
    title: {
      text: "Heure"
    },
    type: "datetime"
  },
  yAxis: {
    title: {
      text: "Lumen (Lum)"
    },
    plotLines: [
      {
        value: 0,
        width: 1,
        color: "#808080"
      }
    ]
  },
  tooltip: {
    valueSuffix: "Lum"
  },
  legend: {
    layout: "vertical",
    align: "right",
    verticalAlign: "middle",
    borderWidth: 0
  },
  series: [
    {
      name: "ESP",
      data: []
    }
  
  ]
};
export default {
  props: {
    
    k: Number,
    partsdata: {
      type: Array
    }
  },
     computed: {
    // computed data, permet de définir des data "calculées"
    id() {
      // on y accèdera par {{id}} dans le template, et par this.id
      // dans le code
      return this.$route.params.id;
    }
  },
  components: {
    highcharts: Chart
  },

  data() {
    return {
      arduino: [],
      node_url: "",
      items: [],
      apiURL: "http://51.83.77.127:3000/api/arduinos",
      url: "http://51.83.77.127:3000",
      options: options,
      options2: options2,
      listeData: [],
      weather : []
    };
  },
  mounted(){
      this.getDataFromServer();
  },
  methods: {
       
    async start(){
      /*    var chart = this.$refs.highcharts.chart;
      chart.credits.update({
        style: {
          color: "#" + ((Math.random() * 0xffffff) | 0).toString(16)
        }
      }); */
       
        this.process_esp(this.arduino);
     
       var uri = "http://api.weatherstack.com/current?access_key=bd8775c66b89d500861379436231b26e&query=Nice"
            let responseJSON = await fetch(uri, {
        method: "GET"
      });
      let responseJS = await responseJSON.json();
      this.weather = responseJS.current;
     
      if(this.weather.temperature > 25 && this.weather.precip<=0){ //si temperature superieure à 25° C et qu'il ne pleut pas déjà on allume les arroseurs
        this.switchState(this.arduino.macAddress)
      }
    },

     async getDataFromServer() {
      // ici on fait un fetch pour récupérer le détail de l'arduino

      let responseJSON = await fetch(this.apiURL + "/" + this.$route.params.id, {
        method: "GET"
      });
      let responseJS = await responseJSON.json();
      this.arduino = responseJS.arduino;
    },

     async switchState(wh) {
      var url = this.url + "/esp/led";
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
    process_esp(arduino) {
      const refreshT = 100000; // Refresh period for chart
      var esp = arduino.macAddress; // L'ESP "a dessiner"
    
      // Gestion de la temperature
      // premier appel pour eviter de devoir attendre RefreshT
      this.get_samples("/esp/temp", this.options.series[0], esp);
      //calls a function or evaluates an expression at specified
      //intervals (in milliseconds).
      window.setInterval(
        this.get_samples,
        refreshT,
        "/esp/temp", // param 1 for get_samples()
        this.options.series[0], // param 2 for get_samples()
        esp
      ); // param 3 for get_samples()

      // Gestion de la lumiere
      this.get_samples("/esp/light", this.options2.series[0], esp);
      window.setInterval(
        this.get_samples,
        refreshT,
        "/esp/light", // URL to GET
        this.options2.series[0], // Serie to fill
        esp
      ); // ESP targeted
    },

    get_samples(path_on_node, serie, wh) {
      // path_on_node => help to compose url to get on Js node
      // serie => for choosing chart/serie on the page
      // wh => which esp do we want to query data

      this.node_url = "http://51.83.77.127:3000";

      //https://openclassrooms.com/fr/courses/1567926-un-site-web-dynamique-avec-jquery/1569648-le-fonctionnement-de-ajax
        var liste = []
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
    }
  }
};
</script>
<style scoped>
  #Chart {
    text-align: center;
  }
</style>