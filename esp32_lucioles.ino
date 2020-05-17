/*
 * Auteur : G.Menez
 */
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h> // by Benoit Blanchon
#include <Wire.h>
#include "OneWire.h"
#include "DallasTemperature.h"
#include "net_misc.h"

/*============= GPIO ======================*/
const int ledPin = 19; // LED Pin Arroseur
const int ledPinLumiere = 18; // LED Pin Lumiere
const int photo_resistor_pin = 33; // Lumiere
OneWire oneWire(23); // Température
DallasTemperature tempSensor(&oneWire);

WiFiClient espClient; // Wifi
PubSubClient client(espClient) ; // MQTT client

String whoami; // Identification de CET ESP au sein de la flotte

//StaticJsonBuffer<200> jsonBuffer;

/*===== MQTT broker/server and TOPICS ========*/
//const char* mqtt_server = "192.168.1.100";
const char* mqtt_server = "broker.hivemq.com";
#define TOPIC_TEMP "max/sensors/temp"
#define TOPIC_LED "max/sensors/led"
#define TOPIC_LIGHT "max/sensors/light"
#define TOPIC_FLOTTE "max/flotte"

/*=============== SETUP =====================*/

void setup () {
  // Gpio
  pinMode (ledPin , OUTPUT);
  pinMode (ledPinLumiere , OUTPUT);
  // Serial
  Serial.begin (9600);
  
  /* Wifi */
  connect_wifi();
  
  /*  L'ESP est un client du mqtt_server */
  client.setServer(mqtt_server, 1883);
  // set callback when publishes arrive for the subscribed topic
  // methode a effet local => on n'a pas a initier/verifier la connection.
  client.setCallback(mqtt_pubcallback);

  /* Choix d'une identification pour cet ESP ---*/
  // whoami = "esp1"; 
  whoami =  String(WiFi.macAddress());
  tempSensor.begin();
}

/*============== MQTT CALLBACK ===================*/

void mqtt_pubcallback(char* topic, byte* message, unsigned int length) {
  /* 
   *  Callback if a message is published on this topic.
   */
  // Byte list to String ... plus facile a traiter ensuite !
  // Mais sans doute pas optimal en performance => heap ?
  String messageTemp ;
  for(int i = 0 ; i < length ; i++) {
    messageTemp += (char) message[i];
  }
  
  Serial.print("Message : ");
  Serial.println(messageTemp);
  Serial.print("arrived on topic : ");
  Serial.println(topic) ;
  
  StaticJsonDocument<200> json_doc;
  deserializeJson(json_doc, messageTemp);
  if (String(topic) == TOPIC_LED && json_doc["who"] == WiFi.macAddress()) {
    set_pin(ledPin,HIGH);
    delay(5000); //on suppose un arrosage de 5s
    set_pin(ledPin,LOW);
  }
}

/*============= MQTT SUBSCRIBE =====================*/

void mqtt_mysubscribe(char* topic) {
  /*
   * ESP souscrit a ce topic. Il faut qu'il soit connecte.
   */
  while(!client.connected()) { // Loop until we are reconnected
    Serial.print("Attempting MQTT connection...");
    if(client.connect("esp48", "try", "try")) { // Attempt to connect 
      Serial.println("connected");
      client.subscribe(topic);// and then Subscribe
     rejoindre_flotte();
    } else { // Connection failed
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println("try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5*1000);
    }
  }
}

/*============= ACCESSEURS ====================*/

float get_temperature() {
  float temperature;
  tempSensor.requestTemperaturesByIndex(0);
  delay (750);
  temperature = tempSensor.getTempCByIndex(0);
  return temperature;
}

float get_light(){
  return analogRead(photo_resistor_pin);
}

void set_pin(int pin, int val){
 digitalWrite(pin, val) ;
}

int get_pin(int pin){
  return digitalRead(pin);
}


void rejoindre_flotte(){
  char data[80];
  String payload; // Payload : "JSON ready" 
  
  payload = "{\"who\": \"";
  payload += WiFi.macAddress();
  payload += "\", \"value\": \"Maxime\"" ;
  payload += "}";
  
  payload.toCharArray(data, (payload.length() + 1)); // Convert String payload to a char array
  Serial.println(data);
  client.publish(TOPIC_FLOTTE, data);  // publish it z
}
/*================= LOOP ======================*/
void loop () {
 
  
  if(get_temperature() >25){ //clignote quand il fait trop chaud et simule la pompe
    digitalWrite(ledPin, HIGH); // Allume la pompe
    delay(1000);
    digitalWrite(ledPin, LOW);  
  }

 // photo_resistor_pin = analogRead (A0);

  if(get_light() < 500){ // Pour les plantes nocturnes s'il fait nuit on leur allume une petite source de lumiere
    digitalWrite(ledPinLumiere, HIGH);
  }
  if(get_light() >= 500){ // on éteint quand il fait jour
    digitalWrite(ledPinLumiere, LOW); 
  }
  
  
  char data[80];
  String payload; // Payload : "JSON ready" 
  int32_t period = 500l; // Publication period
  
  /* Subscribe to TOPIC_LED if not yet ! */
  if (!client.connected()) {
    mqtt_mysubscribe((char*) (TOPIC_LED));
  }
  
  /* Publish Temperature & Light periodically */
  payload = "{\"who\": \"";
  payload += whoami;   
  payload += "\", \"value\": " ;
  payload += get_temperature(); 
  payload += "}";
  
  payload.toCharArray(data, (payload.length() + 1)); // Convert String payload to a char array
  Serial.println(data);
  client.publish(TOPIC_TEMP, data);  // publish it 

  /* char tempString[8];
     dtostrf(temperature, 1, 2, tempString);
     client.publish(TOPIC_TEMP, tempString); */

  payload = "{\"who\": \"" + whoami + "\", \"value\": " + get_light() + "}";
  payload.toCharArray(data, (payload.length() + 1));
  Serial.println(data);
  client.publish(TOPIC_LIGHT, data);

  delay(period);
  client.loop();
}
