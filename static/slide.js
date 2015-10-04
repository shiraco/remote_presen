// # document ready
$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    console.log("ready");
    $(document).keydown(callback);
    updater.start();
});

// # updater
var updater = {
    socket: null,
    retry_attempts: 0,
    max_retry_attempts: 120,

    // * start
    start: function() {

        if (updater.socket == null) {
            var protocol = ("https:" == location.protocol) ? "wss:" : "ws:"
            var url = protocol + "//" + location.host + "/ws";
            updater.socket = new WebSocket(url);

            // * socket open
            updater.socket.onopen = function() {
                console.log("onopen");
            };

            // * socket onmessage
            updater.socket.onmessage = function(event) {
                var json = JSON.parse(event.data);
                console.log("onmessage: " + "{keyCode: " + json['keyCode'] + ", slidePage: " + json['slidePage'] + "}");

                // change page
                changePageTo(json["slidePage"]);
            };

            // * socket close
            updater.socket.onclose = function(event) {
                console.log("onclose. reason: %s", event.reason);

                if (updater.retry_attempts < updater.max_retry_attempts) {
                    // Connection has closed so try to reconnect.
                    updater.socket = null;
                    updater.start();
                    updater.retry_attempts++;
                    console.log("retry_attempts: ", updater.retry_attempts);

                } else {
                    console.log("websocket closed by over max_retry_attempts: ", updater.retry_attempts);

                }
            };

            // * socket onerror
            updater.socket.onerror = function(event) {
                console.log("onerror");
            }
        }
    }
};

// # slide action from client
// * common changePageTo
function changePageTo(toPage) {
    currentHash = location.hash;

    if ("#" == currentHash.charAt(0)) {

      if ("p" == currentHash.charAt(1)) {
          pMode = true;

      } else {
          pMode = false;

      }

    } else {
        return false;

    };

    var nextPage = toPage;
    var nextHash  = "#" + (pMode ? "p" : "") + nextPage;

    if (nextHash) {
        console.log("change page from: " + currentHash + " to: " + nextHash);
        location.hash = nextHash;

    }

    return false;

}

// # slide action from self
// * callback
var callback = function(e) {
    console.log(e.type, e);

    var text = e.type;
    var keyCode = e.which ? e.which : e.keyCode;
    if (13 === keyCode) {
        text += ": ENTER";
    } else {
        text += ": keycode "+ keyCode;
    }

    console.log(text);

    currentHash = location.hash;

    if ("#" == currentHash.charAt(0)) {

      if ("p" == currentHash.charAt(1)) {
          currentPage = parseInt(currentHash.substring(2), 10);

      } else {
          currentPage = parseInt(currentHash.substring(1), 10);

      }

    } else {
        return false;

    };

    // send command
    var message = {keyCode: keyCode, slidePage: currentPage};
    updater.socket.send(JSON.stringify(message));

};
