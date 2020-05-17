# Installation

Télécharger NodeJS : https://nodejs.org/fr/download/
Cloner le repo : git clone https://github.com/FloPtitos/projetarduino.git
Se déplaceer dans dans le dossier : cd votreChemin
Sur l'interpreteur de commande : npm install -g @vue/cli
Se déplacer dans le dossier Tp_app : cd tp_app
lancer la commande : npm install
lancer la commande : npm run serve
Pour voir le site taper localhost:8080 sur votre navigateur

Une version en ligne et hébergé existe à l'adresse suivante : 

# Utilisation

Une fois sur le site cliquer sur plant list
Ajouter votre esp32 en metant votre adresse IP et un nom pour votre plante
Vous pouvez aussi modifier ou supprimer votre plante si vous vous êtes trompés
En cliqaunt sur "see details", vous pouvez voir la temperature ainsi que la luminosité de votre plante 

# Comment ça marche

## Cote Esp

Si la température est supérieur a 25°C alors la led (qui simule la pompe) va clignoter cela correspond à l'arrosage de la plante. 
Notre projet marche pour tous les types de plantes, du coup pour gérer les plantes exotiques (qui doivent etre constament sous la lumière), nous avons implémentés grâce a la photo resistance, une led qui va s'allumer quand il fait nuit ou sombre dans la pièce.


## Cote Vue

Nous avons fait appel a une API pour recupérer les données de températures et de précipitation (pour l'instant qu'a Nice), ses données nous permettent de voir s'il fait trop chaud et s'il ne pleut pas d'arroser la plante.
Nous avons également implémenté un bouton pour lancer l'arrosage à partir de l'interface web. 

# Difficulté 


