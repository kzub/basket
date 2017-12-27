import "fetch-polyfill";

let model = {
	date: "-",
	time: "-",
	slots: []
};

let urlGetSlots = '/basket/api/game/slots';
let urlBookSlot = '/basket/api/game/book/';

function getServerData (url, opts, callback, real) {
	statusStartLoading();
	fetch(url, opts).then(function(response) {
		statusStopLoading();

		if(response.ok) {
			response.json().then(function(data) {
				callback(data);
			}).catch(function(error) {
				showErrorMessage('json parse error: ' + error.message);
			});
			return;
		}
		throw new Error('Network response was not ok.');
	}).catch(function(error) {
		showErrorMessage('There has been a problem with your fetch operation: ' + error.message);
	});
}

function fillGameDateTime(date, time) {
	$('#gameTime').text(time);
	$('#gameDate').text(date);
}

function fillPlayerNames(slots) {
	let buttons = $('.btn-player');
	let freeSlotExist;
	let pl = $('#players-list');

	for (let idx in model.slots) {
  	let slot = model.slots[idx];
  	let button = buttons[idx];
  	button.text = slot.player;
  	let cls = button.getAttribute('class');
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
	getServerData(urlGetSlots, {}, data => {
		for(let k in data){
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
	return slots.filter(s => s.status === 'booking').length > 0;
}

window.onload = () => {
	console.log('OK');

	// Playground contacts
	$('#button-address').on('click', e =>{
		$('#iframe-address').attr('src', 'https://www.manfit.ru/kontakty/');
		$('#modal-address').modal();		
	});
	
	// Success screen
	if (document.URL.indexOf('#success') > -1) {
		document.location = document.URL.replace('#success', '#');
		updatePlayersList(10);
		showMessage(
			'Оплата успешно совершена',
			`Вы появитесь в списке игроков, как только средства будут зачислены на наш счет.<br>
		   Будте в курсе изменений расписания, <a href="https://t.me/joinchat/CE3oJA6vM82vZHQXf03yyA">присоединяйтесь в канал телеграм</a>`
		);
	} else {
		updatePlayersList();
	}

	// Slot click
	$('.btn-player').on('click', el => {
		let slot = Number(el.target.getAttribute('slot'));
		let available = model.slots[slot].status == "free";
		if (available) {
			showPlayers(false);
			showPay(true);
		}
	});

	// Game date click
	$('#players-head').on('click', (el) => {
		showPay(false);
	});

	// Pay click
	$('#paybutton').on('click', el => {
		if (!validatePlayerFIO()) {
			showErrorMessage("Введите вашу фамилию и имя.<br>Эти данные нужны для прохода на площадку.");
			return;
		}
		let name = getPlayerFIO();
		getServerData(urlBookSlot + name, {}, result => {
			if (result.success && isFinite(result.gameId) && isFinite(result.playerId)) {
				console.log(result);
				let label = [result.gameId, result.playerId].join('|');
				$('#orderlabel').val(label);
				
				let target = $('#ordertarget');
				target.val([target.val(), result.gameId, result.playerId, name].join(' '));

				$('#submitform').submit();
			} else {
				showErrorMessage(result.error);
			}
		});
	});

	$('#successURL').val(clearHash(document.URL) + '#success');
};


function clearHash(url){
	let hash = url.indexOf('#');
	if (hash === -1) {
		return url;
	}
	return url.slice(0, hash);
}

function getPlayerFIO(){
	return $('#custom-fio').val();
}

function validatePlayerFIO() {
	let text = getPlayerFIO();
	if (!text) {
		return;
	}
	let parts = text.split(' ');
	if(parts.length < 2) {
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

function statusStartLoading(){
}

function statusStopLoading(){
}