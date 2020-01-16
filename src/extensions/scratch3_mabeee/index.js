const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const axiosBase = require('axios');
const axios = axiosBase.create({
    baseURL: 'http://localhost:22222',
});

class Scratch3MaBeee {
    constructor (runtime) {
        this.runtime = runtime;
        this.mabeee = new MaBeee(1, "scratch");
        this.device_names = ["すきなMaBeee"];
    }

    getInfo () {
        return {
            id: 'mabeee',
            name: 'MaBeee',
            blocks: [
                {
                    opcode: 'setMaBeeeOn',
                    blockType: BlockType.COMMAND,
                    text: 'MaBeeeをオンにする'
                },
                {
                    opcode: 'setMaBeeeOff',
                    blockType: BlockType.COMMAND,
                    text: 'MaBeeeをオフにする'
                },
                {
                    opcode: 'setMaBeeePower',
                    blockType: BlockType.COMMAND,
                    text: 'MaBeeeのパワーを [POWER] にする',
                    arguments: {
                        POWER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                // {
                //     opcode: 'setMaBeeeOnAfterWaiting',
                //     blockType: BlockType.COMMAND,
                //     text: '[SECONDS] 後にMaBeeeをオンにする',
                //     arguments: {
                //         SECONDS: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 3
                //         }
                //     }
                // },
                // {
                //     opcode: 'setMaBeeeOffAfterWaiting',
                //     blockType: BlockType.COMMAND,
                //     text: '[SECONDS] 後にMaBeeeをオフにする',
                //     arguments: {
                //         SECONDS: {
                //             type: ArgumentType.NUMBER,
                //             defaultValue: 3
                //         }
                //     }
                // },
                {
                    opcode: 'getRssi',
                    blockType: BlockType.REPORTER,
                    text: 'でんぱのつよさ'
                },
                {
                    opcode: 'connectMaBeeeByName',
                    blockType: BlockType.COMMAND,
                    text: '[NAME] とせつぞくする',
                    arguments: {
                        NAME: {
                            type: ArgumentType.STRING,
                            menu: 'mabeeeItems'
                        }
                    }
                },
                // {
                //     opcode: 'connectMaBeee',
                //     blockType: BlockType.COMMAND,
                //     text: 'MaBeeeとせつぞくする'
                // },
                {
                    opcode: 'disconnectMaBeee',
                    blockType: BlockType.COMMAND,
                    text: 'MaBeeeとせつぞくをやめる'
                }
            ],
            menus: {
                mabeeeItems: 'getDeviceNames'
            }
        };
    }

    _shutdown() {
        this.requestMaBeeeAction('devices/' + this.mabeee.getId() + '/disconnect');
        this.requestMaBeeeAction('scan/stop');
    }

    _getStatus() {
        return {
            status: 2,
            msg: 'Ready'
        };
    }

    _wait(time) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time)
        });
    }

    setMaBeeeOn() {
        this.requestMaBeeeAction('devices/' + this.mabeee.getId() + '/set?pwm_duty=100');
    }

    setMaBeeeOff() {
        this.requestMaBeeeAction('devices/' + this.mabeee.getId() + '/set?pwm_duty=0');
    }

    setMaBeeePower(args) {
        const power = Cast.toString(args.POWER);
        if (power > 100) {
            power = 100;
        } else if (power < 0) {
            power = 0;
        }
        this.requestMaBeeeAction('devices/' + this.mabeee.getId() + '/set?pwm_duty=' + power);
    }

    setMaBeeeOnAfterWaiting(args, util) {
        const wait = Cast.toNumber(args.SECONDS);
        console.log(wait);
        var _this = this;
        // setTimeout(function() {
        //     _this.requestMaBeeeAction('devices/' + _this.mabeee.getId() + '/set?pwm_duty=100');
        //     // callback();
        // }, wait * 1000);
        // this._wait(wait * 1000).then(() => {
        //     _this.requestMaBeeeAction('devices/' + _this.mabeee.getId() + '/set?pwm_duty=100');
        // });

    }

    setMaBeeeOffAfterWaiting(args, util) {
        const wait = Cast.toNumber(args.SECONDS);
        console.log(wait);
        var _this = this;
        // setTimeout(function() {
        //     _this.requestMaBeeeAction('devices/' + _this.mabeee.getId() + '/set?pwm_duty=0');
        //     // callback();
        // }, wait * 1000);
        // this._wait(wait * 1000).then(() => {
        //     _this.requestMaBeeeAction('devices/' + _this.mabeee.getId() + '/set?pwm_duty=0');
        // });
    }

    getRssi(/* callback */) {
        // this.requestMaBeeeAction('devices/' + this.mabeee.getId() + '/update?p=rssi');
        // this.getRssiById(this.mabeee.getId(), function(rssi) {
        //     callback(parseInt(rssi, 10) * (-1));
        // });
        return axios('/devices/' + this.mabeee.getId()).then(function(response) {
            return response.data.rssi;
        });
    }

    connectMaBeee() {
        this.requestMaBeeeAction('scan/start');
        var name = "";
        var _this = this;
        setTimeout(function() {
            _this.getDevicesName(function(names) {
                if (names == "") {
                    alert("MaBeeeが見つかりませんでした。");
                } else {
                    name = prompt("以下のMaBeeeが見つかりました。接続したいMaBeeeの名前を入力してください。\n" + names);
                    _this.getIdByName(name, function(id) {
                        _this.mabeee.setId(id);
                        _this.requestMaBeeeAction('devices/' + _this.mabeee.getId() + '/connect');
                        var __this = _this;
                        setTimeout(function() {
                            __this.requestMaBeeeAction('scan/stop');
                            __this.showMaBeeeStateInAlert(__this.mabeee.getId());
                            // __this.mabeee.setState("Connected");
                        }, 100);
                    });
                }
            });
        }, 1000);
    }

    connectMaBeeeByName(args) {
        var name = Cast.toString(args.NAME);
        var _this = this;
        setTimeout(function() {
            _this.getIdByName(name, function(id) {
                _this.mabeee.setId(id);
                console.log("id: " + _this.mabeee.getId());
                _this.requestMaBeeeAction('devices/' + _this.mabeee.getId() + '/connect');
                var __this = _this;
                setTimeout(function() {
                    __this.requestMaBeeeAction('scan/stop');
                    // __this.showMaBeeeStateInAlert(__this.mabeee.getId());
                    // __this.mabeee.setState("Connected");
                }, 100);
            });
        }, 1000);
    }

    disconnectMaBeee() {
        this.requestMaBeeeAction('devices/' + this.mabeee.getId() + '/disconnect');
        // this.mabeee.setState("Disconnected");
    }

    getXHR() {
        var request;
        try {
            request = new XMLHttpRequest();
        } catch (e) {
            try {
                request = new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {
                request = new ActiveXObject('Microsoft.XMLHTTP');
            }
        }
        return request;
    }

    requestHttpGet(path, callback) {
        var request = this.getXHR();
        request.onreadystatechange = function() {
            if (request.readyState == 4) {
                if (request.status == 200) {
                    console.log(request.responseText);
                    var json = JSON.parse(request.responseText || "null");
                    callback(json);
                } else {
    //小山                alert('通信に失敗しました。MaBeeeアプリやBluetoothがオンになっているか確認してください。');
                }
            }
        };
        request.open('GET', 'http://localhost:22222/' + path, true);
        request.send(null);
        setTimeout(function() {}, 100);
    }

    requestMaBeeeAction(path) {
        this.requestHttpGet(path, function(json) {});
    }

    showMaBeeeStateInAlert(id) {
        this.requestHttpGet('devices/' + id, function(json) {
            if (json.name == null) {
                alert('接続に失敗しました。')
            } else {
                alert(json.name + 'に接続しました。');
            }
        })
    }

    getRssiById(id, callback) {
        this.requestHttpGet('devices/' + id, function(json) {
            callback(json.rssi);
        });
    }

    getIdByName(name, callback) {
        this.requestHttpGet('devices/', function(json) {
            for (var i = 0; i < json.devices.length; i++) {
                if (json.devices[i].name === name) {
                    callback(json.devices[i].id);
                }
            }
        });
    }

    getDevicesName(callback) {
        this.requestHttpGet('devices', function(json) {
            var device_names = "";
            for (var i = 0; i < json.devices.length; i++) {
                device_names += '- ' + json.devices[i].name + '\n';
            }
            callback(device_names);
        });
    }

    getDeviceNames() {
        // var device_names = [];
        var _this = this;
        // this.requestHttpGet('devices', function(json) {
        //     _this.device_names = [];
        //     for (var i = 0; i < json.devices.length; i++) {
        //         _this.device_names.push(json.devices[i].name);
        //     }
        //     // return names;
        // });
        // console.log(device_names)
        axios.get('/devices')
        .then(function (response) {
            _this.device_names = [];
            console.log(response);
            for (var i = 0; i < response.data.devices.length; i++) {
                _this.device_names.push(response.data.devices[i].name);
            }
        });
        if (this.device_names.length === 0) {
            return ['MaBeeeなし']
        } else {
            return this.device_names;
        }
    }


    getAllMaBeees(callback) {
        var mabeees = [];
        this.requestHttpGet('devices/', function(json) {
            for (var i = 0; i < json.devices.length; i++) {
                var mabeee = new MaBeee(json.devices[i].id, json.devices[i].name);
                mabeee.push(mabeee);
                callback(mabeees);
            }
        });
    }

    checkIfMaBeeeIsConnected(id, callback) {
        this.requestHttpGet('devices/', function(json) {
            for (var i = 0; i < json.devices.length; i++) {
                if (json.devices[i].id == id) {
                    callback(true);
                }
            }
        });
    }
}

var MaBeee = function(id, name) {
    this.id = id;
    this.name = name
}

MaBeee.prototype = {
    setId: function(id) {
        this.id = id;
    },
    setName: function(name) {
        this.name = name;
    },
    getId: function() {
        return this.id;
    },
    getName: function() {
        return this.name;
    }
}

module.exports = Scratch3MaBeee;