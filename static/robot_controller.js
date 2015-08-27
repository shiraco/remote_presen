var self = this;

// connect
function connect() {
    console.log("connecting");
    var robotIp = $("#ip1").val() + "." + $("#ip2").val() + "." + $("#ip3").val() + "." + $("#ip4").val();

    var setupIns_ = function() {
        self.qims.service("ALTextToSpeech").done(function(ins) {
            self.alTextToSpeech = ins;
        });

        self.qims.service("ALAnimatedSpeech").done(function(ins) {
            self.alAnimatedSpeech = ins;
        });

        self.qims.service("ALMotion").done(function(ins) {
            self.alMotion = ins;
        });

        self.qims.service("ALBehaviorManager").done(function(ins) {
            self.alBehavior = ins;
        });

        self.qims.service("ALAutonomousLife").done(function(ins) {
            self.alAutonomousLife = ins;
        });

        self.qims.service("ALAudioDevice").done(function(ins) {
            self.alAudioDevice = ins;
            self.alAudioDevice.getOutputVolume().done(function(val) {
                self.showAudioVolume(val);
            });
        });

        self.qims.service("ALMemory").done(function(ins) {
            self.alMemory = ins;

            // メモリ監視
            qimessagingMemorySubscribe();
        });
    }

    self.qims = new QiSession(robotIp);
    self.qims.socket()
        .on("connect", function() {
            console.log("connected");
            self.qims.service("ALTextToSpeech").done(function(tts) {
                tts.say("接続");
            });
            setupIns_();

        })
        .on("disconnect", function() {
            console.log("disconnected");
        });
}

// show volume
function showAudioVolume(val) {
    console.log(val);
    // あとからページに表示させる
    $("#pepperVolume").val(val);
}

// change volume
function changeAudioVolume() {
    var volume = $("#pepperVolume").val();
    volume = Number(volume);
    console.log(volume);
    self.alAudioDevice.setOutputVolume(volume);
    self.hello()
}

// hello
function hello() {
    console.log("hello");
    this.alAnimatedSpeech.say("はろー");
}

// say
function say() {
    console.log("say");
    var value = $("#sayText").val();
    this.alTextToSpeech.say(value);
}

// animated say
function animatedSay() {
    console.log("animated say");
    var value = $("#animatedSayText").val();
    this.alAnimatedSpeech.say(value);
}

// move
function move(to) {
    if (self.alMotion) {
        console.log("move to");
        switch (to) {
            case 0:
                self.alMotion.moveTo(0, 0, 0.5).fail(function(err){console.log(err);});
                break;

            case 1:
                self.alMotion.moveTo(0, 0, -0.5).fail(function(err){console.log(err);});
                break;

            case 2:
                self.alMotion.moveTo(0.3, 0, 0).fail(function(err){console.log(err);});
                break;

            case 3:
                self.alMotion.moveTo(-0.3, 0, 0).fail(function(err){console.log(err);});
                break;

            case 4:
                self.alMotion.moveTo(0, 0, 0).fail(function(err){console.log(err);});
                break;

        }
    }
}

// run behavior
function action(num) {
    switch (num) {
        case 0:
            self.alBehavior.stopAllBehaviors();
            break;

        case 1:
            self.alBehavior.runBehavior("animation-5ffd19/HighTouch");
            break;

        case 2:
            self.alBehavior.runBehavior("pepper_self_introduction_waist_sample/.");
            break;

    }
}

// autonomous
function autonomousSwitch(bl) {
    var status;
    if (bl)  {
        console.log("ON");
        self.alAutonomousLife.getState().done(function(val) {
            console.log(val)
        });
        self.alAutonomousLife.setState("solitary");

    } else {
        console.log("OFF");
        self.alAutonomousLife.getState().done(function(val) {
            console.log(val)
        });
        self.alAutonomousLife.setState("disabled");
    }
}

// sleep
function sleepSwitch(bl) {
    var status;
    if (bl) {
        console.log("ON");
        self.alMotion.wakeUp();

     } else {
        console.log("OFF");
        self.alMotion.rest();

    }
}

// raise event
function qimessagingMemoryEvent() {
    console.log("push!");
    self.alMemory.raiseEvent("PepperQiMessaging/Hey", "1");
}

// subscribe event
function qimessagingMemorySubscribe(){
    console.log("subscriber!");
    self.alMemory.subscriber("PepperQiMessaging/Reco").done(function(subscriber) {
        subscriber.signal.connect(toTabletHandler);
    });
}

// ?
function toTabletHandler(value) {
    console.log("PepperQiMessaging/Recoイベント発生: " + value);
    $(".memory").text(value);
}
