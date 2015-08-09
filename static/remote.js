$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    updater.start();
});

var updater = {
    socket: null,

    start: function() {
        var url = "ws://" + location.host + "/ws";
        updater.socket = new WebSocket(url);

        updater.socket.onmessage = function(event) {
            console.log("onmessage");

            var json = JSON.parse(event.data);
            console.log(json);
            updater.showMessage(JSON.parse(event.data)["keyCode"]);
        }
    },

    showMessage: function(message) {
        var node = $("#message");
        node.text(message);
    }
};

function newCommand(keyCode) {
    var message = { keyCode: keyCode };
    updater.socket.send(JSON.stringify(message));
}

function leftButtonClicked() {
    var code = 37;  // Left
    $('#sender').trigger(
        jQuery.Event( 'keyup', { keyCode: code, which: code } )
    );
    newCommand(code);
    return false;
}
function rightButtonClicked() {
    var code = 39;  // Right
    $('#sender').trigger(
        jQuery.Event( 'keyup', { keyCode: code, which: code } )
      );
      newCommand(code);
      return false;
}

var callback = function(e){
    console.log(e.type, e);
    var text = e.type;
    var code = e.which ? e.which : e.keyCode;
    if(13 === code){
        text += ': ENTER';
    } else {
        text += ': keycode '+code;
    }
    console.log(text);
};

$('#sender').keyup(callback);
