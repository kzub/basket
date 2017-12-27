/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(1);

var model = {
	date: "-",
	time: "-",
	slots: []
};

var urlGetSlots = '/basket/api/game/slots';
var urlBookSlot = '/basket/api/game/book/';

function getServerData(url, opts, callback, real) {
	statusStartLoading();
	fetch(url, opts).then(function (response) {
		statusStopLoading();

		if (response.ok) {
			response.json().then(function (data) {
				callback(data);
			}).catch(function (error) {
				showErrorMessage('json parse error: ' + error.message);
			});
			return;
		}
		throw new Error('Network response was not ok.');
	}).catch(function (error) {
		showErrorMessage('There has been a problem with your fetch operation: ' + error.message);
	});
}

function fillGameDateTime(date, time) {
	$('#gameTime').text(time);
	$('#gameDate').text(date);
}

function fillPlayerNames(slots) {
	var buttons = $('.btn-player');
	var freeSlotExist = void 0;
	var pl = $('#players-list');

	for (var idx in model.slots) {
		var slot = model.slots[idx];
		var button = buttons[idx];
		button.text = slot.player;
		var cls = button.getAttribute('class');
		cls = cls.replace(/disabled/g, '');

		if (slot.status == "free") {
			freeSlotExist = true;
			cls += ' btn-primary';
			button.setAttribute('class', cls);
		} else {
			cls += ' disabled btn-dark';
			button.setAttribute('class', cls);
		}
	}

	showMessageNoFreeSlots(!freeSlotExist);
}

function fillGamePrice(price) {
	if (isFinite(price)) {
		$('#pay-amount-title').text(price);
		$('#pay-amount-value').val(price);
	}
}

function showMessageNoFreeSlots(yes) {
	if (yes) {
		$('#noSlotsMessage').removeClass('hidden');
	} else {
		$('#noSlotsMessage').addClass('hidden');
	}
}

function updatePlayersList(n) {
	getServerData(urlGetSlots, {}, function (data) {
		for (var k in data) {
			model[k] = data[k];
		}
		fillPlayerNames(data.slots);
		fillGameDateTime(data.date, data.time);
		fillGamePrice(data.price);
		showPlayersOnce();

		if (n > 0 && hasBookingProcess(data.slots)) {
			setTimeout(updatePlayersList, 2000, n - 1);
		}
	});
}

function hasBookingProcess(slots) {
	return slots.filter(function (s) {
		return s.status === 'booking';
	}).length > 0;
}

window.onload = function () {
	console.log('OK');

	// Playground contacts
	$('#button-address').on('click', function (e) {
		$('#iframe-address').attr('src', 'https://www.manfit.ru/kontakty/');
		$('#modal-address').modal();
	});

	// Success screen
	if (document.URL.indexOf('#success') > -1) {
		document.location = document.URL.replace('#success', '#');
		updatePlayersList(10);
		showMessage('Оплата успешно совершена', "\u0412\u044B \u043F\u043E\u044F\u0432\u0438\u0442\u0435\u0441\u044C \u0432 \u0441\u043F\u0438\u0441\u043A\u0435 \u0438\u0433\u0440\u043E\u043A\u043E\u0432, \u043A\u0430\u043A \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432\u0430 \u0431\u0443\u0434\u0443\u0442 \u0437\u0430\u0447\u0438\u0441\u043B\u0435\u043D\u044B \u043D\u0430 \u043D\u0430\u0448 \u0441\u0447\u0435\u0442.<br>\n\t\t   \u0411\u0443\u0434\u0442\u0435 \u0432 \u043A\u0443\u0440\u0441\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0439 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044F, <a href=\"https://t.me/joinchat/CE3oJA6vM82vZHQXf03yyA\">\u043F\u0440\u0438\u0441\u043E\u0435\u0434\u0438\u043D\u044F\u0439\u0442\u0435\u0441\u044C \u0432 \u043A\u0430\u043D\u0430\u043B \u0442\u0435\u043B\u0435\u0433\u0440\u0430\u043C</a>");
	} else {
		updatePlayersList();
	}

	// Slot click
	$('.btn-player').on('click', function (el) {
		var slot = Number(el.target.getAttribute('slot'));
		var available = model.slots[slot].status == "free";
		if (available) {
			showPlayers(false);
			showPay(true);
		}
	});

	// Game date click
	$('#players-head').on('click', function (el) {
		showPay(false);
	});

	// Pay click
	$('#paybutton').on('click', function (el) {
		if (!validatePlayerFIO()) {
			showErrorMessage("Введите вашу фамилию и имя.<br>Эти данные нужны для прохода на площадку.");
			return;
		}
		var name = getPlayerFIO();
		getServerData(urlBookSlot + name, {}, function (result) {
			if (result.success && isFinite(result.gameId) && isFinite(result.playerId)) {
				console.log(result);
				var label = [result.gameId, result.playerId].join('|');
				$('#orderlabel').val(label);

				var target = $('#ordertarget');
				target.val([target.val(), result.gameId, result.playerId, name].join(' '));

				$('#submitform').submit();
			} else {
				showErrorMessage(result.error);
			}
		});
	});

	$('#successURL').val(clearHash(document.URL) + '#success');
};

