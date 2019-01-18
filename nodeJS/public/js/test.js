$.get('irrigation', function(data, status){
  json = JSON.parse(data);
  for (let i=0; i<json.length; i++){
    var div = "<div class='controlableSystems'><div class='controlableSystem'>";
    var name = "<div style='float:left;width:60%;text-align:right; " +
    "padding-right:2%'>Irrigation sur station " + json[i].id_station + "</div>";
    var checkbox = '<label class="switch"><input id="station' +
    json[i].id_station + '" type="checkbox">' +
    '<div class="slider round"></div></label>';
    var state = "<div class='comment' id='comment" + json[i].id_station + "'></div>";
    var close = "</div></div><br />";

    var toPrint = div + name + checkbox + state + close;
    document.getElementById("controlableSystemsArea").innerHTML += toPrint;
  }
  for (let i=0; i<json.length; i++){

    if (json[i].last == 1) {
      document.getElementById("comment" + json[i].id_station).innerHTML = "Actif";
      document.getElementById("station" + json[i].id_station).checked = true;
    }

    $("#station" + json[i].id_station).click(function(){
      if (document.getElementById("station" + json[i].id_station).checked){
        $.post("startWatering", {value:json[i].id_station}, function(data, status){
          // console.log("station " + json[i].id_station + " démarrée");
          document.getElementById("comment" + json[i].id_station).innerHTML = "Actif";
        });
      } else {
        $.post("stopWatering", {value:json[i].id_station}, function(data, status){
          // console.log("station " + json[i].id_station + " arrêtée");
          document.getElementById("comment" + json[i].id_station).innerHTML = "";
        });
      }
    });
  }
});
// $('#startSC').click(function() {
//   $.post('start', function(){
//     document.getElementById("message").innerHTML = 'Systèmes Contrôlables arrêtés!';
//     document.getElementById("message").style.display = "block";
//   });
// })

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

$('.boutonDeconnection').mousedown(function (e) {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
  location.reload();
});

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


// Gestion evenement modification du select de l'humidité ou temperature
function onGraphSelected(type, ref){

  // On récupère les valeurs des différents select.
  let v1 = $('select#' + type + 'FromWeek').val(); // valeur du select
  let v2 = $('select#' + type + 'FromDay').val(); // valeur du select
  let v3 = $('select#' + type + 'FromHour').val(); // valeur du select
  let v4 = $('select#' + type + 'ToWeek').val(); // valeur du select
  let v5 = $('select#' + type + 'ToDay').val(); // valeur du select
  let v6 = $('select#' + type + 'ToHour').val(); // valeur du select

  // On calcul les temps en heure donnés par l'utilisateur
  //    start : nombre d'heure dans le passé
  let start = (parseInt(v1) * 7 * 24) + (parseInt(v2) * 24) + parseInt(v3);
  //    end : nombre d'heure dans le passé devant être inférieur à 'start'
  let end = (parseInt(v4) * 7 * 24) + (parseInt(v5) * 24) + parseInt(v6);

  // console.log('given start date : ', start);
  // console.log('given end date : ', end);
  // Si end > start, on inverse les deux
  if (end > start) {
    let temp = start;
    start = end;
    end = temp;
    // console.log('switch : start=', start, ', end=', end);
  }

  // On update le Graphe
  let url = generateGrafanaUrl(start, end);
  document.getElementById(ref).setAttribute("src", "");
  document.getElementById(ref).setAttribute("src", url);
}

$( document ).ready(function() {
    // On effectue une opération quand le select est modifié
    $('#submitButtonTemperature').click(function(){
      onGraphSelected('temperature', 'image1');
    });
    $('#submitButtonHumidity').click(function(){
      onGraphSelected('humidity', 'image2');
    });
});
