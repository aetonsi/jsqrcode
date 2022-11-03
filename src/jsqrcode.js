/*jshint esversion: 6 */

/*
 Ported to JavaScript by Lazar Laszlo 2011

 lazarsoft@gmail.com, www.lazarsoft.info

 */

/*
 *
 * Copyright 2007 ZXing authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


// COPYRIGHT/LICENSE NOTE:
// this file contains the combination of multiple files from the sotware 'jsqrcode' by LazarSoft @ https://github.com/LazarSoft/jsqrcode ,
//   plus various sections I personally created. Almost every file from the original library has been edited.
// jsqrcode's files are virtually separated within this single file by using comments indicating the START and the END of the original file.
// ***************************************************************************************************************************************************************



// ====== START OF FILE: ============================================================================================================
// init.js
// ==================================================================================================================================

(function (windowKey, window, Math, NaN, console, navigator, Array, document, Promise) {
  'use strict';
  let in_array = function (needle, haystack) {
    return (haystack.indexOf(needle) !== -1);
  };
  let isPlainObject = function (obj) {
    return obj !== null && obj instanceof Object;
  };
  let isString = function (value) {
    return typeof value === 'string';
  };
  let getScrollBarWidth = function () {
    let inner = document.createElement('p');
    inner.style.width = "100%";
    inner.style.height = "200px";

    let outer = document.createElement('div');
    outer.style.position = "absolute";
    outer.style.top = "0px";
    outer.style.left = "0px";
    outer.style.visibility = "hidden";
    outer.style.width = "200px";
    outer.style.height = "150px";
    outer.style.overflow = "hidden";
    outer.appendChild(inner);

    document.body.appendChild(outer);
    let w1 = inner.offsetWidth;
    outer.style.overflow = 'scroll';
    let w2 = inner.offsetWidth;
    if (w1 == w2)
      w2 = outer.clientWidth;

    document.body.removeChild(outer);

    return (w1 - w2);
  };
  window[windowKey] = function (constructor_options) {

    // internal vars
    let self = this,
      lzl_code = {},
      xyz_data = {},
      xyz_functions = {
        internalError: function (toalert, tolog) {
          if (toalert) {
            window.alert(toalert);
          }
          if (tolog) {
            //tolog = (Array.isArray(tolog) ? tolog.join('\n') : tolog);
            //throw new Error(tolog);
            console.error(...(Array.isArray(tolog) ? tolog : [tolog]));
          }
          if (xyz_data.technicalErrorCallback) {
            // "tolog" contains the error
            // "self" contains the object itself (so that you can call other methods)
            xyz_data.technicalErrorCallback((Array.isArray(tolog) ? tolog : [tolog]), self);
          }
        },
        publish: function (propertyName, propertyValue) {
          propertyValue = propertyValue || xyz_data[propertyName];
          return (self[propertyName] = propertyValue);
        },
        setOpts: function (options, autofill) {
          let constraints = {
            player: {
              no: {
                type: "undefined"
              },
              err: "Player not specified"
            },
            posterizePlayer: {
              yes: {
                type: "boolean"
              },
              fb: true,
              castToBool: true
            },
            success: {
              yes: {
                type: "function"
              },
              err: "Success callback not specified",
              internal_name: "successCallback"
            },
            error: {
              yes: [{
                type: "function"
              }, {
                value: null
              }],
              fb: null,
              internal_name: "errorCallback"
            },
            technicalError: {
              yes: [{
                type: "function"
              }, {
                value: null
              }],
              fb: null,
              internal_name: "technicalErrorCallback"
            },
            startScanCallback: {
              yes: [{
                type: "function"
              }, {
                value: null
              }],
              fb: null,
              internal_name: "startScanCallback"
            },
            autoStartScan: {
              yes: {
                type: "boolean"
              },
              fb: true,
              castToBool: true
            },
            autoStopScan: {
              yes: {
                type: "boolean"
              },
              fb: false,
              castToBool: true
            },
            scanInterval: {
              yes: {
                type: "number"
              },
              fb: 1000
            },
            debug: {
              yes: {
                values: [true, false, 6]
              },
              fb: false,
              castToBool: true
            },
            preferredCamera: {
              yes: [{
                type: "string"
              }, {
                value: null
              }, {
                value: void 0
              }],
              fb: null
            },
            mode: {
              yes: {
                type: "string"
              },
              fb: ""
            } // non usato
          };
          autofill = !!(autofill) ? autofill : false;

          function try_to_set_option(name, value, constraints) {
            function constrain_value(val, constraint, c2b) {
              if (!Array.isArray(constraint)) {
                constraint = [constraint];
              }

              function castToBool() {
                val = !!val;
              }
              let ok = false,
                i;
              for (i = 0; i < constraint.length && !ok; i++) {
                if (!!(constraint[i].type)) {
                  if (c2b) {
                    castToBool();
                  }
                  // type is requirested
                  ok = (typeof val) === constraint[i].type;
                } else if (!!(constraint[i].value)) {
                  if (c2b) {
                    castToBool();
                  }
                  // possible value
                  ok = val === constraint[i].value;
                } else if (!!(constraint[i].values)) {
                  // possible values
                  ok = in_array(val, constraint[i].values);
                } else {
                  // broken constraint
                  ok = false;
                }
              }
              return ok;
            }


            let ok = true,
              c2b = (!!(constraints.castToBool) ? !!constraints.castToBool : false);
            if (!!(constraints.no)) {
              if (!constrain_value(value, constraints.no, c2b)) {
                // value is NOT what's specified in constraints.no, so IT'S OK

              } else {
                ok = false;
              }
            } else if (!!(constraints.yes)) {
              if (!constrain_value(value, constraints.yes, c2b)) {
                // value is NOT what's specified in constraints.yes, so IT'S NOT OK
                ok = false;
              }
            }
            if (!ok) {
              // value was not ok
              if (!!(constraints.err)) {
                // check if Error need to be thrown
                throw constraints.err;
              } else if (!!(constraints.fb)) {
                value = constraints.fb;
                //ok = true;
              } else {
                // E.T. the Extra-Terrestrial
              }
            }
            if (ok) {
              if (!!(constraints.internal_name)) {
                // custom name
                name = constraints.internal_name;
              }
              xyz_data[name] = value;
            }

            return ok;
          }

          let opt_name, errors = [];

          if (autofill) {
            for (opt_name in constraints) {
              if (constraints.hasOwnProperty(opt_name)) {
                if (!!!(options[opt_name])) {
                  options[opt_name] = !!(constraints[opt_name].fb) ? constraints[opt_name].fb : undefined;
                }
              }
            }
          }

          for (opt_name in options) {
            if (!!(constraints[opt_name])) {
              if (!try_to_set_option(opt_name, options[opt_name], constraints[opt_name])) {
                errors.push(["error setting: ", opt_name, "=", options[opt_name]]);
              }
            } else {
              errors.push(["option not existing: ", opt_name]);
            }
          }
          if (errors.length === 0) {
            return true;
          } else {
            errors.forEach(function (err) {
              xyz_functions.internalError(false, err);
            });
            return errors;
          }
          return true;

        },
        videoConstraints: function (deviceId) {
          if (!!!deviceId) {
            return false;
          }
          let minn = Math.min(videoStreamSize.height, videoStreamSize.width);
          return {
            frameRate: {
              min: 10,
              ideal: 30
            },
            width: {
              ideal: minn
            }, //{exact: minn}, // {min: minn, ideal: minn, max: minn},
            height: {
              ideal: minn
            }, //{exact: minn}, // {min: minn, ideal: minn, max: minn},
            deviceId: {
              exact: deviceId
            }
          };
        },
        snapshot2canvas: function () {
          try {
            let context = xyz_data.snapshotCanvas.getContext('2d'),
              sizes = videoStreamSize;
            context.drawImage(
              xyz_data.player,
              ...(sizes.width > sizes.height ? [Math.floor((sizes.width - sizes.height) / 2), 0] : [0, Math.floor((sizes.height - sizes.width) / 2)]),
              (sizes.width > sizes.height ? sizes.height : sizes.width),
              (sizes.width > sizes.height ? sizes.height : sizes.width),
              0,
              0,
              xyz_data.snapshotCanvas.height,
              xyz_data.snapshotCanvas.width
            );

          } catch (e) {
            xyz_functions.internalError(false, e);
            return false;
          }
          return true;
        },
        posterize: function (nothing) {
          window.setTimeout(function () {
            let poster;
            if (nothing) {
              poster = "";
            } else {
              xyz_functions.snapshot2canvas();
              poster = xyz_data.snapshotCanvas.toDataURL("image/png", 1);
            }
            xyz_data.player.poster = poster || "";
          }, 0);
        },
        getActiveVideoDevice: function (idOnly) {
          let dev;
          idOnly = !!(idOnly) ? !!idOnly : false;
          if (mediaDevs.video.length !== 0) {
            dev = mediaDevs.video[mediaDevs.index.video];
          } else {
            dev = {
              label: "{no camera}",
              id: false
            };
            xyz_functions.internalError(false, "{no video devices}");
          }
          if (idOnly) {
            dev = dev.id;
          }
          return dev;
        },
        cycleNextVideoDevice: function () {
          if (mediaDevs.video.length === 0) {
            mediaDevs.index.video = -1;
            xyz_functions.internalError(false, "{no video devices}");
            return false;
          }
          mediaDevs.index.video = (mediaDevs.index.video === mediaDevs.video.length - 1 ? 0 : mediaDevs.index.video + 1);
          return true;
        },
        startStreamFromMediaDevice: function (audioSource, videoSource) {
          return new Promise(function (resolve, reject) {
            if (!xyz_functions.stopStreamFromMediaDevice()) {
              throw "cannot stop stream from media device";
            }
            try {
              navigator.mediaDevices.getUserMedia({
                audio: (!audioSource ? false : audioSource),
                video: (!videoSource ? false : videoSource)
              })
                .then(function (stream) {
                  resolve(stream);
                })
                .catch(function (error) {
                  xyz_functions.internalError(false, ['navigator.mediaDevices.getUserMedia error: ', error]);
                  reject();
                });
            } catch (e) {
              xyz_functions.internalError(false, e);
              reject();
            }
          });
        },
        stopStreamFromMediaDevice: function (stream) {
          stream = stream || videoStream;
          try {
            if (stream) {
              stream.getVideoTracks().forEach(function (track) {
                track.stop();
              });
              stream = null;
            }
          } catch (e) {
            xyz_functions.internalError("cannot stop stream from media device", e);
            return false;
          }
          return true;
        },
        playStreamToPlayer: function (stream, player) {
          player = player || xyz_data.player;
          if (!xyz_functions.stopStreamToPlayer(player)) {
            throw "cannot stop stream to player";
          }
          if (typeof player.srcObject === "object") {
            player.srcObject = stream;
          } else if (window.URL) { // fallback
            player.src = window.URL.createObjectURL(stream);
          } else { // death
            throw "cannot play video stream";
          }
          videoStream = stream; // make stream available to console
          return true;
        },
        stopStreamToPlayer: function (player) {
          player = player || xyz_data.player;
          player.srcObject = null;
          player.src = "";
          return true;
        },
        startScan: function (devId) {
          if (!xyz_functions.stopScan(true)) {
            throw "cannot stop previous scan";
          }
          let cameraFound = false;
          devId = !!(devId) ? devId : xyz_data.preferredCamera;
          xyz_data.preferredCamera = null;
          if (isString(devId)) {
            for (let i = 0; i < mediaDevs.video.length; i++) {
              if (mediaDevs.video[mediaDevs.index.video].id === devId) {
                cameraFound = true;
                break;
              } else {
                xyz_functions.cycleNextVideoDevice();
              }
            }
          }
          if (!cameraFound) {
            devId = xyz_functions.getActiveVideoDevice(true);
          }

          if (!devId) {
            return false;
          }
          xyz_functions.posterize(true);

          return xyz_functions.sizer(devId)
            .then(function () {
              xyz_functions.startStreamFromMediaDevice(false, xyz_functions.videoConstraints(devId))
                .then(function (stream) {
                  xyz_data.player.addEventListener('loadeddata', (function () {
                    let scanFnct = function () {
                      xyz_data.player.removeEventListener('loadeddata', scanFnct);
                      scanningInProgress = true;
                      intervalID = window.setInterval(function () {
                        // QR CODE SCAN PHASES:
                        // - snapshot to canvas
                        // - call lzl_code.decode ()
                        // - check result

                        try {
                          if (xyz_data.debug) {
                            debugger;
                          }
                          xyz_functions.snapshot2canvas();
                          let decoded = lzl_code.decode(xyz_data.snapshotCanvas, xyz_data.debug, xyz_data.mode);
                          // "decoded" contains the result
                          // "self" contains the object itself (so that you can call other methods)
                          xyz_data.successCallback(decoded, self);
                          if (xyz_data.autoStopScan) {
                            xyz_functions.stopScan();
                          }
                        } catch (e) {
                          if (xyz_data.errorCallback) {
                            // "e" contains the error
                            // "self" contains the object itself (so that you can call other methods)
                            xyz_data.errorCallback(e, self);
                          }
                        }
                      }, xyz_data.scanInterval);
                    };
                    return scanFnct;
                  })());
                  xyz_functions.playStreamToPlayer(stream);
                  scanningInProgress = true;
                })
                .catch(xyz_functions.internalError);
            });
        },
        stopScan: function (dontPosterize) {
          scanningInProgress = false;
          window.clearInterval(intervalID);
          if (xyz_data.posterizePlayer) {
            xyz_functions.posterize(dontPosterize);
          }
          return xyz_functions.stopStreamToPlayer() && xyz_functions.stopStreamFromMediaDevice();
        },
        sizer: function (videoSource) {
          let deviceId;
          if (isPlainObject(videoSource)) {
            if (isString(videoSource.deviceId)) {
              deviceId = videoSource.deviceId;
            } else if (isPlainObject(videoSource.deviceId) && !!(videoSource.deviceId.exact)) {
              deviceId = videoSource.deviceId.exact;
            }
          } else if (isString(videoSource)) {
            deviceId = videoSource;
          } else {
            deviceId = xyz_functions.getActiveVideoDevice(true);
          }
          return new Promise(function (resolve, reject) {
            navigator.mediaDevices.getUserMedia({
              audio: false,
              video: {
                deviceId: {
                  exact: deviceId
                }
              }
            })
              .then(function (stream) {
                let v = document.createElement('video');
                v.onloadedmetadata = function () {
                  videoStreamSize.height = this.videoHeight;
                  videoStreamSize.width = this.videoWidth;
                  xyz_functions.stopStreamToPlayer(v);
                  xyz_functions.stopStreamFromMediaDevice();
                  v = null; // gc

                  // resize operations
                  (function () {
                    let size_nopx = Math.min(videoStreamSize.height, videoStreamSize.width),
                      size = size_nopx + "px",
                      biggest_dimension = videoStreamSize.height > videoStreamSize.width ? "height" : "width";
                    // player
                    xyz_data.player.style.width =
                      xyz_data.player.style.height =
                      size;
                    let parentEl = xyz_data.player.parentNode;
                    if (parentEl) {
                      let parentEl_offsetTop = parentEl.offsetTop,
                        parentEl_offsetLeft = parentEl.offsetLeft,
                        parentEl_offsetHeight = parentEl.offsetHeight,
                        player_offsetHeight = xyz_data.player.offsetHeight,
                        player_offsetWidth = xyz_data.player.offsetWidth,
                        scrollbar_width = getScrollBarWidth();
                      if (biggest_dimension === "width") {
                        parentEl.scrollTop = (player_offsetHeight - parentEl_offsetHeight) / 2 + parentEl_offsetTop / 2 + scrollbar_width / 4;
                        parentEl.scrollLeft = (player_offsetWidth - parentEl.offsetWidth) / 2 + parentEl_offsetLeft / 2 + scrollbar_width / 2;
                      } else {
                        parentEl.scrollTop = (player_offsetHeight - parentEl_offsetHeight) / 2 + parentEl_offsetTop / 2 + scrollbar_width / 2;
                        parentEl.scrollLeft = (player_offsetWidth - parentEl.offsetWidth) / 2 + parentEl_offsetLeft / 2 + scrollbar_width / 4;
                      }
                      parentEl.style.overflow = xyz_data.player.style.overflow = "hidden";
                    }

                    // canvas
                    xyz_data.snapshotCanvas.style.width =
                      xyz_data.snapshotCanvas.style.height =
                      size;
                    xyz_data.snapshotCanvas.width =
                      xyz_data.snapshotCanvas.height =
                      size_nopx;
                  })();
                  resolve();
                };
                xyz_functions.playStreamToPlayer(stream, v);
              })
              .catch(reject);
          });
        }
      };
    let videoStream = null,
      videoStreamSize = {
        width: 0,
        height: 0
      },
      mediaDevs = {
        audio: [],
        video: [],
        index: {
          audio: -1,
          video: -1
        }
      },
      intervalID = null,
      scanningInProgress = false;

    // init
    (function () {
      xyz_functions.setOpts(constructor_options, true);

      // html nodes styling
      (function () {
        let objectFit = "cover",
          display = "inline-block",
          clipPath = "inset(0 0 0 0)";
        // player
        xyz_data.player.srcObject = null;
        xyz_data.player.src = "";
        xyz_data.player.muted = xyz_data.player.autoplay = !(xyz_data.player.controls = !!(xyz_data.player.width = xyz_data.player.height = 0));
        xyz_data.player.style.objectFit =
          objectFit;
        xyz_data.player.style.display =
          display;
        xyz_data.player.style.clipPath =
          xyz_data.player.style.webkitClipPath =
          xyz_data.player.style.mozClipPath =
          xyz_data.player.style.msClipPath =
          xyz_data.player.style.oClipPath =
          clipPath;
        // snapshotCanvas
        xyz_data.snapshotCanvas = document.createElement('canvas');
        xyz_data.snapshotCanvas.style.objectFit =
          objectFit;
        xyz_data.snapshotCanvas.style.display =
          "none";
        xyz_data.snapshotCanvas.style.clipPath =
          xyz_data.snapshotCanvas.style.webkitClipPath =
          xyz_data.snapshotCanvas.style.mozClipPath =
          xyz_data.snapshotCanvas.style.msClipPath =
          xyz_data.snapshotCanvas.style.oClipPath =
          clipPath;
      })();

      // GETTING CAMERA PERMISSION
      navigator.mediaDevices.getUserMedia({
        video: true
      })
        .then(function (stream) {
          // stop video stream
          if (!xyz_functions.stopStreamFromMediaDevice(stream)) {
            throw "cannot stop stream from media device";
          }

          // attach "startScanCallback" if present
          if (!!xyz_data.startScanCallback) {
            xyz_data.player.addEventListener('loadeddata', function () {
              if (!scanningInProgress) {
                return;
              }
              xyz_data.startScanCallback(self);
            });
          }

          // list media devices
          (function () {
            navigator.mediaDevices.enumerateDevices() // GET DEVICES
              .then(function (sourceInfos) {
                sourceInfos.forEach(function (sourceInfo) {
                  if (sourceInfo.kind === 'audioinput') {
                    mediaDevs.audio.push({
                      id: sourceInfo.deviceId,
                      label: sourceInfo.label || 'unknown microphone (' + sourceInfo.deviceId + ')'
                    });
                  } else if (sourceInfo.kind === 'videoinput') {
                    mediaDevs.video.push({
                      id: sourceInfo.deviceId,
                      label: sourceInfo.label || 'unknown camera (' + sourceInfo.deviceId + ')'
                    });
                  } else {
                    // console.trace('Some other kind of source: {\n', sourceInfo,'\n}');
                  }
                });

                // select first device and startScan
                (function () {
                  let x = xyz_functions.cycleNextVideoDevice();
                  let y = xyz_data.autoStartScan;
                  if (x && y) {
                    xyz_functions.startScan();
                  }
                })();
              })
              .catch(xyz_functions.internalError.args(false));
          })();

        })
        .catch(function (error) {
          xyz_functions.internalError(
            "To scan qr codes it's necessary:\n-having a camera\n-allowing the browser to use the camera\n-using https as protocol",
            ['navigator.mediaDevices.getUserMedia error: ', error]
          );
        });
    })();


    // public vars
    xyz_functions.publish("triggerError", function (errorMsg) {
      errorMsg = errorMsg || "";
      throw errorMsg;
    });
    xyz_functions.publish("scanning", function () {
      return scanningInProgress;
    });
    xyz_functions.publish("stopScan", function () {
      return xyz_functions.stopScan(...arguments);
    });
    xyz_functions.publish("startScan", function () {
      return xyz_functions.startScan(...arguments);
    });
    xyz_functions.publish("nextCamera", function (silent) {
      if (xyz_functions.cycleNextVideoDevice()) {
        if (!silent) {
          window.alert("Camera in uso: " + xyz_functions.getActiveVideoDevice().label);
        }
        if (scanningInProgress === true) {
          return xyz_functions.startScan();
        }
        return true;
      } else {
        return false;
      }

    });
    xyz_functions.publish("setOption", function (name, value, triggerStreamRestart) {
      if (!!!(triggerStreamRestart)) {
        triggerStreamRestart = true;
      }

      let result = xyz_functions.setOpts({
        [name]: value
      });

      result = (result === true && triggerStreamRestart && scanningInProgress && (result = (result && xyz_functions.startScan())));

      return result === true;
    });
    xyz_functions.publish("getOption", function (name) {
      let result = !!(xyz_data[name]) ? xyz_data[name] : undefined;
      if (!result) {
        xyz_functions.internalError(false, "error when trying to get option '" + name + "'");
      }
      return result;
    });
    xyz_functions.publish("getLastSnapshot", function () {
      return xyz_data.snapshotCanvas.toDataURL("image/png", 1);
    });
    xyz_functions.publish("getCameras", function () {
      let cameraArr = mediaDevs.video.slice(),
        activeCamera = mediaDevs.index.video;
      // put active camera first
      cameraArr = cameraArr.concat(cameraArr.splice(0, activeCamera));
      return cameraArr;
    });
    xyz_functions.publish("player");
    xyz_functions.publish("snapshotCanvas");





    // ====== END OF FILE: ==============================================================================================================
    // init.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // grid.js
    // ==================================================================================================================================



    let GridSampler = {};

    GridSampler.checkAndNudgePoints = function (image, points) {
      let width = lzl_code.width,
        height = lzl_code.height,
        x, y, offset,
        // Check and nudge points from start until we see some that are OK:
        nudged = true;
      for (offset = 0; offset < points.length && nudged; offset += 2) {
        x = Math.floor(points[offset]);
        y = Math.floor(points[offset + 1]);
        if (x < -1 || x > width || y < -1 || y > height) {
          throw "Error.checkAndNudgePoints ";
        }
        nudged = false;
        if (x == -1) {
          points[offset] = 0;
          nudged = true;
        } else if (x == width) {
          points[offset] = width - 1;
          nudged = true;
        }
        if (y == -1) {
          points[offset + 1] = 0;
          nudged = true;
        } else if (y == height) {
          points[offset + 1] = height - 1;
          nudged = true;
        }
      }
      // Check and nudge points from end:
      nudged = true;
      for (offset = points.length - 2; offset >= 0 && nudged; offset -= 2) {
        x = Math.floor(points[offset]);
        y = Math.floor(points[offset + 1]);
        if (x < -1 || x > width || y < -1 || y > height) {
          throw "Error.checkAndNudgePoints ";
        }
        nudged = false;
        if (x == -1) {
          points[offset] = 0;
          nudged = true;
        } else if (x == width) {
          points[offset] = width - 1;
          nudged = true;
        }
        if (y == -1) {
          points[offset + 1] = 0;
          nudged = true;
        } else if (y == height) {
          points[offset + 1] = height - 1;
          nudged = true;
        }
      }
    };



    GridSampler.sampleGrid3 = function (image, dimension, transform) {
      let bits = new BitMatrix(dimension),
        points = Array(dimension << 1),
        x, y;
      for (y = 0; y < dimension; y++) {
        let max = points.length,
          iValue = y + 0.5;
        for (x = 0; x < max; x += 2) {
          points[x] = (x >> 1) + 0.5;
          points[x + 1] = iValue;
        }
        transform.transformPoints1(points);
        // Quick check to see if points transformed to something inside the image;
        // sufficient to check the endpoints
        GridSampler.checkAndNudgePoints(image, points);
        try {
          for (x = 0; x < max; x += 2) {
            let xpoint = (Math.floor(points[x]) * 4) + (Math.floor(points[x + 1]) * lzl_code.width * 4),
              bit = image[Math.floor(points[x]) + lzl_code.width * Math.floor(points[x + 1])];
            lzl_code.imagedata.data[xpoint] = bit ? 255 : 0;
            lzl_code.imagedata.data[xpoint + 1] = bit ? 255 : 0;
            lzl_code.imagedata.data[xpoint + 2] = 0;
            lzl_code.imagedata.data[xpoint + 3] = 255;
            //bits[x >> 1][ y]=bit;
            if (bit)
              bits.set_Renamed(x >> 1, y);
          }
        } catch (aioobe) {
          // This feels wrong, but, sometimes if the finder patterns are misidentified, the resulting
          // transform gets "twisted" such that it maps a straight line of points to a set of points
          // whose endpoints are in bounds, but others are not. There is probably some mathematical
          // way to detect this about the transformation that I don't know yet.
          // This results in an ugly runtime exception despite our clever checks above -- can't have
          // that. We could check each point's coordinates but that feels duplicative. We settle for
          // catching and wrapping ArrayIndexOutOfBoundsException.
          throw "Error.checkAndNudgePoints";
        }
      }
      return bits;
    };

    GridSampler.sampleGridx = function (image, dimension, p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY, p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY) {
      let transform = PerspectiveTransform.quadrilateralToQuadrilateral(p1ToX, p1ToY, p2ToX, p2ToY, p3ToX, p3ToY, p4ToX, p4ToY, p1FromX, p1FromY, p2FromX, p2FromY, p3FromX, p3FromY, p4FromX, p4FromY);

      return GridSampler.sampleGrid3(image, dimension, transform);
    };


    // ====== END OF FILE: ==============================================================================================================
    // grid.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // version.js
    // ==================================================================================================================================

    function ECB(count, dataCodewords) {
      this.count = count;
      this.dataCodewords = dataCodewords;

      this.__defineGetter__("Count", function () {
        return this.count;
      });
      this.__defineGetter__("DataCodewords", function () {
        return this.dataCodewords;
      });
    }

    function ECBlocks(ecCodewordsPerBlock, ecBlocks1, ecBlocks2) {
      this.ecCodewordsPerBlock = ecCodewordsPerBlock;
      if (ecBlocks2)
        this.ecBlocks = [ecBlocks1, ecBlocks2];
      else
        this.ecBlocks = Array(ecBlocks1);

      this.__defineGetter__("ECCodewordsPerBlock", function () {
        return this.ecCodewordsPerBlock;
      });

      this.__defineGetter__("TotalECCodewords", function () {
        return this.ecCodewordsPerBlock * this.NumBlocks;
      });

      this.__defineGetter__("NumBlocks", function () {
        let total = 0,
          i;
        for (i = 0; i < this.ecBlocks.length; i++) {
          total += this.ecBlocks[i].length;
        }
        return total;
      });

      this.getECBlocks = function () {
        return this.ecBlocks;
      };
    }

    function Version(versionNumber, alignmentPatternCenters, ecBlocks1, ecBlocks2, ecBlocks3, ecBlocks4) {
      this.versionNumber = versionNumber;
      this.alignmentPatternCenters = alignmentPatternCenters;
      this.ecBlocks = [ecBlocks1, ecBlocks2, ecBlocks3, ecBlocks4];

      let total = 0,
        ecCodewords = ecBlocks1.ECCodewordsPerBlock,
        ecbArray = ecBlocks1.getECBlocks(),
        i;
      for (i = 0; i < ecbArray.length; i++) {
        let ecBlock = ecbArray[i];
        total += ecBlock.Count * (ecBlock.DataCodewords + ecCodewords);
      }
      this.totalCodewords = total;

      this.__defineGetter__("VersionNumber", function () {
        return this.versionNumber;
      });

      this.__defineGetter__("AlignmentPatternCenters", function () {
        return this.alignmentPatternCenters;
      });
      this.__defineGetter__("TotalCodewords", function () {
        return this.totalCodewords;
      });
      this.__defineGetter__("DimensionForVersion", function () {
        return 17 + 4 * this.versionNumber;
      });

      this.buildFunctionPattern = function () {
        let dimension = this.DimensionForVersion,
          bitMatrix = new BitMatrix(dimension);

        // Top left finder pattern + separator + format
        bitMatrix.setRegion(0, 0, 9, 9);
        // Top right finder pattern + separator + format
        bitMatrix.setRegion(dimension - 8, 0, 8, 9);
        // Bottom left finder pattern + separator + format
        bitMatrix.setRegion(0, dimension - 8, 9, 8);

        // Alignment patterns
        let max = this.alignmentPatternCenters.length,
          x,
          y,
          i;
        for (x = 0; x < max; x++) {
          i = this.alignmentPatternCenters[x] - 2;
          for (y = 0; y < max; y++) {
            if ((x == 0 && (y == 0 || y == max - 1)) || (x == max - 1 && y == 0)) {
              // No alignment patterns near the three finder paterns
              continue;
            }
            bitMatrix.setRegion(this.alignmentPatternCenters[y] - 2, i, 5, 5);
          }
        }

        // Vertical timing pattern
        bitMatrix.setRegion(6, 9, 1, dimension - 17);
        // Horizontal timing pattern
        bitMatrix.setRegion(9, 6, dimension - 17, 1);

        if (this.versionNumber > 6) {
          // Version info, top right
          bitMatrix.setRegion(dimension - 11, 0, 3, 6);
          // Version info, bottom left
          bitMatrix.setRegion(0, dimension - 11, 6, 3);
        }

        return bitMatrix;
      };
      this.getECBlocksForLevel = function (ecLevel) {
        return this.ecBlocks[ecLevel.ordinal()];
      };
    }

    Version.VERSION_DECODE_INFO = [0x07C94, 0x085BC, 0x09A99, 0x0A4D3, 0x0BBF6, 0x0C762, 0x0D847, 0x0E60D, 0x0F928, 0x10B78, 0x1145D, 0x12A17, 0x13532, 0x149A6, 0x15683, 0x168C9, 0x177EC, 0x18EC4, 0x191E1, 0x1AFAB, 0x1B08E, 0x1CC1A, 0x1D33F, 0x1ED75, 0x1F250, 0x209D5, 0x216F0, 0x228BA, 0x2379F, 0x24B0B, 0x2542E, 0x26A64, 0x27541, 0x28C69];

    Version.VERSIONS = buildVersions();

    Version.getVersionForNumber = function (versionNumber) {
      if (versionNumber < 1 || versionNumber > 40) {
        throw "ArgumentException";
      }
      return Version.VERSIONS[versionNumber - 1];
    };

    Version.getProvisionalVersionForDimension = function (dimension) {
      if (dimension % 4 != 1) {
        throw "Error getProvisionalVersionForDimension";
      }
      try {
        return Version.getVersionForNumber((dimension - 17) >> 2);
      } catch (iae) {
        throw "Error getVersionForNumber";
      }
    };

    Version.decodeVersionInformation = function (versionBits) {
      let bestDifference = 0xffffffff,
        bestVersion = 0,
        i;
      for (i = 0; i < Version.VERSION_DECODE_INFO.length; i++) {
        let targetVersion = Version.VERSION_DECODE_INFO[i];
        // Do the version info bits match exactly? done.
        if (targetVersion == versionBits) {
          return this.getVersionForNumber(i + 7);
        }
        // Otherwise see if this is the closest to a real version info bit string
        // we have seen so far
        let bitsDifference = FormatInformation.numBitsDiffering(versionBits, targetVersion);
        if (bitsDifference < bestDifference) {
          bestVersion = i + 7;
          bestDifference = bitsDifference;
        }
      }
      // We can tolerate up to 3 bits of error since no two version info codewords will
      // differ in less than 4 bits.
      if (bestDifference <= 3) {
        return this.getVersionForNumber(bestVersion);
      }
      // If we didn't find a close enough match, fail
      return null;
    };

    function buildVersions() {
      return [
        new Version(1, [], new ECBlocks(7, new ECB(1, 19)), new ECBlocks(10, new ECB(1, 16)), new ECBlocks(13, new ECB(1, 13)), new ECBlocks(17, new ECB(1, 9))),
        new Version(2, [6, 18], new ECBlocks(10, new ECB(1, 34)), new ECBlocks(16, new ECB(1, 28)), new ECBlocks(22, new ECB(1, 22)), new ECBlocks(28, new ECB(1, 16))),
        new Version(3, [6, 22], new ECBlocks(15, new ECB(1, 55)), new ECBlocks(26, new ECB(1, 44)), new ECBlocks(18, new ECB(2, 17)), new ECBlocks(22, new ECB(2, 13))),
        new Version(4, [6, 26], new ECBlocks(20, new ECB(1, 80)), new ECBlocks(18, new ECB(2, 32)), new ECBlocks(26, new ECB(2, 24)), new ECBlocks(16, new ECB(4, 9))),
        new Version(5, [6, 30], new ECBlocks(26, new ECB(1, 108)), new ECBlocks(24, new ECB(2, 43)), new ECBlocks(18, new ECB(2, 15), new ECB(2, 16)), new ECBlocks(22, new ECB(2, 11), new ECB(2, 12))),
        new Version(6, [6, 34], new ECBlocks(18, new ECB(2, 68)), new ECBlocks(16, new ECB(4, 27)), new ECBlocks(24, new ECB(4, 19)), new ECBlocks(28, new ECB(4, 15))),
        new Version(7, [6, 22, 38], new ECBlocks(20, new ECB(2, 78)), new ECBlocks(18, new ECB(4, 31)), new ECBlocks(18, new ECB(2, 14), new ECB(4, 15)), new ECBlocks(26, new ECB(4, 13), new ECB(1, 14))),
        new Version(8, [6, 24, 42], new ECBlocks(24, new ECB(2, 97)), new ECBlocks(22, new ECB(2, 38), new ECB(2, 39)), new ECBlocks(22, new ECB(4, 18), new ECB(2, 19)), new ECBlocks(26, new ECB(4, 14), new ECB(2, 15))),
        new Version(9, [6, 26, 46], new ECBlocks(30, new ECB(2, 116)), new ECBlocks(22, new ECB(3, 36), new ECB(2, 37)), new ECBlocks(20, new ECB(4, 16), new ECB(4, 17)), new ECBlocks(24, new ECB(4, 12), new ECB(4, 13))),
        new Version(10, [6, 28, 50], new ECBlocks(18, new ECB(2, 68), new ECB(2, 69)), new ECBlocks(26, new ECB(4, 43), new ECB(1, 44)), new ECBlocks(24, new ECB(6, 19), new ECB(2, 20)), new ECBlocks(28, new ECB(6, 15), new ECB(2, 16))),
        new Version(11, [6, 30, 54], new ECBlocks(20, new ECB(4, 81)), new ECBlocks(30, new ECB(1, 50), new ECB(4, 51)), new ECBlocks(28, new ECB(4, 22), new ECB(4, 23)), new ECBlocks(24, new ECB(3, 12), new ECB(8, 13))),
        new Version(12, [6, 32, 58], new ECBlocks(24, new ECB(2, 92), new ECB(2, 93)), new ECBlocks(22, new ECB(6, 36), new ECB(2, 37)), new ECBlocks(26, new ECB(4, 20), new ECB(6, 21)), new ECBlocks(28, new ECB(7, 14), new ECB(4, 15))),
        new Version(13, [6, 34, 62], new ECBlocks(26, new ECB(4, 107)), new ECBlocks(22, new ECB(8, 37), new ECB(1, 38)), new ECBlocks(24, new ECB(8, 20), new ECB(4, 21)), new ECBlocks(22, new ECB(12, 11), new ECB(4, 12))),
        new Version(14, [6, 26, 46, 66], new ECBlocks(30, new ECB(3, 115), new ECB(1, 116)), new ECBlocks(24, new ECB(4, 40), new ECB(5, 41)), new ECBlocks(20, new ECB(11, 16), new ECB(5, 17)), new ECBlocks(24, new ECB(11, 12), new ECB(5, 13))),
        new Version(15, [6, 26, 48, 70], new ECBlocks(22, new ECB(5, 87), new ECB(1, 88)), new ECBlocks(24, new ECB(5, 41), new ECB(5, 42)), new ECBlocks(30, new ECB(5, 24), new ECB(7, 25)), new ECBlocks(24, new ECB(11, 12), new ECB(7, 13))),
        new Version(16, [6, 26, 50, 74], new ECBlocks(24, new ECB(5, 98), new ECB(1, 99)), new ECBlocks(28, new ECB(7, 45), new ECB(3, 46)), new ECBlocks(24, new ECB(15, 19), new ECB(2, 20)), new ECBlocks(30, new ECB(3, 15), new ECB(13, 16))),
        new Version(17, [6, 30, 54, 78], new ECBlocks(28, new ECB(1, 107), new ECB(5, 108)), new ECBlocks(28, new ECB(10, 46), new ECB(1, 47)), new ECBlocks(28, new ECB(1, 22), new ECB(15, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(17, 15))),
        new Version(18, [6, 30, 56, 82], new ECBlocks(30, new ECB(5, 120), new ECB(1, 121)), new ECBlocks(26, new ECB(9, 43), new ECB(4, 44)), new ECBlocks(28, new ECB(17, 22), new ECB(1, 23)), new ECBlocks(28, new ECB(2, 14), new ECB(19, 15))),
        new Version(19, [6, 30, 58, 86], new ECBlocks(28, new ECB(3, 113), new ECB(4, 114)), new ECBlocks(26, new ECB(3, 44), new ECB(11, 45)), new ECBlocks(26, new ECB(17, 21), new ECB(4, 22)), new ECBlocks(26, new ECB(9, 13), new ECB(16, 14))),
        new Version(20, [6, 34, 62, 90], new ECBlocks(28, new ECB(3, 107), new ECB(5, 108)), new ECBlocks(26, new ECB(3, 41), new ECB(13, 42)), new ECBlocks(30, new ECB(15, 24), new ECB(5, 25)), new ECBlocks(28, new ECB(15, 15), new ECB(10, 16))),
        new Version(21, [6, 28, 50, 72, 94], new ECBlocks(28, new ECB(4, 116), new ECB(4, 117)), new ECBlocks(26, new ECB(17, 42)), new ECBlocks(28, new ECB(17, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(19, 16), new ECB(6, 17))),
        new Version(22, [6, 26, 50, 74, 98], new ECBlocks(28, new ECB(2, 111), new ECB(7, 112)), new ECBlocks(28, new ECB(17, 46)), new ECBlocks(30, new ECB(7, 24), new ECB(16, 25)), new ECBlocks(24, new ECB(34, 13))),
        new Version(23, [6, 30, 54, 74, 102], new ECBlocks(30, new ECB(4, 121), new ECB(5, 122)), new ECBlocks(28, new ECB(4, 47), new ECB(14, 48)), new ECBlocks(30, new ECB(11, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(16, 15), new ECB(14, 16))),
        new Version(24, [6, 28, 54, 80, 106], new ECBlocks(30, new ECB(6, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(6, 45), new ECB(14, 46)), new ECBlocks(30, new ECB(11, 24), new ECB(16, 25)), new ECBlocks(30, new ECB(30, 16), new ECB(2, 17))),
        new Version(25, [6, 32, 58, 84, 110], new ECBlocks(26, new ECB(8, 106), new ECB(4, 107)), new ECBlocks(28, new ECB(8, 47), new ECB(13, 48)), new ECBlocks(30, new ECB(7, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(13, 16))),
        new Version(26, [6, 30, 58, 86, 114], new ECBlocks(28, new ECB(10, 114), new ECB(2, 115)), new ECBlocks(28, new ECB(19, 46), new ECB(4, 47)), new ECBlocks(28, new ECB(28, 22), new ECB(6, 23)), new ECBlocks(30, new ECB(33, 16), new ECB(4, 17))),
        new Version(27, [6, 34, 62, 90, 118], new ECBlocks(30, new ECB(8, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(22, 45), new ECB(3, 46)), new ECBlocks(30, new ECB(8, 23), new ECB(26, 24)), new ECBlocks(30, new ECB(12, 15), new ECB(28, 16))),
        new Version(28, [6, 26, 50, 74, 98, 122], new ECBlocks(30, new ECB(3, 117), new ECB(10, 118)), new ECBlocks(28, new ECB(3, 45), new ECB(23, 46)), new ECBlocks(30, new ECB(4, 24), new ECB(31, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(31, 16))),
        new Version(29, [6, 30, 54, 78, 102, 126], new ECBlocks(30, new ECB(7, 116), new ECB(7, 117)), new ECBlocks(28, new ECB(21, 45), new ECB(7, 46)), new ECBlocks(30, new ECB(1, 23), new ECB(37, 24)), new ECBlocks(30, new ECB(19, 15), new ECB(26, 16))),
        new Version(30, [6, 26, 52, 78, 104, 130], new ECBlocks(30, new ECB(5, 115), new ECB(10, 116)), new ECBlocks(28, new ECB(19, 47), new ECB(10, 48)), new ECBlocks(30, new ECB(15, 24), new ECB(25, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(25, 16))),
        new Version(31, [6, 30, 56, 82, 108, 134], new ECBlocks(30, new ECB(13, 115), new ECB(3, 116)), new ECBlocks(28, new ECB(2, 46), new ECB(29, 47)), new ECBlocks(30, new ECB(42, 24), new ECB(1, 25)), new ECBlocks(30, new ECB(23, 15), new ECB(28, 16))),
        new Version(32, [6, 34, 60, 86, 112, 138], new ECBlocks(30, new ECB(17, 115)), new ECBlocks(28, new ECB(10, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(10, 24), new ECB(35, 25)), new ECBlocks(30, new ECB(19, 15), new ECB(35, 16))),
        new Version(33, [6, 30, 58, 86, 114, 142], new ECBlocks(30, new ECB(17, 115), new ECB(1, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(21, 47)), new ECBlocks(30, new ECB(29, 24), new ECB(19, 25)), new ECBlocks(30, new ECB(11, 15), new ECB(46, 16))),
        new Version(34, [6, 34, 62, 90, 118, 146], new ECBlocks(30, new ECB(13, 115), new ECB(6, 116)), new ECBlocks(28, new ECB(14, 46), new ECB(23, 47)), new ECBlocks(30, new ECB(44, 24), new ECB(7, 25)), new ECBlocks(30, new ECB(59, 16), new ECB(1, 17))),
        new Version(35, [6, 30, 54, 78, 102, 126, 150], new ECBlocks(30, new ECB(12, 121), new ECB(7, 122)), new ECBlocks(28, new ECB(12, 47), new ECB(26, 48)), new ECBlocks(30, new ECB(39, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(22, 15), new ECB(41, 16))),
        new Version(36, [6, 24, 50, 76, 102, 128, 154], new ECBlocks(30, new ECB(6, 121), new ECB(14, 122)), new ECBlocks(28, new ECB(6, 47), new ECB(34, 48)), new ECBlocks(30, new ECB(46, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(2, 15), new ECB(64, 16))),
        new Version(37, [6, 28, 54, 80, 106, 132, 158], new ECBlocks(30, new ECB(17, 122), new ECB(4, 123)), new ECBlocks(28, new ECB(29, 46), new ECB(14, 47)), new ECBlocks(30, new ECB(49, 24), new ECB(10, 25)), new ECBlocks(30, new ECB(24, 15), new ECB(46, 16))),
        new Version(38, [6, 32, 58, 84, 110, 136, 162], new ECBlocks(30, new ECB(4, 122), new ECB(18, 123)), new ECBlocks(28, new ECB(13, 46), new ECB(32, 47)), new ECBlocks(30, new ECB(48, 24), new ECB(14, 25)), new ECBlocks(30, new ECB(42, 15), new ECB(32, 16))),
        new Version(39, [6, 26, 54, 82, 110, 138, 166], new ECBlocks(30, new ECB(20, 117), new ECB(4, 118)), new ECBlocks(28, new ECB(40, 47), new ECB(7, 48)), new ECBlocks(30, new ECB(43, 24), new ECB(22, 25)), new ECBlocks(30, new ECB(10, 15), new ECB(67, 16))),
        new Version(40, [6, 30, 58, 86, 114, 142, 170], new ECBlocks(30, new ECB(19, 118), new ECB(6, 119)), new ECBlocks(28, new ECB(18, 47), new ECB(31, 48)), new ECBlocks(30, new ECB(34, 24), new ECB(34, 25)), new ECBlocks(30, new ECB(20, 15), new ECB(61, 16)))
      ];
    }

    // ====== END OF FILE: ==============================================================================================================
    // version.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // detector.js
    // ==================================================================================================================================


    function PerspectiveTransform(a11, a21, a31, a12, a22, a32, a13, a23, a33) {
      this.a11 = a11;
      this.a12 = a12;
      this.a13 = a13;
      this.a21 = a21;
      this.a22 = a22;
      this.a23 = a23;
      this.a31 = a31;
      this.a32 = a32;
      this.a33 = a33;
      this.transformPoints1 = function (points) {
        let max = points.length,
          a11 = this.a11,
          a12 = this.a12,
          a13 = this.a13,
          a21 = this.a21,
          a22 = this.a22,
          a23 = this.a23,
          a31 = this.a31,
          a32 = this.a32,
          a33 = this.a33;
        for (let i = 0; i < max; i += 2) {
          let x = points[i],
            y = points[i + 1],
            denominator = a13 * x + a23 * y + a33;
          points[i] = (a11 * x + a21 * y + a31) / denominator;
          points[i + 1] = (a12 * x + a22 * y + a32) / denominator;
        }
      };
      this.transformPoints2 = function (xValues, yValues) {
        let n = xValues.length;
        for (let i = 0; i < n; i++) {
          let x = xValues[i],
            y = yValues[i],
            denominator = this.a13 * x + this.a23 * y + this.a33;
          xValues[i] = (this.a11 * x + this.a21 * y + this.a31) / denominator;
          yValues[i] = (this.a12 * x + this.a22 * y + this.a32) / denominator;
        }
      };

      this.buildAdjoint = function () {
        // Adjoint is the transpose of the cofactor matrix:
        return new PerspectiveTransform(this.a22 * this.a33 - this.a23 * this.a32, this.a23 * this.a31 - this.a21 * this.a33, this.a21 * this.a32 - this.a22 * this.a31, this.a13 * this.a32 - this.a12 * this.a33, this.a11 * this.a33 - this.a13 * this.a31, this.a12 * this.a31 - this.a11 * this.a32, this.a12 * this.a23 - this.a13 * this.a22, this.a13 * this.a21 - this.a11 * this.a23, this.a11 * this.a22 - this.a12 * this.a21);
      };
      this.times = function (other) {
        return new PerspectiveTransform(this.a11 * other.a11 + this.a21 * other.a12 + this.a31 * other.a13, this.a11 * other.a21 + this.a21 * other.a22 + this.a31 * other.a23, this.a11 * other.a31 + this.a21 * other.a32 + this.a31 * other.a33, this.a12 * other.a11 + this.a22 * other.a12 + this.a32 * other.a13, this.a12 * other.a21 + this.a22 * other.a22 + this.a32 * other.a23, this.a12 * other.a31 + this.a22 * other.a32 + this.a32 * other.a33, this.a13 * other.a11 + this.a23 * other.a12 + this.a33 * other.a13, this.a13 * other.a21 + this.a23 * other.a22 + this.a33 * other.a23, this.a13 * other.a31 + this.a23 * other.a32 + this.a33 * other.a33);
      };

    }

    PerspectiveTransform.quadrilateralToQuadrilateral = function (x0, y0, x1, y1, x2, y2, x3, y3, x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p) {

      let qToS = this.quadrilateralToSquare(x0, y0, x1, y1, x2, y2, x3, y3),
        sToQ = this.squareToQuadrilateral(x0p, y0p, x1p, y1p, x2p, y2p, x3p, y3p);
      return sToQ.times(qToS);
    };

    PerspectiveTransform.squareToQuadrilateral = function (x0, y0, x1, y1, x2, y2, x3, y3) {
      let dy2 = y3 - y2,
        dy3 = y0 - y1 + y2 - y3,
        dx1,
        dx2,
        dx3,
        dy1,
        denominator,
        a13,
        a23;
      if (dy2 == 0 && dy3 == 0) {
        return new PerspectiveTransform(x1 - x0, x2 - x1, x0, y1 - y0, y2 - y1, y0, 0, 0, 1);
      } else {
        dx1 = x1 - x2;
        dx2 = x3 - x2;
        dx3 = x0 - x1 + x2 - x3;
        dy1 = y1 - y2;
        denominator = dx1 * dy2 - dx2 * dy1;
        a13 = (dx3 * dy2 - dx2 * dy3) / denominator;
        a23 = (dx1 * dy3 - dx3 * dy1) / denominator;
        return new PerspectiveTransform(x1 - x0 + a13 * x1, x3 - x0 + a23 * x3, x0, y1 - y0 + a13 * y1, y3 - y0 + a23 * y3, y0, a13, a23, 1);
      }
    };

    PerspectiveTransform.quadrilateralToSquare = function (x0, y0, x1, y1, x2, y2, x3, y3) {
      // Here, the adjoint serves as the inverse:
      return this.squareToQuadrilateral(x0, y0, x1, y1, x2, y2, x3, y3).buildAdjoint();
    };

    function DetectorResult(bits, points) {
      this.bits = bits;
      this.points = points;
    }


    function Detector(image) {
      this.image = image;
      this.resultPointCallback = null;

      this.sizeOfBlackWhiteBlackRun = function (fromX, fromY, toX, toY) {
        // Mild variant of Bresenham's algorithm;
        // see http://en.wikipedia.org/wiki/Bresenham's_line_algorithm
        let steep = Math.abs(toY - fromY) > Math.abs(toX - fromX);
        if (steep) {
          let temp = fromX;
          fromX = fromY;
          fromY = temp;
          temp = toX;
          toX = toY;
          toY = temp;
        }

        let dx = Math.abs(toX - fromX),
          dy = Math.abs(toY - fromY),
          error = -dx >> 1,
          ystep = fromY < toY ? 1 : -1,
          xstep = fromX < toX ? 1 : -1,
          state = 0; // In black pixels, looking for white, first or second time
        for (let x = fromX, y = fromY; x != toX; x += xstep) {

          let realX = steep ? y : x,
            realY = steep ? x : y;
          if (state == 1) {
            // In white pixels, looking for black
            if (this.image[realX + realY * lzl_code.width]) {
              state++;
            }
          } else {
            if (!this.image[realX + realY * lzl_code.width]) {
              state++;
            }
          }

          if (state == 3) {
            // Found black, white, black, and stumbled back onto white; done
            let diffX = x - fromX,
              diffY = y - fromY;
            return Math.sqrt((diffX * diffX + diffY * diffY));
          }
          error += dy;
          if (error > 0) {
            if (y == toY) {
              break;
            }
            y += ystep;
            error -= dx;
          }
        }
        let diffX2 = toX - fromX,
          diffY2 = toY - fromY;
        return Math.sqrt((diffX2 * diffX2 + diffY2 * diffY2));
      };


      this.sizeOfBlackWhiteBlackRunBothWays = function (fromX, fromY, toX, toY) {

        let result = this.sizeOfBlackWhiteBlackRun(fromX, fromY, toX, toY);

        // Now count other way -- don't run off image though of course
        let scale = 1,
          otherToX = fromX - (toX - fromX);
        if (otherToX < 0) {
          scale = fromX / (fromX - otherToX);
          otherToX = 0;
        } else if (otherToX >= lzl_code.width) {
          scale = (lzl_code.width - 1 - fromX) / (otherToX - fromX);
          otherToX = lzl_code.width - 1;
        }
        let otherToY = Math.floor(fromY - (toY - fromY) * scale);

        scale = 1;
        if (otherToY < 0) {
          scale = fromY / (fromY - otherToY);
          otherToY = 0;
        } else if (otherToY >= lzl_code.height) {
          scale = (lzl_code.height - 1 - fromY) / (otherToY - fromY);
          otherToY = lzl_code.height - 1;
        }
        otherToX = Math.floor(fromX + (otherToX - fromX) * scale);

        result += this.sizeOfBlackWhiteBlackRun(fromX, fromY, otherToX, otherToY);
        return result - 1; // -1 because we counted the middle pixel twice
      };



      this.calculateModuleSizeOneWay = function (pattern, otherPattern) {
        let moduleSizeEst1 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(pattern.X), Math.floor(pattern.Y), Math.floor(otherPattern.X), Math.floor(otherPattern.Y)),
          moduleSizeEst2 = this.sizeOfBlackWhiteBlackRunBothWays(Math.floor(otherPattern.X), Math.floor(otherPattern.Y), Math.floor(pattern.X), Math.floor(pattern.Y));
        if (isNaN(moduleSizeEst1)) {
          return moduleSizeEst2 / 7;
        }
        if (isNaN(moduleSizeEst2)) {
          return moduleSizeEst1 / 7;
        }
        // Average them, and divide by 7 since we've counted the width of 3 black modules,
        // and 1 white and 1 black module on either side. Ergo, divide sum by 14.
        return (moduleSizeEst1 + moduleSizeEst2) / 14;
      };


      this.calculateModuleSize = function (topLeft, topRight, bottomLeft) {
        // Take the average
        return (this.calculateModuleSizeOneWay(topLeft, topRight) + this.calculateModuleSizeOneWay(topLeft, bottomLeft)) / 2.0;
      };

      this.distance = function (pattern1, pattern2) {
        let xDiff = pattern1.X - pattern2.X,
          yDiff = pattern1.Y - pattern2.Y;
        return Math.sqrt((xDiff * xDiff + yDiff * yDiff));
      };
      this.computeDimension = function (topLeft, topRight, bottomLeft, moduleSize) {

        let tltrCentersDimension = Math.round(this.distance(topLeft, topRight) / moduleSize),
          tlblCentersDimension = Math.round(this.distance(topLeft, bottomLeft) / moduleSize),
          dimension = ((tltrCentersDimension + tlblCentersDimension) >> 1) + 7;
        switch (dimension & 0x03) {

          // mod 4
          case 0:
            dimension++;
            break;
          // 1? do nothing

          case 2:
            dimension--;
            break;

          case 3:
            throw "Error";
        }
        return dimension;
      };

      this.findAlignmentInRegion = function (overallEstModuleSize, estAlignmentX, estAlignmentY, allowanceFactor) {
        // Look for an alignment pattern (3 modules in size) around where it
        // should be
        let allowance = Math.floor(allowanceFactor * overallEstModuleSize),
          alignmentAreaLeftX = Math.max(0, estAlignmentX - allowance),
          alignmentAreaRightX = Math.min(lzl_code.width - 1, estAlignmentX + allowance);
        if (alignmentAreaRightX - alignmentAreaLeftX < overallEstModuleSize * 3) {
          throw "Error";
        }

        let alignmentAreaTopY = Math.max(0, estAlignmentY - allowance),
          alignmentAreaBottomY = Math.min(lzl_code.height - 1, estAlignmentY + allowance);

        let alignmentFinder = new AlignmentPatternFinder(this.image, alignmentAreaLeftX, alignmentAreaTopY, alignmentAreaRightX - alignmentAreaLeftX, alignmentAreaBottomY - alignmentAreaTopY, overallEstModuleSize, this.resultPointCallback);
        return alignmentFinder.find();
      };

      this.createTransform = function (topLeft, topRight, bottomLeft, alignmentPattern, dimension) {
        let dimMinusThree = dimension - 3.5,
          bottomRightX,
          bottomRightY,
          sourceBottomRightX,
          sourceBottomRightY;
        if (alignmentPattern != null) {
          bottomRightX = alignmentPattern.X;
          bottomRightY = alignmentPattern.Y;
          sourceBottomRightX = sourceBottomRightY = dimMinusThree - 3;
        } else {
          // Don't have an alignment pattern, just make up the bottom-right point
          bottomRightX = (topRight.X - topLeft.X) + bottomLeft.X;
          bottomRightY = (topRight.Y - topLeft.Y) + bottomLeft.Y;
          sourceBottomRightX = sourceBottomRightY = dimMinusThree;
        }

        let transform = PerspectiveTransform.quadrilateralToQuadrilateral(3.5, 3.5, dimMinusThree, 3.5, sourceBottomRightX, sourceBottomRightY, 3.5, dimMinusThree, topLeft.X, topLeft.Y, topRight.X, topRight.Y, bottomRightX, bottomRightY, bottomLeft.X, bottomLeft.Y);

        return transform;
      };

      this.sampleGrid = function (image, transform, dimension) {

        let sampler = GridSampler;
        return sampler.sampleGrid3(image, dimension, transform);
      };

      this.processFinderPatternInfo = function (info) {

        let topLeft = info.TopLeft,
          topRight = info.TopRight,
          bottomLeft = info.BottomLeft,
          moduleSize = this.calculateModuleSize(topLeft, topRight, bottomLeft);
        if (moduleSize < 1) {
          throw "Error";
        }
        let dimension = this.computeDimension(topLeft, topRight, bottomLeft, moduleSize),
          provisionalVersion = Version.getProvisionalVersionForDimension(dimension),
          modulesBetweenFPCenters = provisionalVersion.DimensionForVersion - 7,
          alignmentPattern = null;
        // Anything above version 1 has an alignment pattern
        if (provisionalVersion.AlignmentPatternCenters.length > 0) {

          // Guess where a "bottom right" finder pattern would have been
          let bottomRightX = topRight.X - topLeft.X + bottomLeft.X,
            bottomRightY = topRight.Y - topLeft.Y + bottomLeft.Y,
            // Estimate that alignment pattern is closer by 3 modules
            // from "bottom right" to known top left location
            correctionToTopLeft = 1 - 3 / modulesBetweenFPCenters,
            estAlignmentX = Math.floor(topLeft.X + correctionToTopLeft * (bottomRightX - topLeft.X)),
            estAlignmentY = Math.floor(topLeft.Y + correctionToTopLeft * (bottomRightY - topLeft.Y));

          // Kind of arbitrary -- expand search radius before giving up
          for (let i = 4; i <= 16; i <<= 1) {
            //try
            //{
            alignmentPattern = this.findAlignmentInRegion(moduleSize, estAlignmentX, estAlignmentY, i);
            break;
            //}
            //catch (re)
            //{
            // try next round
            //}
          }
          // If we didn't find alignment pattern... well try anyway without it
        }

        let transform = this.createTransform(topLeft, topRight, bottomLeft, alignmentPattern, dimension),
          bits = this.sampleGrid(this.image, transform, dimension),
          points;
        if (alignmentPattern == null) {
          points = [bottomLeft, topLeft, topRight];
        } else {
          points = [bottomLeft, topLeft, topRight, alignmentPattern];
        }
        return new DetectorResult(bits, points);
      };



      this.detect = function () {
        let info = (new FinderPatternFinder()).findFinderPattern(this.image);

        return this.processFinderPatternInfo(info);
      };
    }

    // ====== END OF FILE: ==============================================================================================================
    // detector.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // formatinf.js
    // ==================================================================================================================================


    let FORMAT_INFO_MASK_QR = 0x5412,
      FORMAT_INFO_DECODE_LOOKUP = [
        [0x5412, 0x00],
        [0x5125, 0x01],
        [0x5E7C, 0x02],
        [0x5B4B, 0x03],
        [0x45F9, 0x04],
        [0x40CE, 0x05],
        [0x4F97, 0x06],
        [0x4AA0, 0x07],
        [0x77C4, 0x08],
        [0x72F3, 0x09],
        [0x7DAA, 0x0A],
        [0x789D, 0x0B],
        [0x662F, 0x0C],
        [0x6318, 0x0D],
        [0x6C41, 0x0E],
        [0x6976, 0x0F],
        [0x1689, 0x10],
        [0x13BE, 0x11],
        [0x1CE7, 0x12],
        [0x19D0, 0x13],
        [0x0762, 0x14],
        [0x0255, 0x15],
        [0x0D0C, 0x16],
        [0x083B, 0x17],
        [0x355F, 0x18],
        [0x3068, 0x19],
        [0x3F31, 0x1A],
        [0x3A06, 0x1B],
        [0x24B4, 0x1C],
        [0x2183, 0x1D],
        [0x2EDA, 0x1E],
        [0x2BED, 0x1F]
      ],
      BITS_SET_IN_HALF_BYTE = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];


    function FormatInformation(formatInfo) {
      this.errorCorrectionLevel = ErrorCorrectionLevel.forBits((formatInfo >> 3) & 0x03);
      this.dataMask = (formatInfo & 0x07);

      this.__defineGetter__("ErrorCorrectionLevel", function () {
        return this.errorCorrectionLevel;
      });
      this.__defineGetter__("DataMask", function () {
        return this.dataMask;
      });
      this.GetHashCode = function () {
        return (this.errorCorrectionLevel.ordinal() << 3) | this.dataMask;
      };
      this.Equals = function (o) {
        let other = o;
        return this.errorCorrectionLevel == other.errorCorrectionLevel && this.dataMask == other.dataMask;
      };
    }

    FormatInformation.numBitsDiffering = function (a, b) {
      a ^= b; // a now has a 1 bit exactly where its bit differs with b's
      // Count bits set quickly with a series of lookups:
      return BITS_SET_IN_HALF_BYTE[a & 0x0F] + BITS_SET_IN_HALF_BYTE[(lzl_code.URShift(a, 4) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(lzl_code.URShift(a, 8) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(lzl_code.URShift(a, 12) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(lzl_code.URShift(a, 16) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(lzl_code.URShift(a, 20) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(lzl_code.URShift(a, 24) & 0x0F)] + BITS_SET_IN_HALF_BYTE[(lzl_code.URShift(a, 28) & 0x0F)];
    };

    FormatInformation.decodeFormatInformation = function (maskedFormatInfo) {
      let formatInfo = FormatInformation.doDecodeFormatInformation(maskedFormatInfo);
      if (formatInfo != null) {
        return formatInfo;
      }
      // Should return null, but, some QR codes apparently
      // do not mask this info. Try again by actually masking the pattern
      // first
      return FormatInformation.doDecodeFormatInformation(maskedFormatInfo ^ FORMAT_INFO_MASK_QR);
    };
    FormatInformation.doDecodeFormatInformation = function (maskedFormatInfo) {
      // Find the int in FORMAT_INFO_DECODE_LOOKUP with fewest bits differing
      let bestDifference = 0xffffffff,
        bestFormatInfo = 0;
      for (let i = 0; i < FORMAT_INFO_DECODE_LOOKUP.length; i++) {
        let decodeInfo = FORMAT_INFO_DECODE_LOOKUP[i],
          targetInfo = decodeInfo[0];
        if (targetInfo == maskedFormatInfo) {
          // Found an exact match
          return new FormatInformation(decodeInfo[1]);
        }
        let bitsDifference = this.numBitsDiffering(maskedFormatInfo, targetInfo);
        if (bitsDifference < bestDifference) {
          bestFormatInfo = decodeInfo[1];
          bestDifference = bitsDifference;
        }
      }
      // Hamming distance of the 32 masked codes is 7, by construction, so <= 3 bits
      // differing means we found a match
      if (bestDifference <= 3) {
        return new FormatInformation(bestFormatInfo);
      }
      return null;
    };



    // ====== END OF FILE: ==============================================================================================================
    // formatinf.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // errorlevel.js
    // ==================================================================================================================================


    function ErrorCorrectionLevel(ordinal, bits, name) {
      this.ordinal_Renamed_Field = ordinal;
      this.bits = bits;
      this.name = name;
      this.__defineGetter__("Bits", function () {
        return this.bits;
      });
      this.__defineGetter__("Name", function () {
        return this.name;
      });
      this.ordinal = function () {
        return this.ordinal_Renamed_Field;
      };
    }

    ErrorCorrectionLevel.forBits = function (bits) {
      if (bits < 0 || bits >= FOR_BITS.length) {
        throw "ArgumentException";
      }
      return FOR_BITS[bits];
    };

    let L = new ErrorCorrectionLevel(0, 0x01, "L"),
      M = new ErrorCorrectionLevel(1, 0x00, "M"),
      Q = new ErrorCorrectionLevel(2, 0x03, "Q"),
      H = new ErrorCorrectionLevel(3, 0x02, "H"),
      FOR_BITS = [M, L, H, Q];


    // ====== END OF FILE: ==============================================================================================================
    // errorlevel.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // bitmat.js
    // ==================================================================================================================================


    function BitMatrix(width, height) {
      if (!height)
        height = width;
      if (width < 1 || height < 1) {
        throw "Both dimensions must be greater than 0";
      }
      this.width = width;
      this.height = height;
      let rowSize = width >> 5;
      if ((width & 0x1f) != 0) {
        rowSize++;
      }
      this.rowSize = rowSize;
      this.bits = Array(rowSize * height);
      for (let i = 0; i < this.bits.length; i++)
        this.bits[i] = 0;

      this.__defineGetter__("Width", function () {
        return this.width;
      });
      this.__defineGetter__("Height", function () {
        return this.height;
      });
      this.__defineGetter__("Dimension", function () {
        if (this.width != this.height) {
          throw "Can't call getDimension() on a non-square matrix";
        }
        return this.width;
      });

      this.get_Renamed = function (x, y) {
        let offset = y * this.rowSize + (x >> 5);
        return ((lzl_code.URShift(this.bits[offset], (x & 0x1f))) & 1) != 0;
      };
      this.set_Renamed = function (x, y) {
        let offset = y * this.rowSize + (x >> 5);
        this.bits[offset] |= 1 << (x & 0x1f);
      };
      this.flip = function (x, y) {
        let offset = y * this.rowSize + (x >> 5);
        this.bits[offset] ^= 1 << (x & 0x1f);
      };
      this.clear = function () {
        let max = this.bits.length;
        for (let i = 0; i < max; i++) {
          this.bits[i] = 0;
        }
      };
      this.setRegion = function (left, top, width, height) {
        if (top < 0 || left < 0) {
          throw "Left and top must be nonnegative";
        }
        if (height < 1 || width < 1) {
          throw "Height and width must be at least 1";
        }
        let right = left + width,
          bottom = top + height;
        if (bottom > this.height || right > this.width) {
          throw "The region must fit inside the matrix";
        }
        for (let y = top; y < bottom; y++) {
          let offset = y * this.rowSize;
          for (let x = left; x < right; x++) {
            this.bits[offset + (x >> 5)] |= 1 << (x & 0x1f);
          }
        }
      };
    }

    // ====== END OF FILE: ==============================================================================================================
    // bitmat.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // datablock.js
    // ==================================================================================================================================


    function DataBlock(numDataCodewords, codewords) {
      this.numDataCodewords = numDataCodewords;
      this.codewords = codewords;

      this.__defineGetter__("NumDataCodewords", function () {
        return this.numDataCodewords;
      });
      this.__defineGetter__("Codewords", function () {
        return this.codewords;
      });
    }

    DataBlock.getDataBlocks = function (rawCodewords, version, ecLevel) {
      let i, j;

      if (rawCodewords.length != version.TotalCodewords) {
        throw "ArgumentException";
      }

      // Figure out the number and size of data blocks used by this version and
      // error correction level
      let ecBlocks = version.getECBlocksForLevel(ecLevel),
        // First count the total number of data blocks
        totalBlocks = 0,
        ecBlockArray = ecBlocks.getECBlocks();
      for (i = 0; i < ecBlockArray.length; i++) {
        totalBlocks += ecBlockArray[i].Count;
      }

      // Now establish DataBlocks of the appropriate size and number of data codewords
      let result = Array(totalBlocks),
        numResultBlocks = 0;
      for (j = 0; j < ecBlockArray.length; j++) {
        let ecBlock = ecBlockArray[j];
        for (i = 0; i < ecBlock.Count; i++) {
          let numDataCodewords = ecBlock.DataCodewords,
            numBlockCodewords = ecBlocks.ECCodewordsPerBlock + numDataCodewords;
          result[numResultBlocks++] = new DataBlock(numDataCodewords, Array(numBlockCodewords));
        }
      }

      // All blocks have the same amount of data, except that the last n
      // (where n may be 0) have 1 more byte. Figure out where these start.
      let shorterBlocksTotalCodewords = result[0].codewords.length,
        longerBlocksStartAt = result.length - 1;
      while (longerBlocksStartAt >= 0) {
        let numCodewords = result[longerBlocksStartAt].codewords.length;
        if (numCodewords == shorterBlocksTotalCodewords) {
          break;
        }
        longerBlocksStartAt--;
      }
      longerBlocksStartAt++;

      let shorterBlocksNumDataCodewords = shorterBlocksTotalCodewords - ecBlocks.ECCodewordsPerBlock,
        // The last elements of result may be 1 element longer;
        // first fill out as many elements as all of them have
        rawCodewordsOffset = 0;
      for (i = 0; i < shorterBlocksNumDataCodewords; i++) {
        for (j = 0; j < numResultBlocks; j++) {
          result[j].codewords[i] = rawCodewords[rawCodewordsOffset++];
        }
      }
      // Fill out the last data block in the longer ones
      for (j = longerBlocksStartAt; j < numResultBlocks; j++) {
        result[j].codewords[shorterBlocksNumDataCodewords] = rawCodewords[rawCodewordsOffset++];
      }
      // Now add in error correction blocks
      let max = result[0].codewords.length;
      for (i = shorterBlocksNumDataCodewords; i < max; i++) {
        for (j = 0; j < numResultBlocks; j++) {
          let iOffset = j < longerBlocksStartAt ? i : i + 1;
          result[j].codewords[iOffset] = rawCodewords[rawCodewordsOffset++];
        }
      }
      return result;
    };


    // ====== END OF FILE: ==============================================================================================================
    // datablock.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // bmparser.js
    // ==================================================================================================================================

    function BitMatrixParser(bitMatrix) {
      let dimension = bitMatrix.Dimension;
      if (dimension < 21 || (dimension & 0x03) != 1) {
        throw "Error BitMatrixParser";
      }
      this.bitMatrix = bitMatrix;
      this.parsedVersion = null;
      this.parsedFormatInfo = null;

      this.copyBit = function (i, j, versionBits) {
        return this.bitMatrix.get_Renamed(i, j) ? (versionBits << 1) | 0x1 : versionBits << 1;
      };

      this.readFormatInformation = function () {
        let i, j;
        if (this.parsedFormatInfo != null) {
          return this.parsedFormatInfo;
        }

        // Read top-left format info bits
        let formatInfoBits = 0;
        for (i = 0; i < 6; i++) {
          formatInfoBits = this.copyBit(i, 8, formatInfoBits);
        }
        // .. and skip a bit in the timing pattern ...
        formatInfoBits = this.copyBit(7, 8, formatInfoBits);
        formatInfoBits = this.copyBit(8, 8, formatInfoBits);
        formatInfoBits = this.copyBit(8, 7, formatInfoBits);
        // .. and skip a bit in the timing pattern ...
        for (j = 5; j >= 0; j--) {
          formatInfoBits = this.copyBit(8, j, formatInfoBits);
        }

        this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);
        if (this.parsedFormatInfo != null) {
          return this.parsedFormatInfo;
        }

        // Hmm, failed. Try the top-right/bottom-left pattern
        let dimension = this.bitMatrix.Dimension;
        formatInfoBits = 0;
        let iMin = dimension - 8;
        for (i = dimension - 1; i >= iMin; i--) {
          formatInfoBits = this.copyBit(i, 8, formatInfoBits);
        }
        for (j = dimension - 7; j < dimension; j++) {
          formatInfoBits = this.copyBit(8, j, formatInfoBits);
        }

        this.parsedFormatInfo = FormatInformation.decodeFormatInformation(formatInfoBits);
        if (this.parsedFormatInfo != null) {
          return this.parsedFormatInfo;
        }
        throw "Error readFormatInformation";
      };
      this.readVersion = function () {
        let i, j;

        if (this.parsedVersion != null) {
          return this.parsedVersion;
        }

        let dimension = this.bitMatrix.Dimension;

        let provisionalVersion = (dimension - 17) >> 2;
        if (provisionalVersion <= 6) {
          return Version.getVersionForNumber(provisionalVersion);
        }

        // Read top-right version info: 3 wide by 6 tall
        let versionBits = 0,
          ijMin = dimension - 11;
        for (j = 5; j >= 0; j--) {
          for (i = dimension - 9; i >= ijMin; i--) {
            versionBits = this.copyBit(i, j, versionBits);
          }
        }

        this.parsedVersion = Version.decodeVersionInformation(versionBits);
        if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension) {
          return this.parsedVersion;
        }

        // Hmm, failed. Try bottom left: 6 wide by 3 tall
        versionBits = 0;
        for (i = 5; i >= 0; i--) {
          for (j = dimension - 9; j >= ijMin; j--) {
            versionBits = this.copyBit(i, j, versionBits);
          }
        }

        this.parsedVersion = Version.decodeVersionInformation(versionBits);
        if (this.parsedVersion != null && this.parsedVersion.DimensionForVersion == dimension) {
          return this.parsedVersion;
        }
        throw "Error readVersion";
      };
      this.readCodewords = function () {

        let formatInfo = this.readFormatInformation(),
          version = this.readVersion(),
          // Get the data mask for the format used in this QR Code. This will exclude
          // some bits from reading as we wind through the bit matrix.
          dataMask = DataMask.forReference(formatInfo.DataMask),
          dimension = this.bitMatrix.Dimension;
        dataMask.unmaskBitMatrix(this.bitMatrix, dimension);

        let functionPattern = version.buildFunctionPattern(),
          readingUp = true,
          result = Array(version.TotalCodewords),
          resultOffset = 0,
          currentByte = 0,
          bitsRead = 0;
        // Read columns in pairs, from right to left
        for (let j = dimension - 1; j > 0; j -= 2) {
          if (j == 6) {
            // Skip whole column with vertical alignment pattern;
            // saves time and makes the other code proceed more cleanly
            j--;
          }
          // Read alternatingly from bottom to top then top to bottom
          for (let count = 0; count < dimension; count++) {
            let i = readingUp ? dimension - 1 - count : count;
            for (let col = 0; col < 2; col++) {
              // Ignore bits covered by the function pattern
              if (!functionPattern.get_Renamed(j - col, i)) {
                // Read a bit
                bitsRead++;
                currentByte <<= 1;
                if (this.bitMatrix.get_Renamed(j - col, i)) {
                  currentByte |= 1;
                }
                // If we've made a whole byte, save it off
                if (bitsRead == 8) {
                  result[resultOffset++] = currentByte;
                  bitsRead = 0;
                  currentByte = 0;
                }
              }
            }
          }
          readingUp ^= true; // readingUp = !readingUp; // switch directions
        }
        if (resultOffset != version.TotalCodewords) {
          throw "Error readCodewords";
        }
        return result;
      };
    }

    // ====== END OF FILE: ==============================================================================================================
    // bmparser.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // datamask.js
    // ==================================================================================================================================



    let DataMask = {};

    DataMask.forReference = function (reference) {
      if (reference < 0 || reference > 7) {
        throw "System.ArgumentException";
      }
      return DataMask.DATA_MASKS[reference];
    };

    function DataMask000() {
      this.unmaskBitMatrix = function (bits, dimension) {
        for (let i = 0; i < dimension; i++) {
          for (let j = 0; j < dimension; j++) {
            if (this.isMasked(i, j)) {
              bits.flip(j, i);
            }
          }
        }
      };
      this.isMasked = function (i, j) {
        return ((i + j) & 0x01) == 0;
      };
    }

    function DataMask001() {
      this.unmaskBitMatrix = function (bits, dimension) {
        for (let i = 0; i < dimension; i++) {
          for (let j = 0; j < dimension; j++) {
            if (this.isMasked(i, j)) {
              bits.flip(j, i);
            }
          }
        }
      };
      this.isMasked = function (i, j) {
        return (i & 0x01) == 0;
      };
    }

    function DataMask010() {
      this.unmaskBitMatrix = function (bits, dimension) {
        for (let i = 0; i < dimension; i++) {
          for (let j = 0; j < dimension; j++) {
            if (this.isMasked(i, j)) {
              bits.flip(j, i);
            }
          }
        }
      };
      this.isMasked = function (i, j) {
        return j % 3 == 0;
      };
    }

    function DataMask011() {
      this.unmaskBitMatrix = function (bits, dimension) {
        for (let i = 0; i < dimension; i++) {
          for (let j = 0; j < dimension; j++) {
            if (this.isMasked(i, j)) {
              bits.flip(j, i);
            }
          }
        }
      };
      this.isMasked = function (i, j) {
        return (i + j) % 3 == 0;
      };
    }

    function DataMask100() {
      this.unmaskBitMatrix = function (bits, dimension) {
        for (let i = 0; i < dimension; i++) {
          for (let j = 0; j < dimension; j++) {
            if (this.isMasked(i, j)) {
              bits.flip(j, i);
            }
          }
        }
      };
      this.isMasked = function (i, j) {
        return (((lzl_code.URShift(i, 1)) + (j / 3)) & 0x01) == 0;
      };
    }

    function DataMask101() {
      this.unmaskBitMatrix = function (bits, dimension) {
        for (let i = 0; i < dimension; i++) {
          for (let j = 0; j < dimension; j++) {
            if (this.isMasked(i, j)) {
              bits.flip(j, i);
            }
          }
        }
      };
      this.isMasked = function (i, j) {
        let temp = i * j;
        return (temp & 0x01) + (temp % 3) == 0;
      };
    }

    function DataMask110() {
      this.unmaskBitMatrix = function (bits, dimension) {
        for (let i = 0; i < dimension; i++) {
          for (let j = 0; j < dimension; j++) {
            if (this.isMasked(i, j)) {
              bits.flip(j, i);
            }
          }
        }
      };
      this.isMasked = function (i, j) {
        let temp = i * j;
        return (((temp & 0x01) + (temp % 3)) & 0x01) == 0;
      };
    }

    function DataMask111() {
      this.unmaskBitMatrix = function (bits, dimension) {
        for (let i = 0; i < dimension; i++) {
          for (let j = 0; j < dimension; j++) {
            if (this.isMasked(i, j)) {
              bits.flip(j, i);
            }
          }
        }
      };
      this.isMasked = function (i, j) {
        return ((((i + j) & 0x01) + ((i * j) % 3)) & 0x01) == 0;
      };
    }

    DataMask.DATA_MASKS = [new DataMask000(), new DataMask001(), new DataMask010(), new DataMask011(), new DataMask100(), new DataMask101(), new DataMask110(), new DataMask111()];



    // ====== END OF FILE: ==============================================================================================================
    // datamask.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // rsdecoder.js
    // ==================================================================================================================================

    function ReedSolomonDecoder(field) {
      this.field = field;
      this.decode = function (received, twoS) {
        let i,
          poly = new GF256Poly(this.field, received),
          syndromeCoefficients = Array(twoS);
        for (i = 0; i < syndromeCoefficients.length; i++)
          syndromeCoefficients[i] = 0;
        let dataMatrix = false, //this.field.Equals(GF256.DATA_MATRIX_FIELD);
          noError = true;
        for (i = 0; i < twoS; i++) {
          // Thanks to sanfordsquires for this fix:
          let evaluated = poly.evaluateAt(this.field.exp(dataMatrix ? i + 1 : i));
          syndromeCoefficients[syndromeCoefficients.length - 1 - i] = evaluated;
          if (evaluated != 0) {
            noError = false;
          }
        }
        if (noError) {
          return;
        }
        let syndrome = new GF256Poly(this.field, syndromeCoefficients),
          sigmaOmega = this.runEuclideanAlgorithm(this.field.buildMonomial(twoS, 1), syndrome, twoS),
          sigma = sigmaOmega[0],
          omega = sigmaOmega[1],
          errorLocations = this.findErrorLocations(sigma),
          errorMagnitudes = this.findErrorMagnitudes(omega, errorLocations, dataMatrix);
        for (i = 0; i < errorLocations.length; i++) {
          let position = received.length - 1 - this.field.log(errorLocations[i]);
          if (position < 0) {
            throw "ReedSolomonException Bad error location";
          }
          received[position] = GF256.addOrSubtract(received[position], errorMagnitudes[i]);
        }
      };

      this.runEuclideanAlgorithm = function (a, b, R) {
        // Assume a's degree is >= b's
        if (a.Degree < b.Degree) {
          let temp = a;
          a = b;
          b = temp;
        }

        let rLast = a,
          r = b,
          sLast = this.field.One,
          s = this.field.Zero,
          tLast = this.field.Zero,
          t = this.field.One;

        // Run Euclidean algorithm until r's degree is less than R/2
        while (r.Degree >= Math.floor(R / 2)) {
          let rLastLast = rLast,
            sLastLast = sLast,
            tLastLast = tLast;
          rLast = r;
          sLast = s;
          tLast = t;

          // Divide rLastLast by rLast, with quotient in q and remainder in r
          if (rLast.Zero) {
            // Oops, Euclidean algorithm already terminated?
            throw "r_{i-1} was zero";
          }
          r = rLastLast;
          let q = this.field.Zero,
            denominatorLeadingTerm = rLast.getCoefficient(rLast.Degree),
            dltInverse = this.field.inverse(denominatorLeadingTerm);
          while (r.Degree >= rLast.Degree && !r.Zero) {
            let degreeDiff = r.Degree - rLast.Degree,
              scale = this.field.multiply(r.getCoefficient(r.Degree), dltInverse);
            q = q.addOrSubtract(this.field.buildMonomial(degreeDiff, scale));
            r = r.addOrSubtract(rLast.multiplyByMonomial(degreeDiff, scale));
            //r.EXE();
          }

          s = q.multiply1(sLast).addOrSubtract(sLastLast);
          t = q.multiply1(tLast).addOrSubtract(tLastLast);
        }

        let sigmaTildeAtZero = t.getCoefficient(0);
        if (sigmaTildeAtZero == 0) {
          throw "ReedSolomonException sigmaTilde(0) was zero";
        }

        let inverse = this.field.inverse(sigmaTildeAtZero),
          sigma = t.multiply2(inverse),
          omega = r.multiply2(inverse);
        return [sigma, omega];
      };
      this.findErrorLocations = function (errorLocator) {
        // This is a direct application of Chien's search
        let numErrors = errorLocator.Degree;
        if (numErrors == 1) {
          // shortcut
          return Array(errorLocator.getCoefficient(1));
        }
        let result = Array(numErrors),
          e = 0;
        for (let i = 1; i < 256 && e < numErrors; i++) {
          if (errorLocator.evaluateAt(i) == 0) {
            result[e] = this.field.inverse(i);
            e++;
          }
        }
        if (e != numErrors) {
          throw "Error locator degree does not match number of roots";
        }
        return result;
      };
      this.findErrorMagnitudes = function (errorEvaluator, errorLocations, dataMatrix) {
        // This is directly applying Forney's Formula
        let s = errorLocations.length,
          result = Array(s);
        for (let i = 0; i < s; i++) {
          let xiInverse = this.field.inverse(errorLocations[i]),
            denominator = 1;
          for (let j = 0; j < s; j++) {
            if (i != j) {
              denominator = this.field.multiply(denominator, GF256.addOrSubtract(1, this.field.multiply(errorLocations[j], xiInverse)));
            }
          }
          result[i] = this.field.multiply(errorEvaluator.evaluateAt(xiInverse), this.field.inverse(denominator));
          // Thanks to sanfordsquires for this fix:
          if (dataMatrix) {
            result[i] = this.field.multiply(result[i], xiInverse);
          }
        }
        return result;
      };
    }

    // ====== END OF FILE: ==============================================================================================================
    // rsdecoder.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // gf256poly.js
    // ==================================================================================================================================

    function GF256Poly(field, coefficients) {
      if (coefficients == null || coefficients.length == 0) {
        throw "System.ArgumentException";
      }
      this.field = field;
      let coefficientsLength = coefficients.length;
      if (coefficientsLength > 1 && coefficients[0] == 0) {
        // Leading term must be non-zero for anything except the constant polynomial "0"
        let firstNonZero = 1;
        while (firstNonZero < coefficientsLength && coefficients[firstNonZero] == 0) {
          firstNonZero++;
        }
        if (firstNonZero == coefficientsLength) {
          this.coefficients = field.Zero.coefficients;
        } else {
          this.coefficients = Array(coefficientsLength - firstNonZero);
          for (let i = 0; i < this.coefficients.length; i++)
            this.coefficients[i] = 0;
          //Array.Copy(coefficients, firstNonZero, this.coefficients, 0, this.coefficients.length);
          for (let ci = 0; ci < this.coefficients.length; ci++)
            this.coefficients[ci] = coefficients[firstNonZero + ci];
        }
      } else {
        this.coefficients = coefficients;
      }

      this.__defineGetter__("Zero", function () {
        return this.coefficients[0] == 0;
      });
      this.__defineGetter__("Degree", function () {
        return this.coefficients.length - 1;
      });
      this.__defineGetter__("Coefficients", function () {
        return this.coefficients;
      });

      this.getCoefficient = function (degree) {
        return this.coefficients[this.coefficients.length - 1 - degree];
      };

      this.evaluateAt = function (a) {
        let i;
        if (a == 0) {
          // Just return the x^0 coefficient
          return this.getCoefficient(0);
        }
        let size = this.coefficients.length;
        if (a == 1) {
          // Just the sum of the coefficients
          let result = 0;
          for (i = 0; i < size; i++) {
            result = GF256.addOrSubtract(result, this.coefficients[i]);
          }
          return result;
        }
        let result2 = this.coefficients[0];
        for (i = 1; i < size; i++) {
          result2 = GF256.addOrSubtract(this.field.multiply(a, result2), this.coefficients[i]);
        }
        return result2;
      };

      this.addOrSubtract = function (other) {
        if (this.field != other.field) {
          throw "GF256Polys do not have same GF256 field";
        }
        if (this.Zero) {
          return other;
        }
        if (other.Zero) {
          return this;
        }

        let smallerCoefficients = this.coefficients,
          largerCoefficients = other.coefficients;
        if (smallerCoefficients.length > largerCoefficients.length) {
          let temp = smallerCoefficients;
          smallerCoefficients = largerCoefficients;
          largerCoefficients = temp;
        }
        let sumDiff = Array(largerCoefficients.length),
          lengthDiff = largerCoefficients.length - smallerCoefficients.length;
        // Copy high-order terms only found in higher-degree polynomial's coefficients
        //Array.Copy(largerCoefficients, 0, sumDiff, 0, lengthDiff);
        for (let ci = 0; ci < lengthDiff; ci++)
          sumDiff[ci] = largerCoefficients[ci];

        for (let i = lengthDiff; i < largerCoefficients.length; i++) {
          sumDiff[i] = GF256.addOrSubtract(smallerCoefficients[i - lengthDiff], largerCoefficients[i]);
        }

        return new GF256Poly(field, sumDiff);
      };
      this.multiply1 = function (other) {
        if (this.field != other.field) {
          throw "GF256Polys do not have same GF256 field";
        }
        if (this.Zero || other.Zero) {
          return this.field.Zero;
        }
        let aCoefficients = this.coefficients,
          aLength = aCoefficients.length,
          bCoefficients = other.coefficients,
          bLength = bCoefficients.length,
          product = Array(aLength + bLength - 1);
        for (let i = 0; i < aLength; i++) {
          let aCoeff = aCoefficients[i];
          for (let j = 0; j < bLength; j++) {
            product[i + j] = GF256.addOrSubtract(product[i + j], this.field.multiply(aCoeff, bCoefficients[j]));
          }
        }
        return new GF256Poly(this.field, product);
      };
      this.multiply2 = function (scalar) {
        if (scalar == 0) {
          return this.field.Zero;
        }
        if (scalar == 1) {
          return this;
        }
        let size = this.coefficients.length,
          product = Array(size);
        for (let i = 0; i < size; i++) {
          product[i] = this.field.multiply(this.coefficients[i], scalar);
        }
        return new GF256Poly(this.field, product);
      };
      this.multiplyByMonomial = function (degree, coefficient) {
        let i;
        if (degree < 0) {
          throw "System.ArgumentException";
        }
        if (coefficient == 0) {
          return this.field.Zero;
        }
        let size = this.coefficients.length,
          product = Array(size + degree);
        for (i = 0; i < product.length; i++)
          product[i] = 0;
        for (i = 0; i < size; i++) {
          product[i] = this.field.multiply(this.coefficients[i], coefficient);
        }
        return new GF256Poly(this.field, product);
      };
      this.divide = function (other) {
        if (this.field != other.field) {
          throw "GF256Polys do not have same GF256 field";
        }
        if (other.Zero) {
          throw "Divide by 0";
        }

        let quotient = this.field.Zero,
          remainder = this,
          denominatorLeadingTerm = other.getCoefficient(other.Degree),
          inverseDenominatorLeadingTerm = this.field.inverse(denominatorLeadingTerm);

        while (remainder.Degree >= other.Degree && !remainder.Zero) {
          let degreeDifference = remainder.Degree - other.Degree,
            scale = this.field.multiply(remainder.getCoefficient(remainder.Degree), inverseDenominatorLeadingTerm),
            term = other.multiplyByMonomial(degreeDifference, scale),
            iterationQuotient = this.field.buildMonomial(degreeDifference, scale);
          quotient = quotient.addOrSubtract(iterationQuotient);
          remainder = remainder.addOrSubtract(term);
        }

        return [quotient, remainder];
      };
    }

    // ====== END OF FILE: ==============================================================================================================
    // gf256poly.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // gf256.js
    // ==================================================================================================================================


    function GF256(primitive) {
      let i;
      this.expTable = Array(256);
      this.logTable = Array(256);
      let x = 1;
      for (i = 0; i < 256; i++) {
        this.expTable[i] = x;
        x <<= 1; // x = x * 2; we're assuming the generator alpha is 2
        if (x >= 0x100) {
          x ^= primitive;
        }
      }
      for (i = 0; i < 255; i++) {
        this.logTable[this.expTable[i]] = i;
      }
      // logTable[0] == 0 but this should never be used
      let at0 = Array(1);
      at0[0] = 0;
      this.zero = new GF256Poly(this, Array(at0));
      let at1 = Array(1);
      at1[0] = 1;
      this.one = new GF256Poly(this, Array(at1));

      this.__defineGetter__("Zero", function () {
        return this.zero;
      });
      this.__defineGetter__("One", function () {
        return this.one;
      });
      this.buildMonomial = function (degree, coefficient) {
        if (degree < 0) {
          throw "System.ArgumentException";
        }
        if (coefficient == 0) {
          return this.zero;
        }
        let coefficients = Array(degree + 1);
        for (let i = 0; i < coefficients.length; i++)
          coefficients[i] = 0;
        coefficients[0] = coefficient;
        return new GF256Poly(this, coefficients);
      };
      this.exp = function (a) {
        return this.expTable[a];
      };
      this.log = function (a) {
        if (a == 0) {
          throw "System.ArgumentException";
        }
        return this.logTable[a];
      };
      this.inverse = function (a) {
        if (a == 0) {
          throw "System.ArithmeticException";
        }
        return this.expTable[255 - this.logTable[a]];
      };
      this.multiply = function (a, b) {
        if (a == 0 || b == 0) {
          return 0;
        }
        if (a == 1) {
          return b;
        }
        if (b == 1) {
          return a;
        }
        return this.expTable[(this.logTable[a] + this.logTable[b]) % 255];
      };
    }

    GF256.QR_CODE_FIELD = new GF256(0x011D);
    GF256.DATA_MATRIX_FIELD = new GF256(0x012D);

    GF256.addOrSubtract = function (a, b) {
      return a ^ b;
    };

    // ====== END OF FILE: ==============================================================================================================
    // gf256.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // decoder.js
    // ==================================================================================================================================


    let Decoder = {};
    Decoder.rsDecoder = new ReedSolomonDecoder(GF256.QR_CODE_FIELD);

    Decoder.correctErrors = function (codewordBytes, numDataCodewords) {
      let i,
        numCodewords = codewordBytes.length,
        // First read into an array of ints
        codewordsInts = Array(numCodewords);
      for (i = 0; i < numCodewords; i++) {
        codewordsInts[i] = codewordBytes[i] & 0xFF;
      }
      let numECCodewords = codewordBytes.length - numDataCodewords;
      try {
        Decoder.rsDecoder.decode(codewordsInts, numECCodewords);
        //let corrector = new ReedSolomon(codewordsInts, numECCodewords);
        //corrector.correct();
      } catch (rse) {
        throw rse;
      }
      // Copy back into array of bytes -- only need to worry about the bytes that were data
      // We don't care about errors in the error-correction codewords
      for (i = 0; i < numDataCodewords; i++) {
        codewordBytes[i] = codewordsInts[i];
      }
    };

    Decoder.decode = function (bits) {
      let i, j,
        parser = new BitMatrixParser(bits),
        version = parser.readVersion(),
        ecLevel = parser.readFormatInformation().ErrorCorrectionLevel,
        // Read codewords
        codewords = parser.readCodewords(),
        // Separate into data blocks
        dataBlocks = DataBlock.getDataBlocks(codewords, version, ecLevel),
        // Count total number of data bytes
        totalBytes = 0;
      for (i = 0; i < dataBlocks.length; i++) {
        totalBytes += dataBlocks[i].NumDataCodewords;
      }
      let resultBytes = Array(totalBytes),
        resultOffset = 0;

      // Error-correct and copy data blocks together into a stream of bytes
      for (j = 0; j < dataBlocks.length; j++) {
        let dataBlock = dataBlocks[j],
          codewordBytes = dataBlock.Codewords,
          numDataCodewords = dataBlock.NumDataCodewords;
        Decoder.correctErrors(codewordBytes, numDataCodewords);
        for (i = 0; i < numDataCodewords; i++) {
          resultBytes[resultOffset++] = codewordBytes[i];
        }
      }

      // Decode the contents of that stream of bytes
      let reader = new QRCodeDataBlockReader(resultBytes, version.VersionNumber, ecLevel.Bits);
      return reader;
      //return DecodedBitStreamParser.decode(resultBytes, version, ecLevel);
    };


    // ====== END OF FILE: ==============================================================================================================
    // decoder.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // findpat.js
    // ==================================================================================================================================


    let MIN_SKIP = 3,
      MAX_MODULES = 57,
      INTEGER_MATH_SHIFT = 8,
      CENTER_QUORUM = 2;

    lzl_code.orderBestPatterns = function (patterns) {

      function distance(pattern1, pattern2) {
        if (typeof pattern1 === 'undefined' || typeof pattern2 === 'undefined') {
          throw "Pattern undefined";
        }
        let xDiff = pattern1.X - pattern2.X,
          yDiff = pattern1.Y - pattern2.Y;
        return Math.sqrt((xDiff * xDiff + yDiff * yDiff));
      }

      /// <summary> Returns the z component of the cross product between vectors BC and BA.</summary>
      function crossProductZ(pointA, pointB, pointC) {
        let bX = pointB.x,
          bY = pointB.y;
        return ((pointC.x - bX) * (pointA.y - bY)) - ((pointC.y - bY) * (pointA.x - bX));
      }


      // Find distances between pattern centers
      let zeroOneDistance = distance(patterns[0], patterns[1]),
        oneTwoDistance = distance(patterns[1], patterns[2]),
        zeroTwoDistance = distance(patterns[0], patterns[2]),
        pointA, pointB, pointC;
      // Assume one closest to other two is B; A and C will just be guesses at first
      if (oneTwoDistance >= zeroOneDistance && oneTwoDistance >= zeroTwoDistance) {
        pointB = patterns[0];
        pointA = patterns[1];
        pointC = patterns[2];
      } else if (zeroTwoDistance >= oneTwoDistance && zeroTwoDistance >= zeroOneDistance) {
        pointB = patterns[1];
        pointA = patterns[0];
        pointC = patterns[2];
      } else {
        pointB = patterns[2];
        pointA = patterns[0];
        pointC = patterns[1];
      }

      // Use cross product to figure out whether A and C are correct or flipped.
      // This asks whether BC x BA has a positive z component, which is the arrangement
      // we want for A, B, C. If it's negative, then we've got it flipped around and
      // should swap A and C.
      if (crossProductZ(pointA, pointB, pointC) < 0) {
        let temp = pointA;
        pointA = pointC;
        pointC = temp;
      }

      patterns[0] = pointA;
      patterns[1] = pointB;
      patterns[2] = pointC;
    };


    function FinderPattern(posX, posY, estimatedModuleSize) {
      this.x = posX;
      this.y = posY;
      this.count = 1;
      this.estimatedModuleSize = estimatedModuleSize;

      this.__defineGetter__("EstimatedModuleSize", function () {
        return this.estimatedModuleSize;
      });
      this.__defineGetter__("Count", function () {
        return this.count;
      });
      this.__defineGetter__("X", function () {
        return this.x;
      });
      this.__defineGetter__("Y", function () {
        return this.y;
      });
      this.incrementCount = function () {
        this.count++;
      };
      this.aboutEquals = function (moduleSize, i, j) {
        if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize) {
          let moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
          return moduleSizeDiff <= 1 || moduleSizeDiff / this.estimatedModuleSize <= 1;
        }
        return false;
      };

    }

    function FinderPatternInfo(patternCenters) {
      this.bottomLeft = patternCenters[0];
      this.topLeft = patternCenters[1];
      this.topRight = patternCenters[2];
      this.__defineGetter__("BottomLeft", function () {
        return this.bottomLeft;
      });
      this.__defineGetter__("TopLeft", function () {
        return this.topLeft;
      });
      this.__defineGetter__("TopRight", function () {
        return this.topRight;
      });
    }

    function FinderPatternFinder() {
      this.image = null;
      this.possibleCenters = [];
      this.hasSkipped = false;
      this.crossCheckStateCount = [0, 0, 0, 0, 0];
      this.resultPointCallback = null;

      this.__defineGetter__("CrossCheckStateCount", function () {
        this.crossCheckStateCount[0] = 0;
        this.crossCheckStateCount[1] = 0;
        this.crossCheckStateCount[2] = 0;
        this.crossCheckStateCount[3] = 0;
        this.crossCheckStateCount[4] = 0;
        return this.crossCheckStateCount;
      });

      this.foundPatternCross = function (stateCount) {
        let totalModuleSize = 0;
        for (let i = 0; i < 5; i++) {
          let count = stateCount[i];
          if (count == 0) {
            return false;
          }
          totalModuleSize += count;
        }
        if (totalModuleSize < 7) {
          return false;
        }
        let moduleSize = Math.floor((totalModuleSize << INTEGER_MATH_SHIFT) / 7),
          maxVariance = Math.floor(moduleSize / 2);
        // Allow less than 50% variance from 1-1-3-1-1 proportions
        return Math.abs(moduleSize - (stateCount[0] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[1] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(3 * moduleSize - (stateCount[2] << INTEGER_MATH_SHIFT)) < 3 * maxVariance && Math.abs(moduleSize - (stateCount[3] << INTEGER_MATH_SHIFT)) < maxVariance && Math.abs(moduleSize - (stateCount[4] << INTEGER_MATH_SHIFT)) < maxVariance;
      };
      this.centerFromEnd = function (stateCount, end) {
        return (end - stateCount[4] - stateCount[3]) - stateCount[2] / 2.0;
      };
      this.crossCheckVertical = function (startI, centerJ, maxCount, originalStateCountTotal) {
        let image = this.image,
          maxI = lzl_code.height,
          stateCount = this.CrossCheckStateCount,
          // Start counting up from center
          i = startI;
        while (i >= 0 && image[centerJ + i * lzl_code.width]) {
          stateCount[2]++;
          i--;
        }
        if (i < 0) {
          return NaN;
        }
        while (i >= 0 && !image[centerJ + i * lzl_code.width] && stateCount[1] <= maxCount) {
          stateCount[1]++;
          i--;
        }
        // If already too many modules in this state or ran off the edge:
        if (i < 0 || stateCount[1] > maxCount) {
          return NaN;
        }
        while (i >= 0 && image[centerJ + i * lzl_code.width] && stateCount[0] <= maxCount) {
          stateCount[0]++;
          i--;
        }
        if (stateCount[0] > maxCount) {
          return NaN;
        }

        // Now also count down from center
        i = startI + 1;
        while (i < maxI && image[centerJ + i * lzl_code.width]) {
          stateCount[2]++;
          i++;
        }
        if (i == maxI) {
          return NaN;
        }
        while (i < maxI && !image[centerJ + i * lzl_code.width] && stateCount[3] < maxCount) {
          stateCount[3]++;
          i++;
        }
        if (i == maxI || stateCount[3] >= maxCount) {
          return NaN;
        }
        while (i < maxI && image[centerJ + i * lzl_code.width] && stateCount[4] < maxCount) {
          stateCount[4]++;
          i++;
        }
        if (stateCount[4] >= maxCount) {
          return NaN;
        }

        // If we found a finder-pattern-like section, but its size is more than 40% different than
        // the original, assume it's a false positive
        let stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
          return NaN;
        }

        return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, i) : NaN;
      };
      this.crossCheckHorizontal = function (startJ, centerI, maxCount, originalStateCountTotal) {
        let image = this.image,
          maxJ = lzl_code.width,
          stateCount = this.CrossCheckStateCount,
          j = startJ;
        while (j >= 0 && image[j + centerI * lzl_code.width]) {
          stateCount[2]++;
          j--;
        }
        if (j < 0) {
          return NaN;
        }
        while (j >= 0 && !image[j + centerI * lzl_code.width] && stateCount[1] <= maxCount) {
          stateCount[1]++;
          j--;
        }
        if (j < 0 || stateCount[1] > maxCount) {
          return NaN;
        }
        while (j >= 0 && image[j + centerI * lzl_code.width] && stateCount[0] <= maxCount) {
          stateCount[0]++;
          j--;
        }
        if (stateCount[0] > maxCount) {
          return NaN;
        }

        j = startJ + 1;
        while (j < maxJ && image[j + centerI * lzl_code.width]) {
          stateCount[2]++;
          j++;
        }
        if (j == maxJ) {
          return NaN;
        }
        while (j < maxJ && !image[j + centerI * lzl_code.width] && stateCount[3] < maxCount) {
          stateCount[3]++;
          j++;
        }
        if (j == maxJ || stateCount[3] >= maxCount) {
          return NaN;
        }
        while (j < maxJ && image[j + centerI * lzl_code.width] && stateCount[4] < maxCount) {
          stateCount[4]++;
          j++;
        }
        if (stateCount[4] >= maxCount) {
          return NaN;
        }

        // If we found a finder-pattern-like section, but its size is significantly different than
        // the original, assume it's a false positive
        let stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= originalStateCountTotal) {
          return NaN;
        }

        return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, j) : NaN;
      };
      this.handlePossibleCenter = function (stateCount, i, j) {
        let stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2] + stateCount[3] + stateCount[4],
          centerJ = this.centerFromEnd(stateCount, j), //float
          centerI = this.crossCheckVertical(i, Math.floor(centerJ), stateCount[2], stateCountTotal); //float
        if (!isNaN(centerI)) {
          // Re-cross check
          centerJ = this.crossCheckHorizontal(Math.floor(centerJ), Math.floor(centerI), stateCount[2], stateCountTotal);
          if (!isNaN(centerJ)) {
            let estimatedModuleSize = stateCountTotal / 7,
              found = false,
              max = this.possibleCenters.length;
            for (let index = 0; index < max; index++) {
              let center = this.possibleCenters[index];
              // Look for about the same center and module size:
              if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
                center.incrementCount();
                found = true;
                break;
              }
            }
            if (!found) {
              let point = new FinderPattern(centerJ, centerI, estimatedModuleSize);
              this.possibleCenters.push(point);
              if (this.resultPointCallback != null) {
                this.resultPointCallback.foundPossibleResultPoint(point);
              }
            }
            return true;
          }
        }
        return false;
      };

      this.selectBestPatterns = function () {
        let i,
          startSize = this.possibleCenters.length;
        if (startSize < 3) {
          // Couldn't find enough finder patterns
          throw "Couldn't find enough finder patterns";
        }

        // Filter outlier possibilities whose module size is too different
        if (startSize > 3) {
          // But we can only afford to do so if we have at least 4 possibilities to choose from
          let totalModuleSize = 0,
            square = 0;
          for (i = 0; i < startSize; i++) {
            //totalModuleSize +=  this.possibleCenters[i].EstimatedModuleSize;
            let centerValue = this.possibleCenters[i].EstimatedModuleSize;
            totalModuleSize += centerValue;
            square += (centerValue * centerValue);
          }
          let average = totalModuleSize / startSize;
          this.possibleCenters.sort(function (center1, center2) {
            let dA = Math.abs(center2.EstimatedModuleSize - average),
              dB = Math.abs(center1.EstimatedModuleSize - average);
            if (dA < dB) {
              return (-1);
            } else if (dA == dB) {
              return 0;
            } else {
              return 1;
            }
          });

          let stdDev = Math.sqrt(square / startSize - average * average),
            limit = Math.max(0.2 * average, stdDev);
          for (i = 0; i < this.possibleCenters.length && this.possibleCenters.length > 3; i++) {
            let pattern = this.possibleCenters[i];
            //if (Math.abs(pattern.EstimatedModuleSize - average) > 0.2 * average)
            if (Math.abs(pattern.EstimatedModuleSize - average) > limit) {
              this.possibleCenters = lzl_code.remove(this.possibleCenters, i);
              i--;
            }
          }
        }

        if (this.possibleCenters.length > 3) {
          // Throw away all but those first size candidate points we found.
          this.possibleCenters.sort(function (a, b) {
            if (a.count > b.count) {
              return -1;
            }
            if (a.count < b.count) {
              return 1;
            }
            return 0;
          });
        }

        return [this.possibleCenters[0], this.possibleCenters[1], this.possibleCenters[2]];
      };

      this.findRowSkip = function () {
        let max = this.possibleCenters.length;
        if (max <= 1) {
          return 0;
        }
        let firstConfirmedCenter = null;
        for (let i = 0; i < max; i++) {
          let center = this.possibleCenters[i];
          if (center.Count >= CENTER_QUORUM) {
            if (firstConfirmedCenter == null) {
              firstConfirmedCenter = center;
            } else {
              // We have two confirmed centers
              // How far down can we skip before resuming looking for the next
              // pattern? In the worst case, only the difference between the
              // difference in the x / y coordinates of the two centers.
              // This is the case where you find top left last.
              this.hasSkipped = true;
              return Math.floor((Math.abs(firstConfirmedCenter.X - center.X) - Math.abs(firstConfirmedCenter.Y - center.Y)) / 2);
            }
          }
        }
        return 0;
      };

      this.haveMultiplyConfirmedCenters = function () {
        let i, pattern,
          confirmedCount = 0,
          totalModuleSize = 0,
          max = this.possibleCenters.length;
        for (i = 0; i < max; i++) {
          pattern = this.possibleCenters[i];
          if (pattern.Count >= CENTER_QUORUM) {
            confirmedCount++;
            totalModuleSize += pattern.EstimatedModuleSize;
          }
        }
        if (confirmedCount < 3) {
          return false;
        }
        // OK, we have at least 3 confirmed centers, but, it's possible that one is a "false positive"
        // and that we need to keep looking. We detect this by asking if the estimated module sizes
        // vary too much. We arbitrarily say that when the total deviation from average exceeds
        // 5% of the total module size estimates, it's too much.
        let average = totalModuleSize / max,
          totalDeviation = 0;
        for (i = 0; i < max; i++) {
          pattern = this.possibleCenters[i];
          totalDeviation += Math.abs(pattern.EstimatedModuleSize - average);
        }
        return totalDeviation <= 0.05 * totalModuleSize;
      };

      this.findFinderPattern = function (image) {
        let confirmed,
          tryHarder = false;
        this.image = image;
        let maxI = lzl_code.height,
          maxJ = lzl_code.width,
          iSkip = Math.floor((3 * maxI) / (4 * MAX_MODULES));
        if (iSkip < MIN_SKIP || tryHarder) {
          iSkip = MIN_SKIP;
        }

        let done = false,
          stateCount = Array(5);
        for (let i = iSkip - 1; i < maxI && !done; i += iSkip) {
          // Get a row of black/white values
          stateCount[0] = 0;
          stateCount[1] = 0;
          stateCount[2] = 0;
          stateCount[3] = 0;
          stateCount[4] = 0;
          let currentState = 0;
          for (let j = 0; j < maxJ; j++) {
            if (image[j + i * lzl_code.width]) {
              // Black pixel
              if ((currentState & 1) == 1) {
                // Counting white pixels
                currentState++;
              }
              stateCount[currentState]++;
            } else {
              // White pixel
              if ((currentState & 1) == 0) {
                // Counting black pixels
                if (currentState == 4) {
                  // A winner?
                  if (this.foundPatternCross(stateCount)) {
                    // Yes
                    confirmed = this.handlePossibleCenter(stateCount, i, j);
                    if (confirmed) {
                      // Start examining every other line. Checking each line turned out to be too
                      // expensive and didn't improve performance.
                      iSkip = 2;
                      if (this.hasSkipped) {
                        done = this.haveMultiplyConfirmedCenters();
                      } else {
                        let rowSkip = this.findRowSkip();
                        if (rowSkip > stateCount[2]) {
                          // Skip rows between row of lower confirmed center
                          // and top of presumed third confirmed center
                          // but back up a bit to get a full chance of detecting
                          // it, entire width of center of finder pattern

                          // Skip by rowSkip, but back off by stateCount[2] (size of last center
                          // of pattern we saw) to be conservative, and also back off by iSkip which
                          // is about to be re-added
                          i += rowSkip - stateCount[2] - iSkip;
                          j = maxJ - 1;
                        }
                      }
                    } else {
                      // Advance to next black pixel
                      do {
                        j++;
                      } while (j < maxJ && !image[j + i * lzl_code.width]);
                      j--; // back up to that last white pixel
                    }
                    // Clear state to start looking again
                    currentState = 0;
                    stateCount[0] = 0;
                    stateCount[1] = 0;
                    stateCount[2] = 0;
                    stateCount[3] = 0;
                    stateCount[4] = 0;
                  } else {
                    // No, shift counts back by two
                    stateCount[0] = stateCount[2];
                    stateCount[1] = stateCount[3];
                    stateCount[2] = stateCount[4];
                    stateCount[3] = 1;
                    stateCount[4] = 0;
                    currentState = 3;
                  }
                } else {
                  stateCount[++currentState]++;
                }
              } else {
                // Counting white pixels
                stateCount[currentState]++;
              }
            }
          }
          if (this.foundPatternCross(stateCount)) {
            confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
            if (confirmed) {
              iSkip = stateCount[0];
              if (this.hasSkipped) {
                // Found a third one
                done = this.haveMultiplyConfirmedCenters();
              }
            }
          }
        }

        let patternInfo = this.selectBestPatterns();
        lzl_code.orderBestPatterns(patternInfo);

        return new FinderPatternInfo(patternInfo);
      };
    }


    // ====== END OF FILE: ==============================================================================================================
    // findpat.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // alignpat.js
    // ==================================================================================================================================


    function AlignmentPattern(posX, posY, estimatedModuleSize) {
      this.x = posX;
      this.y = posY;
      this.count = 1;
      this.estimatedModuleSize = estimatedModuleSize;

      this.__defineGetter__("EstimatedModuleSize", function () {
        return this.estimatedModuleSize;
      });
      this.__defineGetter__("Count", function () {
        return this.count;
      });
      this.__defineGetter__("X", function () {
        return Math.floor(this.x);
      });
      this.__defineGetter__("Y", function () {
        return Math.floor(this.y);
      });
      this.incrementCount = function () {
        this.count++;
      };
      this.aboutEquals = function (moduleSize, i, j) {
        if (Math.abs(i - this.y) <= moduleSize && Math.abs(j - this.x) <= moduleSize) {
          let moduleSizeDiff = Math.abs(moduleSize - this.estimatedModuleSize);
          return moduleSizeDiff <= 1 || moduleSizeDiff / this.estimatedModuleSize <= 1;
        }
        return false;
      };

    }

    function AlignmentPatternFinder(image, startX, startY, width, height, moduleSize, resultPointCallback) {
      this.image = image;
      this.possibleCenters = [];
      this.startX = startX;
      this.startY = startY;
      this.width = width;
      this.height = height;
      this.moduleSize = moduleSize;
      this.crossCheckStateCount = [0, 0, 0];
      this.resultPointCallback = resultPointCallback;

      this.centerFromEnd = function (stateCount, end) {
        return (end - stateCount[2]) - stateCount[1] / 2.0;
      };
      this.foundPatternCross = function (stateCount) {
        let moduleSize = this.moduleSize,
          maxVariance = moduleSize / 2.0;
        for (let i = 0; i < 3; i++) {
          if (Math.abs(moduleSize - stateCount[i]) >= maxVariance) {
            return false;
          }
        }
        return true;
      };

      this.crossCheckVertical = function (startI, centerJ, maxCount, originalStateCountTotal) {
        let image = this.image,
          maxI = lzl_code.height,
          stateCount = this.crossCheckStateCount;
        stateCount[0] = 0;
        stateCount[1] = 0;
        stateCount[2] = 0;

        // Start counting up from center
        let i = startI;
        while (i >= 0 && image[centerJ + i * lzl_code.width] && stateCount[1] <= maxCount) {
          stateCount[1]++;
          i--;
        }
        // If already too many modules in this state or ran off the edge:
        if (i < 0 || stateCount[1] > maxCount) {
          return NaN;
        }
        while (i >= 0 && !image[centerJ + i * lzl_code.width] && stateCount[0] <= maxCount) {
          stateCount[0]++;
          i--;
        }
        if (stateCount[0] > maxCount) {
          return NaN;
        }

        // Now also count down from center
        i = startI + 1;
        while (i < maxI && image[centerJ + i * lzl_code.width] && stateCount[1] <= maxCount) {
          stateCount[1]++;
          i++;
        }
        if (i == maxI || stateCount[1] > maxCount) {
          return NaN;
        }
        while (i < maxI && !image[centerJ + i * lzl_code.width] && stateCount[2] <= maxCount) {
          stateCount[2]++;
          i++;
        }
        if (stateCount[2] > maxCount) {
          return NaN;
        }

        let stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2];
        if (5 * Math.abs(stateCountTotal - originalStateCountTotal) >= 2 * originalStateCountTotal) {
          return NaN;
        }

        return this.foundPatternCross(stateCount) ? this.centerFromEnd(stateCount, i) : NaN;
      };

      this.handlePossibleCenter = function (stateCount, i, j) {
        let stateCountTotal = stateCount[0] + stateCount[1] + stateCount[2],
          centerJ = this.centerFromEnd(stateCount, j),
          centerI = this.crossCheckVertical(i, Math.floor(centerJ), 2 * stateCount[1], stateCountTotal);
        if (!isNaN(centerI)) {
          let estimatedModuleSize = (stateCount[0] + stateCount[1] + stateCount[2]) / 3,
            max = this.possibleCenters.length;
          for (let index = 0; index < max; index++) {
            let center = this.possibleCenters[index];
            // Look for about the same center and module size:
            if (center.aboutEquals(estimatedModuleSize, centerI, centerJ)) {
              return new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
            }
          }
          // Hadn't found this before; save it
          let point = new AlignmentPattern(centerJ, centerI, estimatedModuleSize);
          this.possibleCenters.push(point);
          if (this.resultPointCallback != null) {
            this.resultPointCallback.foundPossibleResultPoint(point);
          }
        }
        return null;
      };

      this.find = function () {
        let startX = this.startX,
          height = this.height,
          maxJ = startX + width,
          middleI = startY + (height >> 1),
          confirmed;
        // We are looking for black/white/black modules in 1:1:1 ratio;
        // this tracks the number of black/white/black modules seen so far
        let stateCount = [0, 0, 0];
        for (let iGen = 0; iGen < height; iGen++) {
          // Search from middle outwards
          let i = middleI + ((iGen & 0x01) == 0 ? ((iGen + 1) >> 1) : -((iGen + 1) >> 1));
          stateCount[0] = 0;
          stateCount[1] = 0;
          stateCount[2] = 0;
          let j = startX;
          // Burn off leading white pixels before anything else; if we start in the middle of
          // a white run, it doesn't make sense to count its length, since we don't know if the
          // white run continued to the left of the start point
          while (j < maxJ && !image[j + lzl_code.width * i]) {
            j++;
          }
          let currentState = 0;
          while (j < maxJ) {
            if (image[j + i * lzl_code.width]) {
              // Black pixel
              if (currentState == 1) {
                // Counting black pixels
                stateCount[currentState]++;
              } else {
                // Counting white pixels
                if (currentState == 2) {
                  // A winner?
                  if (this.foundPatternCross(stateCount)) {
                    // Yes
                    confirmed = this.handlePossibleCenter(stateCount, i, j);
                    if (confirmed != null) {
                      return confirmed;
                    }
                  }
                  stateCount[0] = stateCount[2];
                  stateCount[1] = 1;
                  stateCount[2] = 0;
                  currentState = 1;
                } else {
                  stateCount[++currentState]++;
                }
              }
            } else {
              // White pixel
              if (currentState == 1) {
                // Counting black pixels
                currentState++;
              }
              stateCount[currentState]++;
            }
            j++;
          }
          if (this.foundPatternCross(stateCount)) {
            confirmed = this.handlePossibleCenter(stateCount, i, maxJ);
            if (confirmed != null) {
              return confirmed;
            }
          }
        }

        // Hmm, nothing we saw was observed and confirmed twice. If we had
        // any guess at all, return it.
        if (this.possibleCenters.length != 0) {
          return this.possibleCenters[0];
        }

        throw "Couldn't find enough alignment patterns";
      };

    }

    // ====== END OF FILE: ==============================================================================================================
    // alignpat.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // databr.js
    // ==================================================================================================================================


    function QRCodeDataBlockReader(blocks, version, numErrorCorrectionCode) {
      this.blockPointer = 0;
      this.bitPointer = 7;
      this.dataLength = 0;
      this.blocks = blocks;
      this.numErrorCorrectionCode = numErrorCorrectionCode;
      if (version <= 9)
        this.dataLengthMode = 0;
      else if (version >= 10 && version <= 26)
        this.dataLengthMode = 1;
      else if (version >= 27 && version <= 40)
        this.dataLengthMode = 2;

      this.getNextBits = function (numBits) {
        let i,
          bits = 0,
          mask1,
          mask3;
        if (numBits < this.bitPointer + 1) {
          // next word fits into current data block
          let mask = 0;
          for (i = 0; i < numBits; i++) {
            mask += (1 << i);
          }
          mask <<= (this.bitPointer - numBits + 1);

          bits = (this.blocks[this.blockPointer] & mask) >> (this.bitPointer - numBits + 1);
          this.bitPointer -= numBits;
          return bits;
        } else if (numBits < this.bitPointer + 1 + 8) {
          // next word crosses 2 data blocks
          mask1 = 0;
          for (i = 0; i < this.bitPointer + 1; i++) {
            mask1 += (1 << i);
          }
          bits = (this.blocks[this.blockPointer] & mask1) << (numBits - (this.bitPointer + 1));
          this.blockPointer++;
          bits += ((this.blocks[this.blockPointer]) >> (8 - (numBits - (this.bitPointer + 1))));

          this.bitPointer = this.bitPointer - numBits % 8;
          if (this.bitPointer < 0) {
            this.bitPointer = 8 + this.bitPointer;
          }
          return bits;
        } else if (numBits < this.bitPointer + 1 + 16) {
          // next word crosses 3 data blocks
          mask1 = 0; // mask of first block
          mask3 = 0; // mask of 3rd block
          //bitPointer + 1 : number of bits of the 1st block
          //8 : number of the 2nd block (note that use already 8bits because next word uses 3 data blocks)
          //numBits - (bitPointer + 1 + 8) : number of bits of the 3rd block
          for (i = 0; i < this.bitPointer + 1; i++) {
            mask1 += (1 << i);
          }
          let bitsFirstBlock = (this.blocks[this.blockPointer] & mask1) << (numBits - (this.bitPointer + 1));
          this.blockPointer++;

          let bitsSecondBlock = this.blocks[this.blockPointer] << (numBits - (this.bitPointer + 1 + 8));
          this.blockPointer++;

          for (i = 0; i < numBits - (this.bitPointer + 1 + 8); i++) {
            mask3 += (1 << i);
          }
          mask3 <<= 8 - (numBits - (this.bitPointer + 1 + 8));
          let bitsThirdBlock = (this.blocks[this.blockPointer] & mask3) >> (8 - (numBits - (this.bitPointer + 1 + 8)));

          bits = bitsFirstBlock + bitsSecondBlock + bitsThirdBlock;
          this.bitPointer = this.bitPointer - (numBits - 8) % 8;
          if (this.bitPointer < 0) {
            this.bitPointer = 8 + this.bitPointer;
          }
          return bits;
        } else {
          return 0;
        }
      };
      this.NextMode = function () {
        if ((this.blockPointer > this.blocks.length - this.numErrorCorrectionCode - 2))
          return 0;
        else
          return this.getNextBits(4);
      };
      this.getDataLength = function (modeIndicator) {
        let index = 0;
        while (true) {
          if ((modeIndicator >> index) == 1)
            break;
          index++;
        }
        let sizeOfDataLengthInfo = [
          [10, 9, 8, 8],
          [12, 11, 16, 10],
          [14, 13, 16, 12]
        ];
        return this.getNextBits(sizeOfDataLengthInfo[this.dataLengthMode][index]);
      };
      this.getRomanAndFigureString = function (dataLength) {
        let length = dataLength,
          intData = 0,
          strData = "",
          tableRomanAndFigure = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', ' ', '$', '%', '*', '+', '-', '.', '/', ':'];
        do {
          if (length > 1) {
            intData = this.getNextBits(11);
            let firstLetter = Math.floor(intData / 45),
              secondLetter = intData % 45;
            strData += tableRomanAndFigure[firstLetter];
            strData += tableRomanAndFigure[secondLetter];
            length -= 2;
          } else if (length == 1) {
            intData = this.getNextBits(6);
            strData += tableRomanAndFigure[intData];
            length -= 1;
          }
        } while (length > 0);

        return strData;
      };
      this.getFigureString = function (dataLength) {
        let length = dataLength,
          intData = 0,
          strData = "";
        do {
          if (length >= 3) {
            intData = this.getNextBits(10);
            if (intData < 100)
              strData += "0";
            if (intData < 10)
              strData += "0";
            length -= 3;
          } else if (length == 2) {
            intData = this.getNextBits(7);
            if (intData < 10)
              strData += "0";
            length -= 2;
          } else if (length == 1) {
            intData = this.getNextBits(4);
            length -= 1;
          }
          strData += intData;
        } while (length > 0);

        return strData;
      };
      this.get8bitByteArray = function (dataLength) {
        let length = dataLength,
          intData = 0,
          output = [];

        do {
          intData = this.getNextBits(8);
          output.push(intData);
          length--;
        } while (length > 0);
        return output;
      };
      this.getKanjiString = function (dataLength) {
        let length = dataLength,
          intData = 0,
          unicodeString = "";
        do {
          intData = this.getNextBits(13);
          let lowerByte = intData % 0xC0,
            higherByte = intData / 0xC0,
            tempWord = (higherByte << 8) + lowerByte,
            shiftjisWord = 0;
          if (tempWord + 0x8140 <= 0x9FFC) {
            // between 8140 - 9FFC on Shift_JIS character set
            shiftjisWord = tempWord + 0x8140;
          } else {
            // between E040 - EBBF on Shift_JIS character set
            shiftjisWord = tempWord + 0xC140;
          }

          //let tempByte = Array(0,0);
          //tempByte[0] = (sbyte) (shiftjisWord >> 8);
          //tempByte[1] = (sbyte) (shiftjisWord & 0xFF);
          //unicodeString += new String(SystemUtils.ToCharArray(SystemUtils.ToByteArray(tempByte)));
          unicodeString += String.fromCharCode(shiftjisWord);
          length--;
        } while (length > 0);


        return unicodeString;
      };

      this.__defineGetter__("DataByte", function () {
        let output = [],
          MODE_NUMBER = 1,
          MODE_ROMAN_AND_NUMBER = 2,
          MODE_8BIT_BYTE = 4,
          MODE_KANJI = 8,
          temp_str,
          ta,
          j;
        do {
          let mode = this.NextMode();
          //canvas.println("mode: " + mode);
          if (mode == 0) {
            if (output.length > 0)
              break;
            else
              throw "Empty data block";
          }
          //if (mode != 1 && mode != 2 && mode != 4 && mode != 8)
          //	break;
          //}
          if (mode != MODE_NUMBER && mode != MODE_ROMAN_AND_NUMBER && mode != MODE_8BIT_BYTE && mode != MODE_KANJI) {
            /*					canvas.println("Invalid mode: " + mode);
             mode = guessMode(mode);
             canvas.println("Guessed mode: " + mode); */
            throw "Invalid mode: " + mode + " in (block:" + this.blockPointer + " bit:" + this.bitPointer + ")";
          }
          let dataLength = this.getDataLength(mode);
          if (dataLength < 1)
            throw "Invalid data length: " + dataLength;
          //canvas.println("length: " + dataLength);
          switch (mode) {

            case MODE_NUMBER:
              //canvas.println("Mode: Figure");
              temp_str = this.getFigureString(dataLength);
              ta = Array(temp_str.length);
              for (j = 0; j < temp_str.length; j++)
                ta[j] = temp_str.charCodeAt(j);
              output.push(ta);
              break;

            case MODE_ROMAN_AND_NUMBER:
              //canvas.println("Mode: Roman&Figure");
              temp_str = this.getRomanAndFigureString(dataLength);
              ta = Array(temp_str.length);
              for (j = 0; j < temp_str.length; j++)
                ta[j] = temp_str.charCodeAt(j);
              output.push(ta);
              //output.Write(SystemUtils.ToByteArray(temp_sbyteArray2), 0, temp_sbyteArray2.Length);
              break;

            case MODE_8BIT_BYTE:
              //canvas.println("Mode: 8bit Byte");
              //sbyte[] temp_sbyteArray3;
              let temp_sbyteArray3 = this.get8bitByteArray(dataLength);
              output.push(temp_sbyteArray3);
              //output.Write(SystemUtils.ToByteArray(temp_sbyteArray3), 0, temp_sbyteArray3.Length);
              break;

            case MODE_KANJI:
              //canvas.println("Mode: Kanji");
              //sbyte[] temp_sbyteArray4;
              //temp_sbyteArray4 = SystemUtils.ToSByteArray(SystemUtils.ToByteArray(getKanjiString(dataLength)));
              //output.Write(SystemUtils.ToByteArray(temp_sbyteArray4), 0, temp_sbyteArray4.Length);
              temp_str = this.getKanjiString(dataLength);
              output.push(temp_str);
              break;
          }
          //
          //canvas.println("DataLength: " + dataLength);
          //Console.out.println(dataString);
        } while (true);
        return output;
      });
    }


    // ====== END OF FILE: ==============================================================================================================
    // databr.js
    // ==================================================================================================================================



    // ====== START OF FILE: ============================================================================================================
    // qrcode.js
    // ==================================================================================================================================

    /*
     Copyright 2011 Lazar Laszlo (lazarsoft@gmail.com, www.lazarsoft.info)

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
     */



    lzl_code.imagedata = null;
    lzl_code.width = 0;
    lzl_code.height = 0;
    lzl_code.numSqrtArea = null;
    lzl_code.binarizeFactor = null;
    lzl_code.debug = false;



    lzl_code.isUrl = function (s) {
      let regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
      return regexp.test(s);
    };

    lzl_code.decode_url = function (s) {
      let escaped = "";
      try {
        escaped = window.escape(s);
      } catch (e) {
        console.log(e);
        escaped = s;
      }
      let ret = "";
      try {
        ret = decodeURIComponent(escaped);
      } catch (e) {
        console.log(e);
        ret = escaped;
      }
      return ret;
    };

    lzl_code.decode_utf8 = function (s) {
      if (lzl_code.isUrl(s)) {
        return lzl_code.decode_url(s);
      } else {
        return s;
      }
    };

    lzl_code.process = function (ctx) {
      //let start = new Date().getTime();
      let image = lzl_code.grayScaleToBitmap(lzl_code.grayscale());
      //let image = lzl_code.binarize(128);
      if (lzl_code.binarizeFactor) {
        image = lzl_code.binarize(lzl_code.binarizeFactor);
      }

      if (lzl_code.debug) {
        for (let y = 0; y < lzl_code.height; y++) {
          for (let x = 0; x < lzl_code.width; x++) {
            let point = (x * 4) + (y * lzl_code.width * 4);
            lzl_code.imagedata.data[point] = image[x + y * lzl_code.width] ? 0 : 0;
            lzl_code.imagedata.data[point + 1] = image[x + y * lzl_code.width] ? 0 : 0;
            lzl_code.imagedata.data[point + 2] = image[x + y * lzl_code.width] ? 255 : 0;
          }
        }
        ctx.putImageData(lzl_code.imagedata, 0, 0);
      }

      //let finderPatternInfo = new FinderPatternFinder().findFinderPattern(image);

      let detector = new Detector(image),
        qRCodeMatrix = detector.detect();

      /*for (let y = 0; y < qRCodeMatrix.bits.Height; y++)
       {
       for (let x = 0; x < qRCodeMatrix.bits.Width; x++)
       {
       let point = (x * 4*2) + (y*2 * lzl_code.width * 4);
       lzl_code.imagedata.data[point] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
       lzl_code.imagedata.data[point+1] = qRCodeMatrix.bits.get_Renamed(x,y)?0:0;
       lzl_code.imagedata.data[point+2] = qRCodeMatrix.bits.get_Renamed(x,y)?255:0;
       }
       }*/
      if (lzl_code.debug) {
        ctx.putImageData(lzl_code.imagedata, 0, 0);
      }

      let reader = Decoder.decode(qRCodeMatrix.bits),
        data = reader.DataByte,
        str = "";
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          str += String.fromCharCode(data[i][j]);
        }
      }


      //let time = new Date().getTime() - start;
      //console.log("decoding time (ms): " + time);

      return lzl_code.decode_utf8(str);
      //alert("Time:" + time + " Code: "+str);
    };

    lzl_code.getPixel = function (x, y) {
      if (lzl_code.width < x) {
        throw "point error";
      }
      if (lzl_code.height < y) {
        throw "point error";
      }
      let point = (x * 4) + (y * lzl_code.width * 4),
        p = (lzl_code.imagedata.data[point] * 33 + lzl_code.imagedata.data[point + 1] * 34 + lzl_code.imagedata.data[point + 2] * 33) / 100;
      return p;
    };

    lzl_code.binarize = function (th) {
      let ret = Array(lzl_code.width * lzl_code.height);
      for (let y = 0; y < lzl_code.height; y++) {
        for (let x = 0; x < lzl_code.width; x++) {
          let gray = lzl_code.getPixel(x, y);
          ret[x + y * lzl_code.width] = gray <= th ? true : false;
        }
      }
      return ret;
    };

    lzl_code.getMiddleBrightnessPerArea = function (image, numSqrtArea) {
      let ay,
        ax,
        dy,
        dx;
      numSqrtArea = lzl_code.numSqrtArea || 4;
      //obtain middle brightness((min + max) / 2) per area
      let areaWidth = Math.floor(lzl_code.width / numSqrtArea),
        areaHeight = Math.floor(lzl_code.height / numSqrtArea),
        minmax = Array(numSqrtArea);
      for (let i = 0; i < numSqrtArea; i++) {
        minmax[i] = Array(numSqrtArea);
        for (let i2 = 0; i2 < numSqrtArea; i2++) {
          minmax[i][i2] = [0, 0];
        }
      }
      for (ay = 0; ay < numSqrtArea; ay++) {
        for (ax = 0; ax < numSqrtArea; ax++) {
          minmax[ax][ay][0] = 0xFF;
          for (dy = 0; dy < areaHeight; dy++) {
            for (dx = 0; dx < areaWidth; dx++) {
              let target = image[areaWidth * ax + dx + (areaHeight * ay + dy) * lzl_code.width];
              if (target < minmax[ax][ay][0]) {
                minmax[ax][ay][0] = target;
              }
              if (target > minmax[ax][ay][1]) {
                minmax[ax][ay][1] = target;
              }
            }
          }
          //minmax[ax][ay][0] = (minmax[ax][ay][0] + minmax[ax][ay][1]) / 2;
        }
      }
      let middle = Array(numSqrtArea);
      for (let i3 = 0; i3 < numSqrtArea; i3++) {
        middle[i3] = Array(numSqrtArea);
      }
      for (ay = 0; ay < numSqrtArea; ay++) {
        for (ax = 0; ax < numSqrtArea; ax++) {
          middle[ax][ay] = Math.floor((minmax[ax][ay][0] + minmax[ax][ay][1]) / 2);
          //Console.out.print(middle[ax][ay] + ",");
        }
        //Console.out.println("");
      }
      //Console.out.println("");

      return middle;
    };

    lzl_code.grayScaleToBitmap = function (grayScale) {
      let middle = lzl_code.getMiddleBrightnessPerArea(grayScale),
        sqrtNumArea = middle.length,
        areaWidth = Math.floor(lzl_code.width / sqrtNumArea),
        areaHeight = Math.floor(lzl_code.height / sqrtNumArea),
        bitmap = Array(lzl_code.height * lzl_code.width);

      for (let ay = 0; ay < sqrtNumArea; ay++) {
        for (let ax = 0; ax < sqrtNumArea; ax++) {
          for (let dy = 0; dy < areaHeight; dy++) {
            for (let dx = 0; dx < areaWidth; dx++) {
              bitmap[areaWidth * ax + dx + (areaHeight * ay + dy) * lzl_code.width] = (grayScale[areaWidth * ax + dx + (areaHeight * ay + dy) * lzl_code.width] < middle[ax][ay]) ? true : false;
            }
          }
        }
      }
      return bitmap;
    };

    lzl_code.grayscale = function () {
      let ret = Array(lzl_code.width * lzl_code.height);
      for (let y = 0; y < lzl_code.height; y++) {
        for (let x = 0; x < lzl_code.width; x++) {
          let gray = lzl_code.getPixel(x, y);
          ret[x + y * lzl_code.width] = gray;
        }
      }
      return ret;
    };

    lzl_code.URShift = function (number, bits) {
      if (number >= 0) {
        return number >> bits;
      } else {
        return (number >> bits) + (2 << ~bits);
      }
    };

    lzl_code.remove = function (arr, from, to) {
      let rest = arr.slice((to || from) + 1 || arr.length);
      arr.length = from < 0 ? arr.length + from : from;
      return arr.push.apply(arr, rest);
    };

    lzl_code.decode = function (canvas_qr, debug, mode) {
      if (typeof lzl_code.debug !== "boolean") {
        lzl_code.debug = false;
      } else {
        lzl_code.debug = debug;
      }

      lzl_code.numSqrtArea = 24; // max = 32

      /*
       lzl_code.binarizeFactor = null;
       lzl_code.numSqrtArea = null;
       if (!!(mode) && mode) {
       if (Array.isArray(mode)) {
       mode = mode.join(",");
       }
       mode.split(",").forEach(function (el) {
       let modeSet = false;
       switch (el.trim()) {
       case "darken": // FIXME: "too much light" mode
       lzl_code.binarizeFactor = 64;
       modeSet = true;
       break;
       case "brighten": // FIXME: "too much darkness" mode (max = )
       lzl_code.binarizeFactor = 50;
       modeSet = true;
       break;
       case "sharpen": // increase precision (max = 32)
       lzl_code.numSqrtArea = 32;
       modeSet = true;
       break;
       case "unsharpen": //decrease precision (min = 2)
       lzl_code.numSqrtArea = 2;
       modeSet = true;
       break;
       default:

       }
       if (modeSet) {
       console.info("[lzl_code.decode] using mode: " + el);
       }
       });
       }
       */


      let context = canvas_qr.getContext('2d');
      lzl_code.width = canvas_qr.width;
      lzl_code.height = canvas_qr.height;
      lzl_code.imagedata = context.getImageData(0, 0, lzl_code.width, lzl_code.height);
      return lzl_code.process(context);
    };

    // ====== END OF FILE: ==============================================================================================================
    // qrcode.js
    // ==================================================================================================================================




  };

})('jsqrcode', this, this.Math, this.parseInt((void 0)), this.console, this.navigator, this.Array, this.document, this.Promise);