function clearHash(url) {
	var hash = url.indexOf('#');
	if (hash === -1) {
		return url;
	}
	return url.slice(0, hash);
}

function getPlayerFIO() {
	return $('#custom-fio').val();
}

function validatePlayerFIO() {
	var text = getPlayerFIO();
	if (!text) {
		return;
	}
	var parts = text.split(' ');
	if (parts.length < 2) {
		return;
	}
	return true;
}

function showErrorMessage(msg) {
	$('#modal-title').text("Ошибка!");
	$('#modal-text').html(msg);
	$('#modal-window').modal();
}

function showMessage(title, msg, callback) {
	$('#modal-title').text(title);
	$('#modal-text').html(msg);
	$('#modal-window').modal();

	if (callback) {
		$('#modal-window').on('hidden.bs.modal', function (e) {
			if (callback) {
				callback();
			}
		});
	}
}

function showPlayers(yes) {
	if (yes) {
		$('#players.collapse').collapse('show');
	} else {
		$('#players.collapse').collapse('hide');
	}
}

var playersOnceShowed = false;
function showPlayersOnce() {
	if (!playersOnceShowed) {
		showPlayers(true);
		playersOnceShowed = true;
	}
}

function showPay(yes) {
	if (yes) {
		$('#pay.collapse').collapse('show');
	} else {
		$('#pay.collapse').collapse('hide');
	}
}

function statusStartLoading() {}

function statusStopLoading() {}

