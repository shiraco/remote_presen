function sampleButtonClicked() {
    session.service("ALMemory").done(function (ALMemory) {
        console.log("ALMemory取得成功");
        ALMemory.raiseEvent("PepperQiMessaging/fromtablet", "押したね");
    });
}

var self = this;

function connect() {
    console.log("connecting");
    var robotIp = $("#ip1").val() + "." + $("#ip2").val() + "." + $("#ip3").val() + "." + $("#ip4").val();

    self.qims = new QiSession(robotIp);
	  self.qims.socket()
        .on('connect', function () {
            console.log("connected");
            self.qims.service("ALTextToSpeech").done(function (tts) {
                tts.say("接続");
            });
        })
        .on('disconnect', function () {
            console.log("disconnected");
        });
}

function say() {
    console.log("say");
	  var value = $("#sayText").val();
	  this.alTextToSpeech.say(value);
}
