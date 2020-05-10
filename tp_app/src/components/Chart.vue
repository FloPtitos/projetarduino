<template>
  <div>
    <md-button class="md-primary md-raised" @click="start">Start simulation</md-button>
    <br />
    <br />
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
      name: "ESP1",
      data: []
    },
    {
      name: "ESP2",
      data: []
    },
    {
      name: "ESP3",
      data: []
    },
    {
      name: "ESP4",
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
      name: "ESP1",
      data: []
    },
    {
      name: "ESP2",
      data: []
    },
    {
      name: "ESP3",
      data: []
    },
    {
      name: "ESP4",
      data: []
    }
  ]
};
export default {
  props: {
    which_esps: Array
    ,
    k: Number,
    partsdata: {
      type: Array
    }
  },

  components: {
    highcharts: Chart
  },

  data() {
    return {
      node_url: "",
      items: [],
      options: options,
      options2: options2,
      listeData: []
    };
  },
  mounted(){
 
  },
  methods: {
    start: function() {
      /*    var chart = this.$refs.highcharts.chart;
      chart.credits.update({
        style: {
          color: "#" + ((Math.random() * 0xffffff) | 0).toString(16)
        }
      }); */
       for (var i = 0; i < this.which_esps.length; i++) {
          this.process_esp(this.which_esps, i);
        } 
     
    },

    process_esp(which_esps, i) {
      const refreshT = 100000; // Refresh period for chart
      var esp = which_esps[i]; // L'ESP "a dessiner"
    
      // Gestion de la temperature
      // premier appel pour eviter de devoir attendre RefreshT
      this.get_samples("/esp/temp", this.options.series[i], esp);
      //calls a function or evaluates an expression at specified
      //intervals (in milliseconds).
      window.setInterval(
        this.get_samples,
        refreshT,
        "/esp/temp", // param 1 for get_samples()
        this.options.series[i], // param 2 for get_samples()
        esp
      ); // param 3 for get_samples()

      // Gestion de la lumiere
      this.get_samples("/esp/light", this.options2.series[i], esp);
      window.setInterval(
        this.get_samples,
        refreshT,
        "/esp/light", // URL to GET
        this.options2.series[i], // Serie to fill
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
