// # document ready
$(document).ready(function() {
  if (!window.console) window.console = {};
  if (!window.console.log) window.console.log = function() {};

  slideDeactivate();
  updater.start();
});

// # updater
var updater = {
  socket: null,
  slidePage: 1,
  notes: null,
  action: null,
  retry_attempts: 0,
  max_retry_attempts: 120,

  // * start
  start: function() {
    var protocol = ("https:" == location.protocol) ? "wss:" : "ws:";
    var url = protocol + "//" + location.host + "/ws";
    updater.socket = new WebSocket(url);

    if (!Date.now) {
      Date.now = function() {
        return new Date().getTime();
      };
    }

    var timestamp = Math.floor(Date.now() / 1000);
    var sourceUrl = "https://gist.githubusercontent.com/shiraco/6351869970d3f1a6c144/raw/" + "?timestamp=" + timestamp;

    $.get(sourceUrl, function(res) {
      sourceMd = res;

    }).done(function(sourceMd) {
      sourceHtml = marked(sourceMd);
      var pages = sourceHtml.split("<hr>");
      slideTotalPages = pages.length;

      // * create notes
      updater.notes = pages.map(function(element, index, array) {
        elements = element.split("<p>???</p>");
        elements.push(""); // 末尾に追加
        elements.shift(); // 先頭削除
        note = elements.shift(); // 先頭取得

        // note = note.replace(/<p>([\s\S]?)<\/p>/g, RegExp.$1);
        // note = note.replace(/<ul>([\s\S]?)<\/ul>/g, RegExp.$1);
        note = note.replace(/<p>/g, "");
        note = note.replace(/<\/p>/g, "");
        note = note.replace(/<ul>/g, "");
        note = note.replace(/<\/ul>/g, "");
        note = note.replace(/<li>/g, "");

        notes = note.split("</li>");
        notes = notes.map(function(element, index, array) {
          return $.trim(element);
        });
        notes = notes.filter(function(e) {
          return e !== "";
        }); // 空要素削除

        return notes;
      });

      updater.showSlideNav(updater.slidePage);
      updater.showSayText();

      slideActivate();

    });

    // * socket open
    updater.socket.onopen = function() {
      console.log("onopen");
    };

    // * socket onmessage
    updater.socket.onmessage = function(event) {
      var json = JSON.parse(event.data);
      console.log("onmessage: ", json.keyCode);

      updater.retry_attempts = 0;

      updater.showMessage(updater.action);
      updater.showSlideNav(updater.slidePage);
      updater.showSayText();
    };

    // * socket close
    updater.socket.onclose = function(event) {
      console.log("onclose. reason: %s", event.reason);

      if (updater.retry_attempts < updater.max_retry_attempts) {
        // Connection has closed so try to reconnect.
        updater.retry_attempts++;
        slideDeactivate();
        updater.socket = null;
        updater.start();
        console.log("retry_attempts: ", updater.retry_attempts);

      } else {
        console.log("websocket closed by over max_retry_attempts: ", updater.retry_attempts);

      }
    };

    // * socket onerror
    updater.socket.onerror = function(event) {
      console.log("onerror");
      slideDeactivate();

    };

  },

  // * update message
  showMessage: function(message) {
    var node = $("#message");
    node.hide();
    node.text(message);
    node.fadeIn("slow");
  },

  // * update slide-nav
  showSlideNav: function(message) {
    var node = $("#slide-nav");
    node.text(message);
  },

  // * update robot-say-collection
  showSayText: function() {
    var node = $("#robot-say-collection");
    node.empty();

    disabled = !robot.enable;

    sayTexts = updater.notes[updater.slidePage - 1];
    sayTexts.forEach(function(element, index, array) {
      console.log(index + ":" + element + ", disabled:" + disabled);
      node.append("<li class='collection-item dismissable'>" +
        "  <span id='saySlideText" + index + "'>" + element + "</span>" +
        "  <button id='saySlideText" + index + "-btn' class='secondary-content btn-floating center-align keyup white-text waves-effect waves-light robot-input' onclick='animatedSayClicked(\"#saySlideText" + index + "\");'>Say</button>" +
        "</li>");
      $("#saySlideText" + index + "-btn").prop("disabled", disabled);

    });
  }

};

// # button activate & deactivate
// * activate
function slideActivate() {
  console.log("Slide activate");
  disabled = false;
  $(".slide-input").prop("disabled", disabled);
}

// * deactivate
function slideDeactivate() {
  console.log("Slide deactivate");
  disabled = true;
  $(".slide-input").prop("disabled", disabled);
}

// # button clicked
// * leftButtonClicked()
function leftButtonClicked() {
  var code = 37; // Left
  updater.action = "Previous Slide";

  if (updater.slidePage > 1) {
    updater.slidePage--;
    newCommand(code, updater.slidePage);
    updater.action = updater.action + ": " + updater.slidePage;
  }
  return false;
}

// * rightButtonClicked
function rightButtonClicked() {
  var code = 39; // Right
  updater.action = "Next Slide";

  if (updater.slidePage < slideTotalPages) {
    updater.slidePage++;
    newCommand(code, updater.slidePage);
    updater.action = updater.action + ": " + updater.slidePage;
  }
  return false;
}

// * commmon command
function newCommand(keyCode, slidePage) {
  var message = {
    keyCode: keyCode,
    slidePage: slidePage
  };

  // send command
  updater.socket.send(JSON.stringify(message));
}

// * animated say clicked
function animatedSayClicked(value) {
  var node = $(value);
  animatedSay(node.text());
  node.parent().remove();
}
