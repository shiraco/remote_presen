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
                buttonClicking(json["keyCode"], json["slidePage"]);
            };

            // * socket close
            updater.socket.onclose = function(event) {
                console.log("onclose. reason: %s", event.reason);

                var time = updater.generateInterval(updater.attempts);

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
// * button handler
function buttonClicking(keyCode, slidePage) {

    switch (keyCode) {
        case 37:
            moveLeft(slidePage);
            break;

        case 39:
            moveRight(slidePage);
            break;
    }

}

// * to next page
function moveRight(slidePage) {
    changePageTo(+1, slidePage);
}

// * to previous page
function moveLeft(slidePage) {
    changePageTo(-1, slidePage);
}

// * common changePageTo
function changePageTo(movePages, toPage) {
    hash = location.hash;

    if("#" == hash.charAt(0)) {
        currentPage = parseInt(hash.substring(1), 10);
        pMode = false;

        if("p" == hash.charAt(0)) {
            currentPage = parseInt(hash.substring(1), 10);
            pMode = true;
        }

    } else {
        return false;

    };

    // next = currentPage + movePages;
    var nextPage = toPage;
    var nextHash  = "#" + (pMode ? "p" : "") + nextPage;

    if (nextHash) {
        console.log("change page to: " + nextHash);
        location.hash = nextHash;

    }

    return false;

}

// # callback
var callback = function(e) {
    console.log(e.type, e);
    var text = e.type;
    var code = e.which ? e.which : e.keyCode;
    if (13 === code) {
        text += ": ENTER";
    } else {
        text += ": keycode "+ code;
    }
    console.log(text);
};
