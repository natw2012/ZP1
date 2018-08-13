// Require Photon
const Photon = require("electron-photon");
// Lop Photon instance
console.log(Photon);


window.addEventListener("activate", function(event) {
  console.log(event);
});

window.addEventListener("load", function() {
  var componentGroup = document.getElementsByClassName("component-groups")[0];
  componentGroup.addEventListener("activate", function(event) {
    var viewSelector = event.detail.button.getAttribute("data-view");
    var btns = this.getElementsByTagName("button");
    for (var i = 0; i < btns.length; i++) {
      document.querySelector(btns[i].getAttribute("data-view")).style.display = "none";
    }
    document.querySelector(viewSelector).style.removeProperty("display");
  });
});
