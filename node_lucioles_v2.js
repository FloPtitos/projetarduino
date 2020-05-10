// Importation des modules
var path = require('path');

const mqtt = require('mqtt')
// Topics MQTT
const TOPIC_LIGHT = 'max/sensors/light'
const TOPIC_TEMP = 'max/sensors/temp'
const TOPIC_LED = 'max/sensors/led'
const TOPIC_FLOTTE = 'max/flotte'


// express 
const express = require('express');
const bodyParser = require('body-parser');

// pour les formulaires multiparts
var multer = require('multer');
var multerData = multer();
const mongoDBModule = require('./crud-mongo');

const app = express();
//Pour permettre de parcourir les body des requetes
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(function (request, response, next) { //Pour eviter les problemes de CORS/REST
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "*");
	response.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE");
	next();
});

// MongoDB
var mongodb = require('mongodb');
const mongoBaseName = "lucioles"                   // Nom de la base
//const uri = 'mongodb://localhost:27017/'; //URL de connection
//const uri = 'mongodb://10.9.128.189:27017/'; //URL de connection		
//const uri = "mongodb+srv://maximeprevot:admin!12@cluster0-eosau.mongodb.net/test";
const uri = "mongodb+srv://maximeprevot:admin!12@cluster0-bqcaf.mongodb.net/test"

