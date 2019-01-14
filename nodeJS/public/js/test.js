$(window).on('load', function () {
    $("#close").click(function(){
      w3_close();
    });
    $(".popupSettingsOppugno").click(function(){
      w3_close();
      $('.popupSettings').show();
    });
    $(".popupWeatherOppugno").click(function(){
      w3_close();
      $('.popupWeather').show();
    });
    $('.popupCloseButton').click(function(){
      $('.popupBackground').hide();
    });
});

var showDetails = false;
$('.bouttonTemperature').mousedown(function (e) {
  if (showDetails) {
    document.getElementById("details").style.display = "none";
    showDetails = false;
  }
  else {
    document.getElementById("details").style.display = "block";
    showDetails = true;
  }
});

var showDetails2 = false;
$('.bouttonHumidite').mousedown(function (e) {
  if (showDetails2) {
    document.getElementById("details2").style.display = "none";
    showDetails2 = false;
  }
  else {
    document.getElementById("details2").style.display = "block";
    showDetails2 = true;
  }
});

var item = "";
for (let i = 1; i<=52; i++){
  item = '<option value="'+i+'">'+i+'</option>';
  $(item).appendTo("#temperatureFromWeek");
  $(item).appendTo("#temperatureToWeek");
  $(item).appendTo("#humidityFromWeek");
  $(item).appendTo("#humidityToWeek");
}
for (let i = 1; i<=7; i++){
  item = '<option value="'+i+'">'+i+'</option>';
  $(item).appendTo("#temperatureFromDay");
  $(item).appendTo("#temperatureToDay");
  $(item).appendTo("#humidityFromDay");
  $(item).appendTo("#humidityToDay");
}
for (let i = 1; i<=23; i++){
  item = '<option value="'+i+'">'+i+'</option>';
  $(item).appendTo("#temperatureFromHour");
  $(item).appendTo("#temperatureToHour");
  $(item).appendTo("#humidityFromHour");
  $(item).appendTo("#humidityToHour");
}

// Generate url grafana to get graphics with the given start and end date
function generateGrafanaUrl(start, end){
  /*
  http://redtacos.ddns.net:3000/render/d-solo/eAw1TqRRk/
  test-dashboard?panelId=4&orgId=1&from=now-48h&to=now&width=1000&height=500&tz=UTC%2B01%3A00
  */
  let url1 = 'http://redtacos.ddns.net:3000/render/d-solo/eAw1TqRRk/test-dashboard?panelId=4&orgId=1&';
  let url2 = '&width=1000&height=500&tz=UTC%2B01%3A00';

  let from = "from=now-" + start + "h&";
  let to = "to=now-" + end + "h&";

  let url = url1 + from + to + url2;
  return url
}

// Gestion evenement modification du select de la temperature
function onTemperatureSelected(){
  // On récupère les valeurs des différents select.
  let v1 = $('select#temperatureFromWeek').val(); // valeur du select
  let v2 = $('select#temperatureFromDay').val(); // valeur du select
  let v3 = $('select#temperatureFromHour').val(); // valeur du select
  let v4 = $('select#temperatureToWeek').val(); // valeur du select
  let v5 = $('select#temperatureToDay').val(); // valeur du select
  let v6 = $('select#temperatureToHour').val(); // valeur du select

  // On calcul les temps en heure donnés par l'utilisateur
  //    start : nombre d'heure dans le passé
  let start = (parseInt(v1) * 7 * 24) + (parseInt(v2) * 24) + parseInt(v3);
  //    end : nombre d'heure dans le passé devant être inférieur à 'start'
  let end = (parseInt(v4) * 7 * 24) + (parseInt(v5) * 24) + parseInt(v6);

  // Si end > start, on inverse les deux
  if (end > start) {
    console.log('given start date : ', start);
    console.log('given end date : ', end);
    let temp = start;
    start = end;
    end = temp;
    console.log('switch : start=', start, ', end=', end);
  }

  // On update le Graphe
  let url = generateGrafanaUrl(start, end);
  document.getElementById("image1").setAttribute("src", url);
}

// Gestion evenement modification du select de l'humidité
function onHumiditySelected(){
  // On récupère les valeurs des différents select.
  let v1 = $('select#humidityFromWeek').val(); // valeur du select
  let v2 = $('select#humidityFromDay').val(); // valeur du select
  let v3 = $('select#humidityFromHour').val(); // valeur du select
  let v4 = $('select#humidityToWeek').val(); // valeur du select
  let v5 = $('select#humidityToDay').val(); // valeur du select
  let v6 = $('select#humidityToHour').val(); // valeur du select

  // On calcul les temps en heure donnés par l'utilisateur
  //    start : nombre d'heure dans le passé
  let start = (parseInt(v1) * 7 * 24) + (parseInt(v2) * 24) + parseInt(v3);
  //    end : nombre d'heure dans le passé devant être inférieur à 'start'
  let end = (parseInt(v4) * 7 * 24) + (parseInt(v5) * 24) + parseInt(v6);

  // Si end > start, on inverse les deux
  if (end > start) {
    console.log('given start date : ', start);
    console.log('given end date : ', end);
    let temp = start;
    start = end;
    end = temp;
    console.log('switch : start=', start, ', end=', end);
  }

  // On update le Graphe
  let url = generateGrafanaUrl(start, end);
  document.getElementById("image2").setAttribute("src", url);
}

$( document ).ready(function() {
    // On effectue une opération quand le select est modifié
    $('#temperatureFromWeek').on('change', onTemperatureSelected);
    $('#temperatureFromDay').on('change', onTemperatureSelected);
    $('#temperatureFromHour').on('change', onTemperatureSelected);
    $('#temperatureToWeek').on('change', onTemperatureSelected);
    $('#temperatureToDay').on('change', onTemperatureSelected);
    $('#temperatureToHour').on('change', onTemperatureSelected);

    $('#humidityFromWeek').on('change', onHumiditySelected);
    $('#humidityFromDay').on('change', onHumiditySelected);
    $('#humidityFromHour').on('change', onHumiditySelected);
    $('#humidityToWeek').on('change', onHumiditySelected);
    $('#humidityToDay').on('change', onHumiditySelected);
    $('#humidityToHour').on('change', onHumiditySelected);
});
