let render = function(url) {
  if (!url) console.log("ok");
  console.log(url);
  if (url.split('/')[1] === 'about')
    $('#content').load('views/about.html');
  else if (url.split('/')[1] === 'journal')
    $('#content').load('views/journal.html');
  else if (url.split('/')[1] === 'projet')
    $('#content').load('views/projet.html');
  else
    $('#content').load('views/home.html');
};
$(window).on('hashchange', function(){
  console.log(window.location.hash);
  render(decodeURI(window.location.hash));
});
render(window.location.hash);