/***/ }),
/* 1 */
/***/ (function(module, exports) {

(function() {
  'use strict';

  if (self.fetch) {
    return
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = name.toString();
    }
    if (/[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(name)) {
      throw new TypeError('Invalid character in header field name')
    }
    return name.toLowerCase()
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = value.toString();
    }
    return value
  }

  function Headers(headers) {
    this.map = {}

    var self = this
    if (headers instanceof Headers) {
      headers.forEach(function(name, values) {
        values.forEach(function(value) {
          self.append(name, value)
        })
      })

    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(function(name) {
        self.append(name, headers[name])
      })
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name)
    value = normalizeValue(value)
    var list = this.map[name]
    if (!list) {
      list = []
      this.map[name] = list
    }
    list.push(value)
  }

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)]
  }

  Headers.prototype.get = function(name) {
    var values = this.map[normalizeName(name)]
    return values ? values[0] : null
  }

  Headers.prototype.getAll = function(name) {
    return this.map[normalizeName(name)] || []
  }

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name))
  }

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = [normalizeValue(value)]
  }

  // Instead of iterable for now.
  Headers.prototype.forEach = function(callback) {
    var self = this
    Object.getOwnPropertyNames(this.map).forEach(function(name) {
      callback(name, self.map[name])
    })
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return fetch.Promise.reject(new TypeError('Already read'))
    }
    body.bodyUsed = true
  }

  function fileReaderReady(reader) {
    return new fetch.Promise(function(resolve, reject) {
      reader.onload = function() {
        resolve(reader.result)
      }
      reader.onerror = function() {
        reject(reader.error)
      }
    })
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader()
    reader.readAsArrayBuffer(blob)
    return fileReaderReady(reader)
  }

  function readBlobAsText(blob) {
    var reader = new FileReader()
    reader.readAsText(blob)
    return fileReaderReady(reader)
  }

  var support = {
    blob: 'FileReader' in self && 'Blob' in self && (function() {
      try {
        new Blob();
        return true
      } catch(e) {
        return false
      }
    })(),
    formData: 'FormData' in self
  }

  function Body() {
    this.bodyUsed = false


    this._initBody = function(body) {
      this._bodyInit = body
      if (typeof body === 'string') {
        this._bodyText = body
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body
      } else if (!body) {
        this._bodyText = ''
      } else {
        throw new Error('unsupported BodyInit type')
      }
    }

    if (support.blob) {
      this.blob = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return fetch.Promise.resolve(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob')
        } else {
          return fetch.Promise.resolve(new Blob([this._bodyText]))
        }
      }

      this.arrayBuffer = function() {
        return this.blob().then(readBlobAsArrayBuffer)
      }

      this.text = function() {
        var rejected = consumed(this)
        if (rejected) {
          return rejected
        }

        if (this._bodyBlob) {
          return readBlobAsText(this._bodyBlob)
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as text')
        } else {
          return fetch.Promise.resolve(this._bodyText)
        }
      }
    } else {
      this.text = function() {
        var rejected = consumed(this)
        return rejected ? rejected : fetch.Promise.resolve(this._bodyText)
      }
    }

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode)
      }
    }

    this.json = function() {
      return this.text().then(function (text) {
          return JSON.parse(text);
      });
    }

    return this
  }

  // HTTP methods whose capitalization should be normalized
  var methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT']

  function normalizeMethod(method) {
    var upcased = method.toUpperCase()
    return (methods.indexOf(upcased) > -1) ? upcased : method
  }

  function Request(url, options) {
    options = options || {}
    this.url = url

    this.credentials = options.credentials || 'omit'
    this.headers = new Headers(options.headers)
    this.method = normalizeMethod(options.method || 'GET')
    this.mode = options.mode || null
    this.referrer = null

    if ((this.method === 'GET' || this.method === 'HEAD') && options.body) {
      throw new TypeError('Body not allowed for GET or HEAD requests')
    }
    this._initBody(options.body)
  }

  function decode(body) {
    var form = new FormData()
    body.trim().split('&').forEach(function(bytes) {
      if (bytes) {
        var split = bytes.split('=')
        var name = split.shift().replace(/\+/g, ' ')
        var value = split.join('=').replace(/\+/g, ' ')
        form.append(decodeURIComponent(name), decodeURIComponent(value))
      }
    })
    return form
  }

  function headers(xhr) {
    var head = new Headers()
    var pairs = xhr.getAllResponseHeaders().trim().split('\n')
    pairs.forEach(function(header) {
      var split = header.trim().split(':')
      var key = split.shift().trim()
      var value = split.join(':').trim()
      head.append(key, value)
    })
    return head
  }

  var noXhrPatch =
    typeof window !== 'undefined' && !!window.ActiveXObject &&
      !(window.XMLHttpRequest && (new XMLHttpRequest).dispatchEvent);

  function getXhr() {
    // from backbone.js 1.1.2
    // https://github.com/jashkenas/backbone/blob/1.1.2/backbone.js#L1181
    if (noXhrPatch && !(/^(get|post|head|put|delete|options)$/i.test(this.method))) {
      this.usingActiveXhr = true;
      return new ActiveXObject("Microsoft.XMLHTTP");
    }
    return new XMLHttpRequest();
  }

  Body.call(Request.prototype)

  function Response(bodyInit, options) {
    if (!options) {
      options = {}
    }

    this._initBody(bodyInit)
    this.type = 'default'
    this.url = null
    this.status = options.status
    this.ok = this.status >= 200 && this.status < 300
    this.statusText = options.statusText
    this.headers = options.headers instanceof Headers ? options.headers : new Headers(options.headers)
    this.url = options.url || ''
  }

  Body.call(Response.prototype)

  self.Headers = Headers;
  self.Request = Request;
  self.Response = Response;

  self.fetch = function(input, init) {
    // TODO: Request constructor should accept input, init
    var request
    if (Request.prototype.isPrototypeOf(input) && !init) {
      request = input
    } else {
      request = new Request(input, init)
    }

    return new fetch.Promise(function(resolve, reject) {
      var xhr = getXhr();
      if (request.credentials === 'cors') {
        xhr.withCredentials = true;
      }

      function responseURL() {
        if ('responseURL' in xhr) {
          return xhr.responseURL
        }

        // Avoid security warnings on getResponseHeader when not allowed by CORS
        if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
          return xhr.getResponseHeader('X-Request-URL')
        }

        return;
      }

      function onload() {
        if (xhr.readyState !== 4) {
          return
        }
        var status = (xhr.status === 1223) ? 204 : xhr.status
        if (status < 100 || status > 599) {
          reject(new TypeError('Network request failed'))
          return
        }
        var options = {
          status: status,
          statusText: xhr.statusText,
          headers: headers(xhr),
          url: responseURL()
        }
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        resolve(new Response(body, options))
      }
      xhr.onreadystatechange = onload;
      if (!self.usingActiveXhr) {
        xhr.onload = onload;
        xhr.onerror = function() {
          reject(new TypeError('Network request failed'))
        }
      }

      xhr.open(request.method, request.url, true)

      if ('responseType' in xhr && support.blob) {
        xhr.responseType = 'blob'
      }

      request.headers.forEach(function(name, values) {
        values.forEach(function(value) {
          xhr.setRequestHeader(name, value)
        })
      })

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit)
    })
  }
  fetch.Promise = self.Promise; // you could change it to your favorite alternative
  self.fetch.polyfill = true
})();


/***/ })
/******/ ]);