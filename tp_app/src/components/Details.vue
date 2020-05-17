<template>

  <div>
     <div style="text-align:left"> <md-button class="md-primary" @click="$router.go(-1)"> &lt; Back </md-button></div>
    <br />
    <br />
    <md-card md-with-hover style="width:60% ; margin:auto;">
      <md-ripple>
        <md-card-header>
          <div class="md-title">Plant's name : {{arduino.name}}</div>
          <br />
          <div>Mac Address : {{arduino.macAddress}}</div>
          <div>Plant ID : {{arduino._id}}</div>
        </md-card-header>

        <md-card-actions>
          <md-button @click="$router.go(-1)">Back</md-button>
          <md-button class="md-raised md-primary" :to= "arduino._id + '/data'">See datas</md-button>
         <!-- <router-link :to="restaurant._id+'/menu'">See menu</router-link> -->
        </md-card-actions>
      </md-ripple>
    </md-card>
  </div>
</template>

<script>
  export default {
 name: "ArduinoDetail",
  props: {},
  computed: {
    // computed data, permet de définir des data "calculées"
    id() {
      // on y accèdera par {{id}} dans le template, et par this.id
      // dans le code
      return this.$route.params.id;
    }
  },
  data: function() {
    return {
      apiURL: "http://51.83.77.127:3000/api/arduinos",
      arduino: []
    };
  },
  mounted() {
    console.log("ID = " + this.id);
    this.getDataFromServer();
  },
  methods: {
    async getDataFromServer() {
      // ici on fait un fetch pour récupérer le détail de l'arduino

      let responseJSON = await fetch(this.apiURL + "/" + this.id, {
        method: "GET"
      });
      let responseJS = await responseJSON.json();
      this.arduino = responseJS.arduino;
    }
  }
};

</script>