<template>
 <div id="list">
     <h2>Here are all the plants from the garden</h2>
    <p>
      Number of plants for each page :
     <!--  <vue-material-slider :min="0" :max="20" v-model="pagesize"></vue-material-slider> -->
      <input
        type="range"
        min="2"
        max="100"
        value="10"
        v-on:input="getDataFromServer()"
        v-model="pagesize"
      />
      {{pagesize}}
    </p>
    <h1>Number of plants : {{nbArduinos}}</h1>
    <h3>Current page : {{ page }}</h3>
    <md-button class="md-raised" v-on:click="firstPage()" v-bind:disabled="page==1">&lt;&lt;</md-button>
    <md-button class="md-raised" v-on:click="previousPage()" v-bind:disabled="page==1">Previous</md-button>
    <md-button class="md-raised" v-on:click="nextPage()" :disabled="page == nbPagesDeResultats">Next</md-button>
    <md-button class="md-raised" v-on:click="lastPage()" :disabled="page == nbPagesDeResultats">&gt;&gt;</md-button>

    <div class="md-layout">
      <h2 class="md-title, md-layout-item">Add a plant</h2>
      <md-field class="md-layout-item">
        <md-input placeholder="Mac address" v-model="macAddress" />
      </md-field>
      <span class="divider"></span>
      <md-field class="md-layout-item">
        <md-input placeholder="Name" v-model="name" />
      </md-field>
      <md-button class="md-raised md-primary" v-on:click="addArduino">Add</md-button>
    </div>

    <md-table v-model="arduinos" md-sort="name" md-sort-order="asc" md-card md-fixed-header>
      <md-table-toolbar>
        <div class="md-toolbar-section-start">
          <h1 class="md-title">Name search</h1>
        </div>

        <md-field md-clearable class="md-toolbar-section-end">
          <md-input
            placeholder="Search by name..."
            v-model="nomRecherche"
            @input="getDataFromServer()"
          />
        </md-field>
      </md-table-toolbar>

      <md-table-empty-state
        md-label="No arduinos found"
        :md-description="`No arduino found for this '${nomRecherche}' query. Try a different search term or create a new user.`"
      ></md-table-empty-state>

      <md-table-row slot="md-table-row" slot-scope="{ item }">
        <md-table-cell md-label="Name" md-sort-by="name">{{ item.name }}</md-table-cell>
        <md-table-cell md-label="Mac address" md-sort-by="macAddress">{{ item.macAddress }}</md-table-cell>
        <md-table-cell md-label="Details">
          <router-link :to="'list/'+item._id">Details</router-link>
        </md-table-cell>
        <md-dialog class="update" :md-active.sync="update">
          <h2>Update plant id : {{ arduino._id }}</h2>
          <br />
          <form>
            <md-field>
              <!-- <label> Name : </label> -->
              <!--  <md-input type ="text" placeHolder = "Restaurant name " v-model="resto.name"></md-input> -->
              <md-input type="text" placeholder="Name" v-model="arduino.name"></md-input>
            </md-field>
            <br />
            <br />
            <md-field>
              <!--   <label> Cuisine : </label> -->
              <!--  <md-input type ="text" placeHolder = "Restaurant cuisine " v-model="resto.cuisine"></md-input> -->
              <md-input type="text" placeholder="Mac Address" v-model="arduino.macAddress"></md-input>
            </md-field>
          </form>
          <md-dialog-actions>
            <md-button
              class="md-primary"
              @click="update = false"
              v-on:click="getDataFromServer()"
            >Close</md-button>
            <!-- on rafraichit pour restorer valeurs initiales -->
            <md-button
              class="md-primary"
              @click="update = false"
              v-on:click="updateArduino(arduino)"
            >Save</md-button>
            <!-- on modifie le restaurant -->
          </md-dialog-actions>
        </md-dialog>
        <md-table-cell md-label="Update">
          <md-button class="md-primary md-raised" @click="update = true, arduino= item">Update</md-button>
        </md-table-cell>

        <md-dialog class="update" :md-active.sync="del">
          <h2>Delete plant id : {{ arduino._id }}</h2>
          <br />
          <p>Do you really want to delete this plant ?</p>
          <md-dialog-actions>
            <md-button
              class="md-primary"
              @click="del = false"
              v-on:click="getDataFromServer()"
            >Cancel</md-button>
            <!-- on rafraichit pour restorer valeurs initiales -->
            <md-button
              class="md-primary"
              @click="del = false"
              v-on:click="deleteArduino(arduino._id)"
            >Confirm</md-button>
            <!-- on modifie le restaurant -->
          </md-dialog-actions>
        </md-dialog>
        <md-table-cell md-label="Delete">
          <md-button
            class="md-accent md-raised"
            @click="del = true, arduino= item"
          >Delete</md-button>
        </md-table-cell>
      </md-table-row>
    </md-table>
  </div>
  
