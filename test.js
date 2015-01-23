/**
 * Created by talwa_000 on 15/01/15.
 */

var tessel = require('tessel'),
    http = require('http'),
    climatelib = require('climate-si7020'),
    wifi = require('wifi-cc3000'),
    Keen = require('keen.io');

// Configure instance. Only projectId and writeKey are required to send data.
var client = Keen.configure({
    projectId: "54c1334390e4bd6b11d48c14",
    writeKey: "523c232f668d9847052082df49373d11e7c8b18995541c9e83710eda605d226d0c4ea2813b57d71adba57db4771dd1bd29e4f59b7e9ada6950399923c942d426c19a4ef7e8963067d61a52b3af93355f202a3d5a3ed60a8aa24b4c06afd084c7427980c45173c0f7be0a61c0b371b075",
    readKey: "e92393535ce5c1d68cdc7c3320fb52540d0c3918347ef3650b1f86003e589997b4333727acc4c6301d967f674d804fea0d2c058aaedd3d4487f49642dddbebb0725f3ed80b1190be8534381c221452368151dafb0832b8b1b2e1ae4deea10723d8c1d5eb892efdc37e8a1b3e26bb310c",
    masterKey: "BE3328F89149B52FF49321F71AA43EF9"
});

var climate = climatelib.use(tessel.port['A']);
var wifiSettings = {
    ssid: "talwaserman 2",
    timeout: 40
};

setTimeout(function () {
    checkConnection();
}, 600);

function checkConnection () {
    if (wifi.isConnected()) {
        console.log('Connected.');
    } else {
        console.log('Connecting...');
        wifi.connect(wifiSettings, function (err, res) {
            if(err) {
                console.log('Error connecting:', err);
            }
            checkConnection();
        });
    }
}

if (wifi.isConnected())
{
    var led1 = tessel.led[0].output(1);
    var led2 = tessel.led[1].output(0);

    climate.on('ready', function () {
        console.log('Connected to si7020');

        // Loop forever
        setImmediate(function loop () {
            climate.readTemperature('C', function (err, temp) {
                climate.readHumidity(function (err, humid) {

                    var payload = {
                        'deviceid':'Device01',
                        'temperature':parseFloat(temp.toFixed(3)),
                        'humidity':parseFloat(humid.toFixed(3)) };

                    // send single event to Keen IO
                    client.addEvent("homeclimate1", payload, function(err, res) {
                        if (err) {
                            console.log("Oh no, an error!");
                        } else {
                            console.log(payload);
                        }
                    });

                    led1.toggle();
                    led2.toggle();

                    setTimeout(loop, 600);
                });
            });
        });
    });

    climate.on('error', function(err) {
        console.log('error connecting module', err);
    });

}
else
{
    console.error('This lab requires a wifi connect. See http://start.tessel.io/wifi')
}
