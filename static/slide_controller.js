// # document ready
$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    slideDeactivate();
    $("#sender").keyup(callback);

    updater.start();
});

// # updater
var updater = {
    socket: null,
    slidePage: null,
    notes: null,
    action: null,

    // * start
    start: function() {
        var protocol = ("https:" == location.protocol) ? "wss:" : "ws:"
        var url = protocol + "//" + location.host + "/ws";
        updater.socket = new WebSocket(url);
        updater.slidePage = 1;

        if (!Date.now) {
            Date.now = function() {return new Date().getTime();}
        }

        var timestamp = Math.floor(Date.now() / 1000);
        var sourceUrl = "https://gist.githubusercontent.com/shiraco/fd363f27a5126a5e951e/raw/" + "?timestamp=" + timestamp;

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
                notes = notes.filter(function(e) {return e !== "";}); // 空要素削除

                return notes;
            });

            updater.showSlideNav(updater.slidePage);
            updater.showSayText();

            slideActivate();

        });

        // * socket onmessage
        updater.socket.onmessage = function(event) {
            var json = JSON.parse(event.data);
            console.log("onmessage: " + json["keyCode"]);

            updater.showMessage(updater.action);
            updater.showSlideNav(updater.slidePage);
            updater.showSayText();
        }
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

        sayTexts = updater.notes[updater.slidePage - 1];
        sayTexts.forEach(function(element, index, array) {
            console.log(index + ":" + element);
            node.append("<li class='collection-item dismissable'>" +
                        "  <span id='saySlideText" + index + "'>" + element + "</span>" +
                        "  <button class='secondary-content btn-floating center-align keyup white-text robot-input' onclick='animatedSay($(\"#saySlideText" + index + "\").text());'>Say</button>" +
                        "</li>")
        });
    }

};

// # callback
var callback = function(e) {
    // console.log(e.type, e);
    var text = e.type;
    var code = e.which ? e.which : e.keyCode;
    if (13 === code) {
        text += ": ENTER";

    } else {
        text += ": keycode " + code;
    }
    console.log("callback: " + text);
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
    var code = 37;  // Left
    updater.action = "Previous Slide";
    $("#sender").trigger(
        $.Event("keyup", {keyCode: code, which: code})
    );
    if (updater.slidePage > 1) {
        updater.slidePage--;
        newCommand(code, updater.slidePage);
        updater.action = updater.action + ": " + updater.slidePage;
    }
    return false;
}

// * rightButtonClicked
function rightButtonClicked() {
    var code = 39;  // Right
    updater.action = "Next Slide";
    $("#sender").trigger(
        $.Event("keyup", {keyCode: code, which: code})
    );
    if (updater.slidePage < slideTotalPages) {
        updater.slidePage++;
        newCommand(code, updater.slidePage);
        updater.action = updater.action + ": " + updater.slidePage;
    }
    return false;
}

// * commmon command
function newCommand(keyCode, slidePage) {
    var message = {keyCode: keyCode, slidePage: slidePage};

    // send command
    updater.socket.send(JSON.stringify(message));
}
