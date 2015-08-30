// # document ready
$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};

    robotDeactivate();
});

var self = this;

// # connect
function connect() {
    var robotIp = $("#ip1").val() + "." + $("#ip2").val() + "." + $("#ip3").val() + "." + $("#ip4").val();
    console.log("connecting... " + robotIp);

    // * setup
    var setupIns_ = function() {
        self.qims.service("ALTextToSpeech").done(function(ins) {
            self.alTextToSpeech = ins;
        });

        self.qims.service("ALAnimatedSpeech").done(function(ins) {
            self.alAnimatedSpeech = ins;
        });

        self.qims.service("ALMotion").done(function(ins) {
            self.alMotion = ins;
            self.alMotion.robotIsWakeUp().done(function(val) {
                self.showRobotIsWakeUp(val);
            });
        });

        self.qims.service("ALBehaviorManager").done(function(ins) {
            self.alBehavior = ins;
        });

        self.qims.service("ALAutonomousLife").done(function(ins) {
            self.alAutonomousLife = ins;
            self.alAutonomousLife.getState().done(function(val) {
                self.showAutonomousStatus(val);
            });
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

    // * robot session connect
    self.qims = new QiSession(robotIp);
    self.qims.socket()
        .on("connect", function() {
            console.log("connected");
            updater.action = "Robot connected";
            updater.showMessage(updater.action);

            self.qims.service("ALTextToSpeech").done(function(tts) {
                tts.say("接続");
            });
            setupIns_();
            robotActivate()

        })
        .on("disconnect", function() {
            console.log("disconnected");
            updater.action = "Robot disconnected";
            updater.showMessage(updater.action);
        });
}

// # robot command
// * show volume
function showAudioVolume(val) {
    console.log("volume: " + val);
    $("#volume").val(val);
}

// * change volume
function changeAudioVolume(volume) {
    console.log("change volume: " + volume);
    updater.action = "Robot change volume: " + volume;
    updater.showMessage(updater.action);

    if (self.alAudioDevice) {
        self.alAudioDevice.setOutputVolume(volume);
        self.alAudioDevice.getOutputVolume().done(function(val) {
            self.showAudioVolume(val);
        });
        self.hello()
    }
}

// * hello
function hello() {
    self.animatedSay("うん");
}

// * say
function say(value) {
    console.log("say: " + value);
    updater.action = "Robot say: " + value;
    updater.showMessage(updater.action);

    if (self.alTextToSpeech) {
        self.alTextToSpeech.say(value);
    }
}

// * animated say
function animatedSay(value) {
    console.log("animated say: " + value);
    updater.action = "Robot animated say: " + value;
    updater.showMessage(updater.action);

    if (self.alAnimatedSpeech) {
        self.alAnimatedSpeech.say(value);
    }
}

// * move
function move(to) {
    console.log("moving to:" + to);
    updater.action = "Robot move to: " + to;
    updater.showMessage(updater.action);

    if (self.alMotion) {
        switch (to) {
            case 0: // turn left
                console.log("moved to left");
                self.alMotion.moveTo(0, 0, 0.5).fail(function(err){console.log(err);});
                break;

            case 1: // turn right
                console.log("moved to right");
                self.alMotion.moveTo(0, 0, -0.5).fail(function(err){console.log(err);});
                break;

            case 2: // go straight
                console.log("moved to straight");
                self.alMotion.moveTo(0.3, 0, 0).fail(function(err){console.log(err);});
                break;

            case 3: // go back
                console.log("moved to back");
                self.alMotion.moveTo(-0.3, 0, 0).fail(function(err){console.log(err);});
                break;

            case 4: // no move
                console.log("no moved");
                self.alMotion.moveTo(0, 0, 0).fail(function(err){console.log(err);});
                break;

        }
    }
}

// * run behavior
function runBehavior(num) {
    console.log("running behavior: " + num);
    updater.action = "Robot run behavior: " + num;
    updater.showMessage(updater.action);

    if (self.alBehavior) {
        switch (num) {
            case 0:
                console.log("ran behavior: " + val);
                self.alBehavior.stopAllBehaviors();
                break;

            case 1:
                console.log("ran behavior: " + val);
                self.alBehavior.runBehavior("animation-5ffd19/HighTouch");
                break;

            case 2:
                console.log("ran behavior: " + val);
                self.alBehavior.runBehavior("pepper_self_introduction_waist_sample/.");
                break;

        }
    }
}

// * show autonomous
function showAutonomousStatus(val) {
    console.log("autonomous: " + val);

    checked = (val != "disabled")
    $("#autonomousSwitch").prop('checked', checked);

}

// * autonomous switch
function autonomousSwitch(bl) {
    console.log("autonomous chenging to: " + bl);
    updater.action = "Robot autonomous: " + bl;
    updater.showMessage(updater.action);

    if (self.alAutonomousLife) {
        if (bl)  {
            console.log("autonomous: ON");
            self.alAutonomousLife.setState("solitary");

        } else {
            console.log("autonomous: OFF");
            self.alAutonomousLife.setState("disabled");
        }

        self.alAutonomousLife.getState().done(function(val) {
            self.showAutonomousStatus(val);
        });

        self.alMotion.robotIsWakeUp().done(function(val) {
            self.showRobotIsWakeUp(val);
        });
    }

}

// * showRobotIsWakeUpp
function showRobotIsWakeUp(val) {
    console.log("robot is wakeup: " + val);
    $("#sleepSwitch").prop('checked', val);

}

// * sleep switch
function sleepSwitch(bl) {
    console.log("wakeup/sleep: " + bl);
    updater.action = "Robot wakeup/sleep: " + bl;
    updater.showMessage(updater.action);

    if (self.alMotion) {
        if (bl) {
            console.log("wakeup/sleep: wakeup");
            self.alMotion.wakeUp();

         } else {
            console.log("wakeup/sleep: sleep");
            self.alMotion.rest();

        }

        self.alMotion.robotIsWakeUp().done(function(val) {
            self.showRobotIsWakeUp(val);
        });

        self.alAutonomousLife.getState().done(function(val) {
            self.showAutonomousStatus(val);
        });
    }

}

// * raise event
function qimessagingMemoryEvent() {
    console.log("raise event: Hey");
    updater.action = "Robot raise event: " + "Hey";
    updater.showMessage(updater.action);

    if (self.alMemory) {
        self.alMemory.raiseEvent("PepperQiMessaging/Hey", "1");
    }
}

// * subscribe event
function qimessagingMemorySubscribe() {
    console.log("subscriber!");
    if (self.alMemory) {
        self.alMemory.subscriber("PepperQiMessaging/Reco").done(function(subscriber) {
            subscriber.signal.connect(toTabletHandler);
        });
    }
}

// * tablet
function toTabletHandler(value) {
    console.log("PepperQiMessaging/Recoイベント発生: " + value);
    $(".memory").text(value);
}

// # button activate & deactivate
// * activate
function robotActivate() {
    console.log("Robot activate");
    disabled = false;
    $(".robot-input").prop("disabled", disabled);
}

// * deactivate
function robotDeactivate() {
    console.log("Robot deactivate");
    disabled = true;
    $(".robot-input").prop("disabled", disabled);
}
