console.log("Journal");
function deroulerJournal(myId) {
  if (document.getElementById(myId).style.display === "block") {
    document.getElementById(myId).style.display = "none";
  }
  else {
    document.getElementById(myId).style.display = "block";
  }
}

function popUp(txt1, url1, txt2, url2) {
  let msg1 = txt1 + "\n\n\t" + url1 + "\n\n\n";
  let msg2 = txt2 + "\n\n\t" + url2 + "\n\n";
  window.alert(msg1 + msg2);
}
