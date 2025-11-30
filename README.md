# Test technique for Algoreg

## Structure du projet :
- `angular` : dossier contenant le projet sous angular
- `react` : dossier contenant ma tentative raté de faire le projet avec React
- `test_prototype` : dossier contenant mon POC avec face landmarker.

Le projet angular est le plus anvancé avec le plus de feature demandée.

## Lancement du projet

Pour lancer le projet :
- Se rendre dans le dossier angular : `cd angular`
- Récupérer les dépendances : `npm install`
- Lancer le projet : `npm start`
- Se rendre dans son navigateur à l'adresse :  http://localhost:4200

+Note+
Le projet à rencontrés quelques difficultés d'exécution sous Firefox, je n'ai pas rencontrés ces problème sous edge.

## Usage de l'AI:
J'ai utilisé l'IA comme un copilot pour les tâches suivantes :
- analyse du sujet et découpage en plus petite tâche
- création de snippet de code pour des besoins précis (Utilisation de face landmarker)

## Limite du rendu
- l'interface bien que fonctionnelle pourrait nécessiter un petit llifting. J'ai passé beaucoup trop de temps à faire fonctionner le coeur des feature pour pouvoir consacrer beaucoup de temps à l'UX.
- Ma conaissance des svg et de leur animation est assez limité présentement. Si j'avais un peu plus de temps j'aurai essayer d'indiquer d'une meilleur manière l'orientation du visage. Ce faisant un autre parcours de vérification aurait pu être proposé. Par emple un cercle qu'il faut suivre, ce faisant l'utilisateur fait tourner sa tête sur plusieurs angles ce qui nous permet de prendre plus de photos.
- Je ne prends que 5 photos (centré, tourné à gauche, tourné à droite, regardant vers le haut et regardant vers le bas). il est possible en fonction des besoin de facilement prendre plus de photos.

## Temps passé
Voici un petit tableau avec une estimation du temps que j'ai passé sur les différentes tâches.<br>
Il est possible que certains temps soit sous-évalué en particulier dans les phase de debug.

| Tâche                                                                               | Temps   |
| ----------------------------------------------------------------------------------- | ------: |
| Etude de la demande                                                                 | 1.0h    |
| Création du projet react                                                            | 0.5h    |
| Création de la base sur le projet react                                             | 0.5h    |
| Première tentative pour l'utilisation de lib face lander marker (échec) (react)     | 4.0h    |
| Seconde tentative pour l'utilisation de lib face lander marker sur un projet à part | 2.0h    |
| Tentative intégration dans react du projet avec facelandmarker                      | 4.0h    |
| Intégration du projet avec Angular                                                  | 3.0h    |
| Finition sur le projet Angular                                                      | 1.0h    |
|---------------------------------------------------------------------------------------- | ------- |
| ***Total***   | ***16.0h***    |

## Problèmes rencontrés
- Faire fonctionner la librairie face landermarker
- Fonctionnement de face landermarker avec la logique react

### Fonctionnement de face landemarker
J'ai rencontré un certain nombre de problème pour faire fonctionner la librairie de reconnaissance de visage.
La difficultés est lié à plusieurs éléments :
- une lib qui m'était inconnu.
- un domaine (la reconnaissance d'image et de visage) m'était peu connu voire dans certain aspect inconnu.
- des erreurs matériels et logiciel bizarre.

Pour me débloquer j'ai utilisé l'exemple fourni par Google comme playground - le sous dossier test_prototype est le résultat de ces expérimentation.
J'ai utilisé Gemini pour mieux comprendre les erreurs rencontrés et trouver plus facilement des solutions.
Si au départ je m'étais lancé pour faire directement tout sous react, j'ai clairement eu d'autre problème et passage par un projet plus simple pour comprendre ce que je faisais.
Une forme de POC en quelque sorte.
J'ai assez rapidement avec l'aide de Gemini pu avancer jusqu'à un point où le poc faisait ce qui était demandé.

Malheureusement j'ai rencontrés des erreur un peu curieuse :
- Firefox semble avoir du mal avec certaines fonctions et me renvoyait systématiquement des erreurs, que je ne rencontrais pas sur Edge ou Brave.
- une stack d'execution qui faisait parfois n'importe quoi, avec des erreur survenant lors du quatrième passage dans la boucle de détection.

Il semble que mon installation de firefox puisse présenter quelques instabilités, je n'ai pas eu le temps d'approfondir cela.

### Intégration de face landermaker dans react

React avec sont approche composant et hook est plutôt intéressant pour un petit projet comme celui-ci.
Malheureusement je suis un peu rouillé en React et certain concept de rafraichissement m'ont causer pas mal de problèmes.
Par exemple, mon code React pouvait lancer le hook pour récupérer la caméra plusieurs fois et parfois pendant qu'un traitement était en cours, ce qui causait des erreurs bien complexe à debugger.

Malgré l'aide de Gemini, aucune solution proposé n'a pu m'aider sur mes problèmes et parfois les a rendus pire.

En relisant le sujet, je n'était pas obliger d'utiliser React, je me suis donc retourner vers Angular que je maitrise un peu mieux.