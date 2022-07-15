System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, Pomelo, Pitaya, _crd;

  function _reportPossibleCrUseOfPomelo(extras) {
    _reporterNs.report("Pomelo", "./Pomelo", _context.meta, extras);
  }

  _export("Pitaya", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }, function (_unresolved_2) {
      Pomelo = _unresolved_2.Pomelo;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "966feQbgDJKVJnSFR2vhENj", "Pitaya", undefined);

      _export("Pitaya", Pitaya = class Pitaya {
        //websocket
        //回调map
        //路由map
        //请求的id,每次请求自增1
        //整个pitaya连接成功后的回调
        //step1:包装成await/async
        static async Init(host, port) {
          return new Promise((resolve, reject) => {
            this.onConnectSuccess = () => {
              resolve(true);
            };

            let url = `ws://${host}:${port}`;
            this.connector(url);
          });
        } //step2:初始化


        static connector(url) {
          this.ws = new WebSocket(url);
          this.ws.binaryType = 'arraybuffer';

          this.ws.onclose = ev => {
            console.log("websocket close", ev);
          };

          this.ws.onerror = ev => {
            console.log("websocket err", ev);
          };

          this.ws.onmessage = ev => {
            this.onMessage(ev);
          };

          this.ws.onopen = ev => {
            this.sendHandShake();
          };
        } //step3:发送handshake


        static async sendHandShake() {
          let handshakeBuffer = {
            'sys': {
              type: "pitaya_cocos",
              version: "1.0.0",
              rsa: {}
            },
            'user': {}
          };
          let msg = (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
            error: Error()
          }), Pomelo) : Pomelo).Protocol.StrEncode(JSON.stringify(handshakeBuffer));
          let pkg = (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
            error: Error()
          }), Pomelo) : Pomelo).Package.Encode((_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
            error: Error()
          }), Pomelo) : Pomelo).Package.TYPE_HANDSHAKE, msg);
          this.ws.send(pkg.buffer);
        } //step4:收到消息,分发


        static onMessage(ev) {
          let msgs = (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
            error: Error()
          }), Pomelo) : Pomelo).Package.Decode(ev.data);

          if (Array.isArray(msgs)) {
            for (let i = 0; i < msgs.length; i++) {
              let msg = msgs[i];
              this.dispatch(msg);
            }
          } else {
            this.dispatch(msgs);
          }
        }
        /**
         * step5, 解析消息分发器
         * @param msg 收到的服务器消息
         * @returns 
         */


        static dispatch(msg) {
          switch (msg.type) {
            case (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
              error: Error()
            }), Pomelo) : Pomelo).Package.TYPE_HANDSHAKE:
              {
                let data = JSON.parse((_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
                  error: Error()
                }), Pomelo) : Pomelo).Protocol.StrDecode(msg.body));
                console.log(" handshake msg.code", data.code);

                if (data.code === 501) {
                  return;
                }

                if (data.code !== 200) {
                  return;
                } //step6: handshake回应，不然服务器会断开


                let obj = (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
                  error: Error()
                }), Pomelo) : Pomelo).Package.Encode((_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
                  error: Error()
                }), Pomelo) : Pomelo).Package.TYPE_HANDSHAKE_ACK);
                this.ws.send(obj.buffer); //step7: 连接成功回调，加到step1的Promise

                if (this.onConnectSuccess) {
                  this.onConnectSuccess();
                }
              }
              break;

            case (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
              error: Error()
            }), Pomelo) : Pomelo).Package.TYPE_HEARTBEAT:
              this.heartbeat(msg.body);
              break;

            case (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
              error: Error()
            }), Pomelo) : Pomelo).Package.TYPE_DATA:
              this.onData(msg.body);
              break;

            case (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
              error: Error()
            }), Pomelo) : Pomelo).Package.TYPE_KICK:
              this.onKick(msg.body);
              break;
          }
        }

        static heartbeat(data) {}

        static onKick(data) {}

        static onData(data) {
          let msg = (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
            error: Error()
          }), Pomelo) : Pomelo).Message.Decode(data);

          switch (msg.type) {
            case (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
              error: Error()
            }), Pomelo) : Pomelo).Message.TYPE_RESPONSE:
              {
                var cb = this.callbacks.get(msg.id);
                this.callbacks.delete(msg.id);

                if (cb) {
                  cb(msg.body);
                }
              }
              break;

            case (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
              error: Error()
            }), Pomelo) : Pomelo).Message.TYPE_PUSH:
              {
                var cb = this.routeMap.get(msg.route);

                if (cb) {
                  cb(msg.body);
                }
              }
              break;
          }
        }
        /**
         * Call方法，即req-resp模式
         * @param route 路由
         * @param msg 
         * @returns 
         */


        static async Call(route, data) {
          if (!route) {
            return;
          }

          return new Promise((resolve, reject) => {
            this.reqId++;
            let type = (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
              error: Error()
            }), Pomelo) : Pomelo).Message.TYPE_REQUEST;
            let msg = (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
              error: Error()
            }), Pomelo) : Pomelo).Message.Encode(this.reqId, type, 0, route, data);
            let packet = (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
              error: Error()
            }), Pomelo) : Pomelo).Package.Encode((_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
              error: Error()
            }), Pomelo) : Pomelo).Package.TYPE_DATA, msg);
            this.ws.send(packet.buffer);
            this.callbacks.set(this.reqId, data => {
              resolve(data);
            });
          });
        }

        /**
         * Notify方法，即notify服务器，不需要收到回复消息
         * @param route 路由
         * @param data 发送服务器的数据
         * @returns 
         */
        static Notify(route, data) {
          let type = (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
            error: Error()
          }), Pomelo) : Pomelo).Message.TYPE_NOTIFY;
          let msg = (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
            error: Error()
          }), Pomelo) : Pomelo).Message.Encode(this.reqId, type, 0, route, data);
          let packet = (_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
            error: Error()
          }), Pomelo) : Pomelo).Package.Encode((_crd && Pomelo === void 0 ? (_reportPossibleCrUseOfPomelo({
            error: Error()
          }), Pomelo) : Pomelo).Package.TYPE_DATA, msg);
          this.ws.send(packet.buffer);
        }
        /**
        * Push方法，监听来自服务器的Push消息
        * @param route 路由
        * @param func 监听消息
        * @returns 
        */


        static Push(route, func) {
          if (this.routeMap.has(route)) {
            return;
          }

          this.routeMap.set(route, func);
        }

      });

      Pitaya.ws = void 0;
      Pitaya.callbacks = new Map();
      Pitaya.routeMap = new Map();
      Pitaya.reqId = 0;
      Pitaya.onConnectSuccess = null;

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=19de99937ace792ae10557cb173ce2121e06c887.js.map