var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;

var assert = require('assert');
//var url = 'mongodb://localhost:27017/test';

// Connection URL
const url = "mongodb+srv://maximeprevot:admin!12@cluster0-bqcaf.mongodb.net/test?retryWrites=true&w=majority"

// Database Name
const mongoBaseName = 'lucioles';

exports.connexionMongo = function(callback) {
	MongoClient.connect(url, function(err, client) {
		var db = client.db(dbName);
		
		assert.equal(null, err);
		callback(err, db);
	});
}

exports.countArduinos = function(name,callback) {
	MongoClient.connect(url, function(err, client) {
		var db = client.db(mongoBaseName);

		console.log("db " + db)
		if(!err){
			if(name==''){
				db.collection('arduinos')
					.count()
					.then(rep => callback(rep));
			}else {
				let query = {
					"name" : {$regex:".*"+name+".*",$options:"i"}
				}
				db.collection('arduinos')
					.find(query)
					.count()
					.then(rep => callback(rep));

			}
		}
	});
};

exports.findArduinos = function(page, pagesize, name, callback) {
	MongoClient.connect(url, function(err, client) {

			var db = client.db(mongoBaseName);

			console.log("db " + db)
		if(!err){
			if(name == ''){
				db.collection('arduinos')
					.find()
					.skip(page*pagesize)
					.limit(pagesize)
					.toArray()
					.then(arr=>{
						db.collection('arduinos')
							.count()
							.then(rep=>callback(arr,rep))
					});
			}
			else{
					let query = {
						"name" : {$regex:".*"+name+".*",$options:"i"}
					}
					db.collection('arduinos')
						.find(query)
						.skip(page*pagesize)
						.limit(pagesize)
						.toArray()
						.then(arr=>{
							db.collection('arduinos')
								.find(query)
								.count()
								.then(rep=>callback(arr,rep))
					});
			}
		}
		else{
			callback(-1);
		}
	});
};

exports.findArduinoById = function(id, callback) {
	MongoClient.connect(url, function(err, client) {
		var db = client.db(mongoBaseName);
		if(!err) {
			// La requete mongoDB

			let myquery = { "_id": ObjectId(id)};
			
			db.collection("arduinos") 
			.findOne(myquery, function(err, data) {
				let reponse;

				if(!err){
					reponse = {
						succes: true,
						arduino : data,
						error : null,
						msg:"Details du arduino envoyés"
					};
				} else{
					reponse = {
						succes: false,
						arduino : null,
						error : err,
						msg: "erreur lors du find"

					};
				}
				callback(reponse);
			});
		} else {
			let reponse = reponse = {
						succes: false,
						arduino : null,
						error : err,
						msg: "erreur de connexion à la base"
					};
			callback(reponse);
		}
	});
}

exports.createArduino = function(formData, callback) {
	MongoClient.connect(url, function(err, client) {
		var db = client.db(mongoBaseName);

		if(!err) {
	 
			let toInsert = {
				name : formData.name, 
				macAddress : formData.macAddress
			};
			console.dir(JSON.stringify(toInsert));
			db.collection("arduinos")
			.insert(toInsert, function(err, insertedId) {
				let reponse;

				console.log('++++'+insertedId)

				if(!err){
					reponse = {
						succes : true,
						result: insertedId.ops[0]._id,
						error : null,
						msg: "Ajout réussi " + insertedId.ops[0]._id
					};
				} else {
					reponse = {
						succes : false,
						error : err,
						msg: "Problème à l'insertion"
					};
				}
				callback(reponse);
			});
		} else{
			let reponse = reponse = {
						succes: false,
						error : err,
						msg:"Problème lors de l'insertion, erreur de connexion."
					};
			callback(reponse);
		}
	});
}

exports.updateArduino = function(id, formData, callback) {

	MongoClient.connect(url, function(err, client) {
		var db = client.db(mongoBaseName);

		if(!err) {
			let myquery = { "_id": ObjectId(id)};
			let newvalues = {
				name : formData.name, 
				macAddress : formData.macAddress
			};


			db.collection("arduinos")
			.replaceOne(myquery, newvalues, function(err, result) {
				 if(!err){
					reponse = {
						succes : true,
						result: result,
						error : null,
						msg: "Modification réussie " + result
					};
				   } else {
					reponse = {
						succes : false,
						error : err,
						msg: "Problème à la modification"
					};
				}
				callback(reponse);
			});
		} else{
			let reponse = reponse = {
						succes: false,
						error : err,
						msg:"Problème lors de la modification, erreur de connexion."
					};
			callback(reponse);
		}
	});
}

exports.deleteArduino = function(id, callback) {
	MongoClient.connect(url, function(err, client) {
		var db = client.db(mongoBaseName);
		
		if(!err) {
			let myquery = { "_id": ObjectId(id)};
			
			db.collection("arduinos")
			.deleteOne(myquery, function(err, result) {
				 if(!err){
					reponse = {
						succes : true,
						result: result,
						error : null,
						msg: "Suppression réussie " + result
					};
				   } else {
					reponse = {
						succes : false,
						error : err,
						msg: "Problème à la suppression"
					};
				}
				callback(reponse);
			});
		} else{
			let reponse = reponse = {
						succes: false,
						error : err,
						msg:"Problème lors de la suppression, erreur de connexion."
					};
			callback(reponse);
		}
	});

}