</template>

<script>
  export default {
 name: "Arduinos",
  props: {},

  data: function() {
    return {
      arduino: [],
      update: false,
      del: false,
      arduinos: [],
      nbArduinos: 0,
      name: "",
      macAddress: "",
      page: 0,
      pagesize: 10,
      nomRecherche: "",
      nbPagesDeResultats: 0,
      apiURL: "http://localhost:3000/api/arduinos"
    };
  },

  mounted() {
    this.getDataFromServer();
  },

  methods: {
    getDataFromServer() {
      // ici on fait un fetch pour récupérer des
      // restaurants sur le serveur.
      let url =
        this.apiURL +
        "?page=" +
        this.page +
        "&pagesize=" +
        this.pagesize +
        "&name=" +
        this.nomRecherche;

      fetch(url)
        .then(reponseJSON => {
          return reponseJSON.json();
        })
        .then(reponseJS => {
          // ici on a la réponse sous la forme
          // d'un objet JS
          this.arduinos = reponseJS.data;
          console.log(this.arduinos);
          this.nbArduinos = reponseJS.count;
          console.log(this.nbArduinos)
          this.nbPagesDeResultats = Math.floor(
            this.nbArduinos / this.pagesize
          );
        });
    },

    async deleteArduino(id) {
      try {
        let reponseJSON = await fetch(this.apiURL + "/" + id, {
          method: "DELETE"
        });
        let reponseJS = await reponseJSON.json();
        console.log("Arduino deleted : " + reponseJS.msg);
        this.getDataFromServer(); // on rafraichit l'affichage
      } catch (err) {
        console.log("Erreur dans le fetchs DELETE " + err.msg);
      }
    },

    async updateArduino(arduino) {
      let dataForm = new FormData();
      dataForm.append("_id", arduino._id);
      dataForm.append("macAddress", arduino.macAddress);
      dataForm.append("name", arduino.name);
      let responseJSON = await fetch(this.apiURL + "/" + arduino._id, {
        method: "PUT",
        body: dataForm
      });
       let responseJS = await responseJSON.json();
      console.log(responseJS)
    
    },
    /*  deleteRestaurant(index) {
      this.restaurants.splice(index, 1);
    }, */
    async addArduino(event) {
      // eviter le comportement par defaut
      event.preventDefault();
      let dataForm = new FormData();
      dataForm.append("macAddress", this.macAddress);
      dataForm.append("name", this.name);

      let reponseJSON = await fetch(this.apiURL, {
        method: "POST",
        body: dataForm
      });
      let reponseJS = await reponseJSON.json();
      console.log(reponseJS.msg);

      this.macAddress = "";
      this.name = "";

      this.getDataFromServer();
    },

    getColor(index) {
      return index % 2 ? "lightBlue" : "pink";
    },
    nextPage() {
      console.log("Next page");
      this.page++;
      this.getDataFromServer();
    },
    previousPage() {
      console.log("Previous page");
      this.page--;
      this.getDataFromServer();
    },
    firstPage() {
      this.page=1;
      this.getDataFromServer();
    },
    lastPage() {
      this.page=this.nbPagesDeResultats;
      this.getDataFromServer();
    }
  }
};
</script>

<style scoped>
.divider {
  margin: 5px;
}
.update {
  padding: 20px;
}
#list {
    text-align: center;
}

</style>
