# Utilisation de la BD

Nom de la BD : SENSOR_DATA
Utilisateur : PILBI
mdp : Pilbi

## Ajout de timeseries à la base de donnée

```INSERT <mesurement>, id_station=<id> value=<value>```

| Mesurement |
|  --------  |
| temperature|
| soil_moisture|
| air_humidity|
| luminosity |

| example |
| ------- |
| INSERT temperature,id_station=1 value=246 |
| INSERT soil_moisture,id_station=1 value=14 |
| INSERT luminosity,id_station=1 value=1245872 |

## Récupération de données

```SELECT * from "temperature"
SELECT value from "soil_moisture"```
