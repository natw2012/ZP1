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

  // var sidebarGroup = document.getElementsByClassName("sidebarGroup")[0];
  // sidebarGroup.addEventListener("activate", function (event) {
  //   var viewSelector = event.detail.button.getAttribute("data-view");
  //   var navItems = this.getElementsByTagName("nav-item");
  //   for (var i = 0; i < navItems.length; i++) {
  //     document.querySelector(navItems[i].getAttribute("data-view")).style.display = "none";
  //   }
  //   document.querySelector(viewSelector).style.removeProperty("display");
  // });

});

// NavigationItem.addEventListener("activate", function (event) {

// });