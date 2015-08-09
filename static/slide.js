$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    console.log("ready");
    updater.start();
});

function rightButtonClicking() {
    var code = 39;  // Right
    $('#reciever').trigger(
      jQuery.Event( 'keydown', { keyCode: code, which: code } )
    );
    $('#reciever').trigger(
      jQuery.Event( 'keypress', { keyCode: code, which: code } )
    );
    $('#reciever').trigger(
      jQuery.Event( 'keyup', { keyCode: code, which: code } )
    );
    console.log("Right");
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

                // var iframe_src = "http://" + location.host + "/iframe";
                // $("#iframe").attr("src", iframe_src);
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
    },

    ping: function(){
        updater.socket.send("PING");
    }
};
