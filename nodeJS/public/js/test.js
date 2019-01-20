// Generate url grafana to get graphics with the given start and end date
function generateGrafanaUrl(start, end, id_graph){
  let url1 = 'http://redtacos.ddns.net:3000/render/d-solo/vJW9MEzRz/all-sensors?orgId=1&';
  let url2 = '&width=1000&height=500&tz=UTC%2B01%3A00';

  // selection des valeur min et max du graphique Grafana
  let from = "from=now-" + start + "h&";
  let to = "to=now-" + end + "h&";
  let panel = "panelId=" + id_graph + "&";

  // final URL
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

var controlablesNumber;

// balise HTML pour l'affichage dynamique des systèmes contrôlables,
// leur nombre n'étant pas connu à l'avance, ni leur état (actif ou non)
var line = "<div class='controlableSystems'>";
var sublineHead = "<div id='controlableSystemHead'>";
var texte = "Selectionner un mode de fonctionnement";
var divManuel = "<div style='float:left;width:42%;text-align:right;padding-right:4%'>";
var divAuto = "<div style='float:left;width:40%;text-align:left;padding-left:4%'>";
var manuel = "Manuel</div>";
var auto = "Automatique</div>";
var selectMode = '<label class="switch"><input id="mode" type="checkbox"'
var checked = " checked";
var selectMode2 = '>' + '<div class="slider round"></div></label>';
var close = "</div></div>";

function myControlableSystems() {
  // Récupère le mode du système (manuel:0 ou auto:1)
  $.get('mode', function(data, status){
    var mode = line + texte + sublineHead + divManuel + manuel + selectMode;

    if (data == "1"){ // mode automatique
      mode += checked;
    }
    mode += selectMode2 + divAuto + auto + "<br />" + close;
    // Affiche le selecteur du mode des systèmes controlables
    document.getElementById("controlableSystemsArea").innerHTML += mode;

    // affiche tous les systèmes controlables et leurs états de fonctionnement
    // Si le mode est auto, on masque les selecteurs
    printSC();
  });
}

function printSC() {
  var sublineEngine = "<div class='controlableSystem'>";
  var system = "<div style='float:left;width:64%;text-align:right;padding-right:4%'>";

  // Récupère le nombre et l'état des systèmes contrôlables
  $.get('irrigation', function(data, status){
    // give last state of each controlable system
    json = JSON.parse(data);
    controlablesNumber = json.length; // nombre de systèmes contrôlables

    // display each contolable systems selector
    for (let i=0; i<controlablesNumber; i++){
      var name = "Irrigation sur station " + json[i].id_station;
      var checkbox = '</div><label class="switch"><input id="station' +
      json[i].id_station + '" type="checkbox">' + '<div class="slider round"></div></label>';
      var state = "<div class='comment' id='comment" + json[i].id_station + "'>Inactif</div>";
      var toPrint = line + sublineEngine + system + name + checkbox + state + close;
      document.getElementById("controlableSystemsArea").innerHTML += toPrint;
    }

    // Si le mode est auto, on masque les selecteurs des systèmes contrôlables :
    // Le daemon à la main sur l'état des systèmes,
    // les selecteurs sont non fonctionnels
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

      // if controlable system is on, we show it is on in the UI too
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

// Création du listener d'event (en attente d'event du serveur)
// On peut ainsi actualiser le status des systèmes controlables en temps réel,
// le délai de mise à jour est d'environ 5 secondes maximum (défini coté serveur)
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

$( document ).ready(function() {
  // On génère dynamiquement les contenus des selecteurs des graphes
  var item = "";
  for (let i = 1; i<=52; i++){
    item = '<option value="'+i+'">'+i+'</option>';
    $(item).appendTo("#temperatureFromWeek");
    $(item).appendTo("#temperatureToWeek");
    $(item).appendTo("#humidityFromWeek");
    $(item).appendTo("#humidityToWeek");
    $(item).appendTo("#luminosityFromWeek");
    $(item).appendTo("#luminosityToWeek");
  }
  for (let i = 1; i<=7; i++){
    item = '<option value="'+i+'">'+i+'</option>';
    $(item).appendTo("#temperatureFromDay");
    $(item).appendTo("#temperatureToDay");
    $(item).appendTo("#humidityFromDay");
    $(item).appendTo("#humidityToDay");
    $(item).appendTo("#luminosityFromDay");
    $(item).appendTo("#luminosityToDay");
  }
  for (let i = 1; i<=23; i++){
    item = '<option value="'+i+'">'+i+'</option>';
    $(item).appendTo("#temperatureFromHour");
    $(item).appendTo("#temperatureToHour");
    $(item).appendTo("#humidityFromHour");
    $(item).appendTo("#humidityToHour");
    $(item).appendTo("#luminosityFromHour");
    $(item).appendTo("#luminosityToHour");
  }

  // Affichage des systèmes contrôlables
  myControlableSystems();

  // On effectue une opération quand le select des graphes est modifié
  $('#submitButtonTemperature').click(function(){
    onGraphSelected('temperature', 'image1', '6');
  });
  $('#submitButtonHumidity').click(function(){
    onGraphSelected('humidity', 'image2', '2');
  });
  $('#submitButtonLuminosity').click(function(){
    onGraphSelected('luminosity', 'image3', '4');
  });

  // display graphique quand utilisateur clique sur la tuile temperature
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

  // display graphique quand utilisateur clique sur la tuile humidité
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

  // display graphique quand utilisateur clique sur la tuile luminosité
  var showDetails3 = false;
  $('.bouttonLuminosite').mousedown(function (e) {
    if (showDetails3) {
      document.getElementById("details3").style.display = "none";
      showDetails3 = false;
    }
    else {
      document.getElementById("details3").style.display = "block";
      showDetails3 = true;
    }
  });

  // suppression du cookie et rechargement de la page
  $('.boutonDeconnection').mousedown(function (e) {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    location.reload();
  });

  // Gestion de l'affichage des popUp metéo et settings
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
