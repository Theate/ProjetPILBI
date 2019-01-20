var controlablesNumber;

var line = "<div class='controlableSystems'>";
var sublineHead = "<div id='controlableSystemHead'>";
var texte = "Selectionner un mode de fonctionnement";
var divManuel = "<div style='float:left;width:42%;text-align:right;padding-right:4%'>";
var divAuto = "<div style='float:left;width:40%;text-align:left;padding-left:4%'>";
var manuel = "Manuel</div>";
var auto = "Automatique</div>";
var selectMode = '<label class="switch"><input id="mode" type="checkbox">' +
'<div class="slider round"></div></label>';
var close = "</div></div>";

function myControlableSystems() {
  // Affiche le selecteur du mode des systèmes controlables
  var mode = line + texte + sublineHead + divManuel + manuel + selectMode +
  divAuto + auto + "<br />" + close;
  document.getElementById("controlableSystemsArea").innerHTML += mode;

  // affiche le mode actuel
  getSCMode();

  // affiche tous les systèmes controlables et leurs états de fonctionnement
  printSC();
}

function getSCMode() {
  $.get('mode', function(data, status){
    if (data == "1"){ // mode automatique
      document.getElementById("mode").checked = true;
    }
    // on affiche le selecteur du mode une fois sûr de son état actuel
    document.getElementById("controlableSystemHead").style.display = "block";
  });
}

function printSC() {
  var sublineEngine = "<div class='controlableSystem'>";
  var system = "<div style='float:left;width:64%;text-align:right;padding-right:4%'>";

  $.get('irrigation', function(data, status){
    // give last state of each controlable system
    json = JSON.parse(data);
    controlablesNumber = json.length;

    // print each contolable systems selector
    for (let i=0; i<controlablesNumber; i++){
      var name = "Irrigation sur station " + json[i].id_station;
      var checkbox = '</div><label class="switch"><input id="station' +
      json[i].id_station + '" type="checkbox">' + '<div class="slider round"></div></label>';
      var state = "<div class='comment' id='comment" + json[i].id_station + "'>Inactif</div>";
      var toPrint = line + sublineEngine + system + name + checkbox + state + close;
      document.getElementById("controlableSystemsArea").innerHTML += toPrint;
    }

    var display = "inline-block";
    var margin = "72%";
    if (document.getElementById("mode").checked) {
      display = "none";
      margin = "65%";
    }
    for (let i=0; i<controlablesNumber; i++){

      // if we are in manual mode, we do not display controlable systems selectors
      document.getElementById("station" + json[i].id_station).style.display = display;
      document.getElementById("comment" + json[i].id_station).style.marginLeft = margin;

      // if controlable system is on, we put it on in the UI too
      if (json[i].last == 1) {
        document.getElementById("comment" + json[i].id_station).innerHTML = "Actif";
        document.getElementById("comment" + json[i].id_station).style.color = "green";
        document.getElementById("station" + json[i].id_station).checked = true;
      }

      // add javascript to each controlable systems selector
      $("#station" + json[i].id_station).click(function(){
        if (document.getElementById("station" + json[i].id_station).checked){
          $.post("startWatering", {value:json[i].id_station}, function(data, status){
            // console.log("station " + json[i].id_station + " démarrée");
            document.getElementById("comment" + json[i].id_station).innerHTML = "Actif";
            document.getElementById("comment" + json[i].id_station).style.color = "green";
          });
        } else {
          $.post("stopWatering", {value:json[i].id_station}, function(data, status){
            // console.log("station " + json[i].id_station + " arrêtée");
            document.getElementById("comment" + json[i].id_station).innerHTML = "Inactif";
            document.getElementById("comment" + json[i].id_station).style.color = "red";
          });
        }
      });
    }
    // add javascript to selector
    $("#mode").click(function(){
      if (document.getElementById("mode").checked){
        for (let i=1; i<=controlablesNumber; i++) {
          document.getElementById("station" + i).style.display = "none";
          document.getElementById("comment" + i).style.marginLeft = "65%";
        }
        $.post("changeMode", {value:1});
      } else {
        for (let i=1; i<=controlablesNumber; i++) {
          document.getElementById("station" + i).style.display = "inline-block";
          document.getElementById("comment" + i).style.marginLeft = "72%";
        }
        $.post("changeMode", {value:0});
      }
    });
  });
}

myControlableSystems();

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
function generateGrafanaUrl(start, end, id_graph){
  /*
  http://redtacos.ddns.net:3000/render/d-solo/eAw1TqRRk/
  test-dashboard?panelId=4&orgId=1&from=now-48h&to=now&width=1000&height=500&tz=UTC%2B01%3A00
  */
  let url1 = 'http://redtacos.ddns.net:3000/render/d-solo/vJW9MEzRz/all-sensors?orgId=1&';
  let url2 = '&width=1000&height=500&tz=UTC%2B01%3A00';

  let from = "from=now-" + start + "h&";
  let to = "to=now-" + end + "h&";
  let panel = "panelId=" + id_graph + "&";

  let url = url1 + panel + from + to + url2;
  return url
}


// Gestion evenement modification du select de l'humidité ou temperature
function onGraphSelected(type, ref, id_graph){

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
  let url = generateGrafanaUrl(start, end, id_graph);
  document.getElementById(ref).setAttribute("src", "");
  document.getElementById(ref).setAttribute("src", url);
}

$( document ).ready(function() {
    // On effectue une opération quand le select est modifié
    $('#submitButtonTemperature').click(function(){
      onGraphSelected('temperature', 'image1', '6');
    });
    $('#submitButtonHumidity').click(function(){
      onGraphSelected('humidity', 'image2', '2');
    });
});

if (!!window.EventSource) {
  var source = new EventSource('/stream');

  source.addEventListener('message', function(e) {
    if (e.data.includes("id_station")) {
      for (let i=1; i <= controlablesNumber; i++) {
        if (e.data.includes("id_station" + i)) {
          if (document.getElementById("station" + i).checked) {
            if (e.data.includes("value0")) {
              document.getElementById("comment" + i).innerHTML = "Inactif";
              document.getElementById("comment" + i).style.color = "red";
              document.getElementById("station" + i).checked = false;
            }
          } else {
            if (e.data.includes("value1")) {
              document.getElementById("comment" + i).innerHTML = "Actif";
              document.getElementById("comment" + i).style.color = "green";
              document.getElementById("station" + i).checked = true;
            }
          }
        }
      }
    } else {
      console.log(e.data);
    }
  }, false)

  source.addEventListener('open', function(e) {
    console.log("Connection was opened")
  }, false)

  source.addEventListener('error', function(e) {
    if (e.readyState == EventSource.CLOSED) {
      console.log("Connection was closed")
    }
  }, false)
}
