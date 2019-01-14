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

// Gestion evenement modification du select de la temperature
function onTemperatureSelected(){
  let value = $('select#selectionTemperature').val(); // valeur du select
  if (value > 0) {
    console.log('Temperature sélectionnée : ', value);
    // updateApprovals();
  }
  else {
    document.getElementById("details").style.display = "none";
  }
}

$( document ).ready(function() {
    // On effectue une opération quand le select est modifié
    $('#selectionTemperature').on('change', onTemperatureSelected);
});
