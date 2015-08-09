$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    console.log("ready");
    updater.start();
});

function buttonClicking(keyCode) {

  switch (keyCode){
    case 37:
      moveLeft();
      break;

    case 39:
      moveRight();
      break;
  }

}

function nextPage(movePages) {
    hash = location.hash;

    if('#' == hash.charAt(0)){
        currentPage = parseInt(hash.substring(1), 10);
        pMode = false;

        if('p' == hash.charAt(0)){
            currentPage = parseInt(hash.substring(1), 10);
            pMode = true;
        }

    } else {
        return false;

    };

    next = currentPage + movePages;

    return "#" + (pMode ? "p" : "") + next;

}

function moveRight() {
    var code = 39;  // Right

    $("#body").trigger(
        jQuery.Event( 'keydown', { keyCode: code, which: code } )
    );
    console.log("Right");

    if (page = nextPage(+1)) {

        console.log(page);
        location.hash = page;

    }

    return false;
}

function moveLeft() {
    var code = 37;  // Left

    $("#body").trigger(
        jQuery.Event( 'keydown', { keyCode: code, which: code } )
    );
    console.log("Left");

    if (page = nextPage(-1)) {

        console.log(page);
        location.hash = page;

    }

    return false;
}

var callback = function(e){
    console.log(e.type, e);
    var text = e.type;
    var code = e.which ? e.which : e.keyCode;
    if(13 === code){
        text += ': ENTER';
        rightButtonClicking(); // debug
    } else {
        text += ': keycode '+ code;
    }
    console.log(text);
};

$(document).keydown(callback);

var updater = {
    socket: null,
    attempts: 1,

    start: function() {

        if (updater.socket == null) {
            var url = "ws://" + location.host + "/ws";
            updater.socket = new WebSocket(url);

            updater.socket.onopen = function() {
                console.log("onopen");

                // reset the tries back to 1 since we have a new connection opened.
                updater.attempts = 1;

            };

            updater.socket.onmessage = function(event) {
                console.log("onmessage");

                var json = JSON.parse(event.data);
                console.log(json);

                buttonClicking(json["keyCode"]);

            };

            updater.socket.onclose = function(event){
                console.log("onclose. reason: %s", event.reason);

                var time = updater.generateInterval(updater.attempts);

                setTimeout(function(){
                    // We"ve tried to reconnect so increment the attempts by 1
                    updater.attempts++;
                    console.log("attempts: ", updater.attempts);

                    // Connection has closed so try to reconnect every 10 seconds.
                    updater.socket = null;
                    updater.start();

                }, time);
            };

            updater.socket.onerror = function(event){
                console.log("onerror");
            }
        }
    },

    generateInterval: function(k){
        // generate the interval to a random number between 0 and the max
        return Math.min(30, (Math.pow(2, k) - 1)) * 1000 * Math.random();
    }

};
