$(window).on('load', function () {
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