const MongoClient = require('mongodb').MongoClient;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Connection a la DB MongoDB 
client.connect(function (err, mongodbClient) {
	if (err) throw err; // If connection to DB failed ... 
	// else we get a "db" engine reference

	//===============================================    
	// Get a connection to the DB "lucioles" or create
	//
	var dbo = client.db(mongoBaseName);

/* 	dbo.collection('arduinos').deleteMany({}, function (err, delOK) {
		if (err) throw err;
		if (delOK) console.log("Collection deleted");
	}); */

	dbo.collection('temp').deleteMany({}, function (err, delOK) {
		if (err) throw err;
		if (delOK) console.log("Collection deleted");
	});

	dbo.collection('light').deleteMany({}, function (err, delOK) {
		if (err) throw err;
		if (delOK) console.log("Collection deleted");
	});

	/* dbo.collection('flotte').deleteMany({}, function (err, delOK) {
		if (err) throw err;
		if (delOK) console.log("Collection deleted");
	});
 */


	//===============================================
	// Connection au broker MQTT distant
	//
	//const mqtt_url = 'http://192.168.1.100:1883' ///134.59.131.45:1883'
	const mqtt_url = 'http://broker.hivemq.com'
	var client_mqtt = mqtt.connect(mqtt_url);

	//===============================================
	// Des la connection, le serveur NodeJS s'abonne aux topics MQTT 
	//
	client_mqtt.on('connect', function () {
		client_mqtt.subscribe(TOPIC_LIGHT, function (err) {
			if (!err) {
				//client_mqtt.publish(TOPIC_LIGHT, 'Hello mqtt')
				console.log('Node Server has subscribed to ', TOPIC_LIGHT);
			}
		})
		client_mqtt.subscribe(TOPIC_TEMP, function (err) {
			if (!err) {

				//client_mqtt.publish(TOPIC_TEMP, JSON.stringify({name:'Hello'}))
				console.log('Node Server has subscribed to ', TOPIC_TEMP);
			}

		})
		client_mqtt.subscribe(TOPIC_FLOTTE, function (err) {
			if (!err) {

			}

		})

	})

	//================================================================
	// Callback de la reception des messages MQTT pour les topics sur
	// lesquels on s'est inscrit.
	// C'est cette fonction qui alimente la BD.
	//
	client_mqtt.on('message', async function (topic, message) {
		/* 	console.log("MQTT msg on topic : ", topic.toString());
			console.log("Msg payload : ", message.toString());
 */
		const flotte = await dbo.collection('flotte').find({}).toArray();
		const topicname = path.parse(topic.toString()).base;

		// Parsing du message suppos� recu au format JSON
		message = JSON.parse(message);
		wh = message.who
		val = message.value

		if (flotte.findIndex(object => object.who == wh) !== -1 || topicname === "flotte") {

			// Debug : Gerer une liste de who pour savoir qui utilise le node server	
			let wholist = []
			var index = wholist.findIndex(x => x.who == wh)
			if (index === -1) {
				wholist.push({ who: wh });
			}
			//	console.log("wholist using the node server :", wholist);
			//var frTime = new Date().toLocaleString("fr-FR", {timeZone: "Europe/Paris"});
			var frTime = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Paris" });
			var new_entry = {
				date: frTime, // timestamp the value 
				who: wh,      // identify ESP who provide 
				value: val    // this value
			};

			// Stocker la donnee/value contenue dans le message en
			// utilisant le nom du topic comme key dans la BD
			key = topicname
			dbo.collection(key).insertOne(new_entry, function (err, res) {
				if (err) throw err;
				//  console.log("Item inserted in db in collection :", key);
			/* 	console.log(new_entry); */
			});

			// Debug : voir les collections de la DB 
			dbo.listCollections().toArray(function (err, collInfos) {
				// collInfos is an array of collection info objects that look like:
				// { name: 'test', options: {} }
				// console.log("\nList of collections currently in DB: ", collInfos); 
			});
		}
	}) // end of 'message' callback installation


	//================================================================
	// Fermeture de la connexion avec la DB lorsque le NodeJS se termine.
	//
	process.on('exit', (code) => {
		if (mongodbClient && mongodbClient.isConnected()) {
			// console.log('mongodb connection is going to be closed ! ');
			mongodbClient.close();
		}
	})

	//================================================================
	//==== REQUETES HTTP reconnues par le Node =======================
	//================================================================


	app.post('/esp/led', function (req, res) {
		client_mqtt.publish(TOPIC_LED, JSON.stringify(req.body));
		res.send("OK");
	})

	app.post('/flotte', function (req, res) {
		var frTime = new Date().toLocaleString("sv-SE", { timeZone: "Europe/Paris" });
			var new_entry = {
				date: frTime, // timestamp the value 
				who: req.body.who,      // identify ESP who provide 
				value: req.body.who    // this value
			};
		db0.collection("flotte").insertOne(new_entry, function (err, res) {
			if (err) throw err;
			//  console.log("Item inserted in db in collection :", key);
			console.log(new_entry);
		});
		res.send("Ok, ajouté à la flotte");
	})
	app.get('/esp/:what', function (req, res) {
		// cf https://stackabuse.com/get-query-strings-and-parameters-in-express-js/
		console.log(req.originalUrl);

		wh = req.query.who // get the "who" param from GET request
		// => gives the Id of the ESP we look for in the db	
		wa = req.params.what // get the "what" from the GET request : temp or light ?

		/* 	console.log("\n--------------------------------");
			console.log("A client/navigator ", req.ip);
				console.log("sending URL ",  req.originalUrl);
			console.log("wants to GET ", wa);
			console.log("values from object ", wh); */

		const nb = 200; // R�cup�ration des nb derniers samples
		// stock�s dans la collection associ�e a ce
		// topic (wa) et a cet ESP (wh)
		key = wa
		//dbo.collection(key).find({who:wh}).toArray(function(err,result) {
		dbo.collection(key).find({ who: wh }).sort({ _id: -1 }).limit(nb).toArray(function (err, result) {
			if (err) throw err;
			/*   console.log('get on ', key);
			  console.log(result); */
			res.json(result.reverse()); // This is the response.
			/*   console.log('end find'); */
		});
		/* 	console.log('end app.get'); */
	});
	
	//Arduinos Handle
	app.get('/api/connection', function(req, res) {
		// Pour le moment on simule, mais après on devra
		// réellement se connecte à la base de données
		// et renvoyer une valeur pour dire si tout est ok
	   mongoDBModule.connexionMongo(function(err, db) {
		   let reponse;
	
		   if(err) {
			   console.log("erreur connexion");
			   reponse = {
				   msg: "erreur de connexion err=" + err
			   }
		   } else {
			   reponse = {
				   msg: "connexion établie"
			   }
		   }
		   res.send(JSON.stringify(reponse));
	
	   });
	});
	
	app.get('/api/arduinos/count', function(req, res) {
		// Pour le moment on simule, mais après on devra
		// réellement se connecte à la base de données
		// et renvoyer une valeur pour dire si tout est ok
		let name = req.query.name || '';
	
		mongoDBModule.countArduinos(name, function(data) {
			var objdData = {
				msg:"Arduinos count",
				data: data
			}
			res.send(JSON.stringify(objdData));
		});
	});
	
	// On va récupérer des restaurants par un GET (standard REST) 
	// cette fonction d'API peut accepter des paramètres
	// pagesize = nombre de restaurants par page
	// page = no de la page
	// Oui, on va faire de la pagination, pour afficher
	// par exemple les restaurants 10 par 10
	app.get('/api/arduinos', function(req, res) { 
		
		// Si présent on prend la valeur du param, sinon 1
		let page = parseInt(req.query.page || 1);
		// idem si present on prend la valeur, sinon 10
		let pagesize = parseInt(req.query.pagesize || 10);
	
		let name = req.query.name || '';
	
	
		 mongoDBModule.findArduinos(page, pagesize, name, function(data,count) {
			 var objdData = {
				 msg:"arduino recherchés avec succès",
				 data: data,
				count:count
			 }
			 res.send(JSON.stringify(objdData)); 
		 }); 
	});
	
	// Récupération d'un seul restaurant par son id
	app.get('/api/arduinos/:id', function(req, res) {
		var id = req.params.id;
	
		 mongoDBModule.findArduinoById(id, function(data) {
			 res.send(JSON.stringify(data)); 
		 });
	 
	});
	
	// Creation d'un restaurant par envoi d'un formulaire
	// On fera l'insert par un POST, c'est le standard REST
	app.post('/api/arduinos', multerData.fields([]), function(req, res) {
		// On supposera qu'on ajoutera un restaurant en 
		// donnant son nom et sa cuisine. On va donc 
		// recuperer les données du formulaire d'envoi
		// les params sont dans req.body même si le formulaire
		// est envoyé en multipart
	
		 mongoDBModule.createArduino(req.body, function(data) {
			 res.send(JSON.stringify(data)); 
		 });
	});
	
	// Modification d'un restaurant, on fera l'update par
	// une requête http PUT, c'est le standard REST
	app.put('/api/arduinos/:id', multerData.fields([]), function(req, res) {
		var id = req.params.id;
	
		 mongoDBModule.updateArduino(id, req.body, function(data) {
			 res.send(JSON.stringify(data)); 
		 });
	});
	
	// Suppression d'un restaurant
	// On fera la suppression par une requête http DELETE
	// c'est le standard REST
	app.delete('/api/arduinos/:id', function(req, res) {
		var id = req.params.id;
	
		 mongoDBModule.deleteArduino(id, function(data) {
			 res.send(JSON.stringify(data)); 
		 });
	})
});// end of MongoClient.connect



// L'application est accessible sur le port 3000
app.listen(3000, () => {
	console.log('Server listening on port 3000');
});
