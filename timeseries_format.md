# Utilisation de la BD

Nom des BD : SENSOR_DATA, CONTROLLABLE_SYSTEMS

## Ajout de timeseries à la base de donnée

```INSERT <mesurement>, id_station=<id> value=<value>```

### Pour SENSOR_DATA

| Mesurement |
|  --------  |
| temperature|
| soil_moisture|
| air_humidity|
| luminosity |

_exemple_

| requête |
| ------- |
| INSERT temperature,id_station=1 value=246 |
| INSERT soil_moisture,id_station=1 value=14 |
| INSERT luminosity,id_station=1 value=1245872 |

### Pour CONTROLLABLE_SYSTEMS

| Mesurement |
|  --------  |
| watering|
| freeze |

_exemple_

| requête | signification |
| ------- | ----|
| INSERT watering,id_station=1 value=1 | Activation de l'arrosage du secteur 1 |
| INSERT watering,id_station=1 value=0 | Arrêt de l'arrosage du secteur 1 |
| INSERT freeze value=1 | Plus aucun système ne doit être activé |
| INSERT freeze value=0 | Les systèmes controllables peuvent à nouveau s'activer |


## Récupération de données

```SELECT * from "temperature"
SELECT value from "soil_moisture"```
