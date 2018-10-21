import "fetch-polyfill";
require('./css/styles.css');

const model = {
	selectedGame: 0
};

const urlGetSlots = '/api/game/slots';
const urlBookSlot = '/api/game/book';

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

function fillUsedSlots(id, slots){
	let used = slots.filter(s => s.status !== "free").length;
	$(`[game*=${id}].slotsUsed`).text(`${used}/${slots.length}`);
}

function fillGameDateTime(id, date, time) {
	$(`[game*=${id}].gameTime`).text(time);
	$(`[game*=${id}].gameDate`).text(date);
}

function fillPlayerNames(id, slots) {
	let buttons = $(`[game*=${id}].btn-player`);
	let freeSlotExist;
	let pl = $(`[game*=${id}].players-list`);

	for (let idx in slots) {
  	let slot = slots[idx];
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

  showMessageNoFreeSlots(id, !freeSlotExist);
}

function setGameInfo(game) {
	model.selectedGame = game.gameId;
	let price = isFinite(game.price) ? game.price : 0;
	$('#pay-amount-title').text(price);
	$('#pay-amount-value').val(price);
	$('#pay-game-info-date').text(game.date);
	$('#pay-game-info-time').text(game.time);

	if (game.organizer) {
		$('#pay-game-org-name').text(game.organizer);
		$('#pay-game-org-phone').text(game.organizerPhone);
		$('#pay-game-organizer').show();
	} else {
		$('#pay-game-organizer').hide();
	}

	if (game.payOnSite) {
		$('#pay-amount-card-title').hide();
		$('#paybutton').text('Оплата на площадке');
	} else {
		$('#pay-amount-card-title').show();
		$('#paybutton').text('Оплатить');
	}
}

function showMessageNoFreeSlots(id, yes) {
	if (yes) {
		$(`[game*=${id}].noSlotsMessage`).removeClass('hidden');
	} else {
		$(`[game*=${id}].noSlotsMessage`).addClass('hidden');
	}
}

function updatePlayersList(n) {
	getServerData(urlGetSlots, {}, data => {
		for(let k in data){
			model[k] = data[k];
		}

		hideAllGames();
		let maxGames = 3;
		for (let id in data.games) {
			if (0 === maxGames--) {
				break;
			}
			enableGame(id);
			setGameOrganizer(id, data.games[id]);
			fillPlayerNames(id, data.games[id].slots);
			fillGameDateTime(id, data.games[id].date, data.games[id].time);
			fillUsedSlots(id, data.games[id].slots);
		}

		if (data.games.length == 1) {
			showPlayersOnce();
		}

		if (n > 0 && hasBookingProcess(data.games)) {
			setTimeout(updatePlayersList, 2000, n - 1);
		}
	});
}

function hasBookingProcess(games) {
	for (let game of games) {
		if (game.slots.filter(s => s.status === 'booking').length > 0) {
			return true;
		}
	}
	return false;
}

function hideAllGames() {
	$('.game-item').addClass('hidden')
}

function enableGame(id) {
	$(`[game*=${id}].game-item`).removeClass('hidden')
}

function setGameOrganizer(id, game) {
	if (game.organizer) {
		$(`[game*=${id}].game-pl-organizer`).removeClass('hidden');
		$(`[game*=${id}].game-pl-org-name`).text(game.organizer);
		$(`[game*=${id}].game-pl-org-phone`).text(game.organizerPhone);
	} else {
		$(`[game*=${id}].game-pl-organizer`).addClass('hidden');
	}
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
		let num = Number(el.target.getAttribute('game'));
		let game = model.games[num];
		console.log(model)
		let available = game.slots[slot].status == "free";
		if (available) {
			setGameInfo(game);
			showPlayers(false, num);
			showPay(true);
		}
	});

	restoreUserInputOnPay();
	// Pay click
	$('#paybutton').on('click', el => {
		if (!validatePlayerFIO()) {
			showErrorMessage("Введите вашу фамилию и имя.<br>Эти данные нужны для прохода на площадку.");
			return;
		}
		if (!validatePlayerPhone()) {
			showErrorMessage("Введите телефон для связи.<br>В случае непредвиденной отмены игры, организатор сможет вас предупредить.");
			return;
		}

		let name = getPlayerFIO();
		let phone = getPlayerPhone();
		storeUserInputOnPay(name, phone);

		let code = document.location.search.replace(/(\?|&|\/|\s)/g, '');
		getServerData(`${urlBookSlot}/${model.selectedGame}/${name}/${phone}/${code}`, {}, result => {
			if (result.success && isFinite(result.gameId) && isFinite(result.playerId)) {
				console.log(result);
				let label = [result.gameId, result.playerId].join('|');
				$('#orderlabel').val(label);

				let target = $('#ordertarget');
				target.val([target.val(), result.gameId, result.playerId, name].join(' '));

				if(result.payed){
					showMessage('Информация', 'Запись произведена!');
				} else {
					$('#submitform').submit();
				}
			} else {
				showErrorMessage(result.error);
			}
		});
	});

	$('#successURL').val(clearHash(document.URL) + '#success');

	document.addEventListener('copy', copyPlayers);
};

function copyPlayers (e) {
	let players = model.games[0].slots.map(e => e.player).join('\n');
  e.clipboardData.setData('text/plain', players);
  e.clipboardData.setData('text/html', players);
  e.preventDefault(); // We want our data, not data from any selection, to be written to the clipboard
}

function clearHash(url){
	let hash = url.indexOf('#');
	if (hash === -1) {
		return url;
	}
	return url.slice(0, hash);
}

function getPlayerFIO(){
	let val = $('#custom-fio').val();
	if (typeof val === 'string') {
		return val.replace(/\//g, '');
	}
}

function getPlayerPhone(){
	let val = $('#custom-phone').val();
	if (typeof val === 'string') {
		return val.replace(/\//g, '');
	}
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

function validatePlayerPhone() {
	let text = getPlayerPhone();
	if (!text) {
		return;
	}

	if(text.length < 10) {
		return;
	}
	return true;
}

function storeUserInputOnPay(name, phone) {
	localStorage.fio = name;
	localStorage.phone = phone;
}

function restoreUserInputOnPay() {
	if (localStorage.fio) {
		$('#custom-fio').val(localStorage.fio);
	}

	if (localStorage.phone) {
		$('#custom-phone').val(localStorage.phone);
	}
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

function showPlayers(yes, id) {
	let filter = isFinite(id) ? `[game*=${id}]` : '';
	if (yes) {
		$(`${filter}.players.collapse`).collapse('show');
	} else {
		$(`${filter}.players.collapse`).collapse('hide');
	}
}

var playersOnceShowed = false;
function showPlayersOnce() {
	if (!playersOnceShowed) {
		showPlayers(true, 0);
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