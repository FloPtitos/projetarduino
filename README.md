# Installation

Télécharger NodeJS : https://nodejs.org/fr/download/ <br/>
Cloner le repo : git clone https://github.com/FloPtitos/projetarduino.git<br/>
Se déplacer dans dans le dossier : cd votreChemin<br/>
Sur l'interpreteur de commande : npm install -g @vue/cli<br/>
Se déplacer dans le dossier tp_app : <br/>
```
cd tp_app
```
lancer la commande : <br/>
```
npm install
```
lancer la commande : <br/>
```
npm run serve
```
Pour voir le site taper localhost:8080 sur votre navigateur<br/>
<br/>
Une version en ligne et hébergé existe à l'adresse suivante : http://51.83.77.127:8080/

# Utilisation

Une fois sur le site cliquer sur plant list
Ajouter votre esp32 en metant votre adresse IP et un nom pour votre plante
Vous pouvez aussi modifier ou supprimer votre plante si vous vous êtes trompés
En cliqaunt sur "see details", vous pouvez voir la temperature ainsi que la luminosité de votre plante 

# Comment ça marche

## Architecture 

![Architecture](https://i.imgur.com/WotJjCe.png)

## Cote Esp

Si la température est supérieur a 25°C alors la led (qui simule la pompe) va clignoter cela correspond à l'arrosage de la plante. 
Notre projet marche pour tous les types de plantes, du coup pour gérer les plantes exotiques (qui doivent etre constament sous la lumière), nous avons implémentés grâce a la photo resistance, une led qui va s'allumer quand il fait nuit ou sombre dans la pièce.


## Cote Vue

Nous avons fait appel a une API pour recupérer les données de températures et de précipitation (pour l'instant qu'a Nice), ses données nous permettent de voir s'il fait trop chaud et s'il ne pleut pas d'arroser la plante.
Nous avons également implémenté un bouton pour lancer l'arrosage à partir de l'interface web. 

# Difficulté 

Le majeur point de difficulté a été l'hebergement du projet, qui a été réglé en utilisant un VPS OVH et le processus PM2 pour faire tourner en continu.
Pour le déploiement de notre TP nous avons utilisé OVH.
Pour ce faire nous sommes passé par Github afin de récupérer les fichiers sur le VPS via SSH. 
Une fois les fichiers sur le serveur nous avons utilisé pm2 pour permettre au serveur node et au site de tourner en continu sans fenetre ssh ouverte.

# Schéma simplifié 
![Schema](https://i.imgur.com/S0xdSAM.png)
