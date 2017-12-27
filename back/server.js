const express = require('express');
const arequest = require('async-request');
const extend = require('util')._extend;
const bodyParser = require('body-parser');

const bot = require('./telegram_bot');
const utils = require('./utils');

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const headers = {
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
	'Accept-Encoding':'gzip, deflate',
	'Accept-Language':'en-US,en;q=0.9,ru;q=0.8',
	'Cache-Control':'no-cache',
	'Connection':'keep-alive',
	'Host':'basketmsk.ru',
	'Pragma':'no-cache',
	'Upgrade-Insecure-Requests':'1',
	'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
	'Cookie': 'PHPSESSID=9f5c4ca5595b68f9b74fc02f6e3aa909'
};

const autoCancelation = require('./autoCancelation');

const urlGameAuth = 'http://basketmsk.ru/admin/index.php';
const urlGameExit = 'http://basketmsk.ru/admin/exit';
const urlGamePlayersList = 'http://basketmsk.ru/admin/games/registered/';
const urlGameAddPlayer = 'http://basketmsk.ru/admin/games/add_user/';
const urlGameDeletePlayer = 'http://basketmsk.ru/admin/games/registered/$GAME/delete/';
const urlGameModifyPlayer =  'http://basketmsk.ru/admin/games/user/';

async function request(url, opts) {
	console.log('=>', url);
	let opts2 = extend({}, opts);
	opts2.headers = extend(headers, opts2.headers);
	opts2.headers.Referer = url;
	let res = await arequest(url, opts2);
	let needAuth = res.body.indexOf('/admin/index.php') > -1;
	if (needAuth) {
		await arequest(urlGameExit, { headers: headers });
		let auth = await makeAuth();
		headers.Cookie = auth.headers['set-cookie'][0].split(';')[0];
		console.log('auth', headers.Cookie);
		res = await arequest(url, opts2);
	}
	return res;
}

async function makeAuth(){
	return arequest(urlGameAuth, {
		method: 'POST',
		data: {
			'form[value1]': 'guest',
			'form[value2]': '27051983'  // DO NO PUSH IT
		}
	});
}

async function getPlayers(gameId){
	try {
		let res = await request(urlGamePlayersList + gameId);
		let playerList = [];
		let html = res.body.replace(/(<td>|<tr>)/g, '');
		let table = html.match(/<table(.*?)<\/table>/);
		if(!table) {
			return [];
		}
		table = table[0].replace(/(<table(.*?)>|<\/table>)/g, '');

		let players = table.split('<\/tr>');
		players.forEach((pl, id) => {
			if (id == 0 ){
				return;
			}
			let p = pl.split('</td>');
			if (p.length == 12){
				playerList.push({
					id: Number(p[0]),
					firstName: p[2],
					surName: p[3],
					tel: p[4],
					email: p[5],
					pay: Number(p[7]),
				});
			}
		});

		return playerList.filter( p => p.pay > 0);
	} catch(e) {
		console.log('error:', e);
	}
}

async function addPlayer(gameId, player) {
	let url = urlGameAddPlayer + gameId;
	let h = extend(headers, {
		'Content-Type': 'multipart/form-data'
	})
	return request(url, {
		method: 'POST',
		headers: h,
		data: {
			'form[value2]': player.firstName,
			'form[value3]': player.surName,
			'form[value4]': player.tel,
			'form[value5]': player.email,
			'form[value6]': player.pay,
			'ok': 'Submit'
		}
	});
}

async function deletePlayer(gameId, playerId) {
	let url = urlGameDeletePlayer.replace('$GAME', gameId) + playerId;
	return request(url);
}

async function updatePlayer(gameId, player) {
	let url = urlGameModifyPlayer + player.id;
	let h = extend(headers, {
		'Content-Type': 'multipart/form-data'
	});
	return request(url, {
		method: 'POST',
		headers: h,
		data: {
			'form[value1]': gameId,
			'form[value2]': player.firstName,
			'form[value3]': player.surName,
			'form[value4]': player.tel,
			'form[value5]': player.email,
			'form[value6]': player.pay,
			'ok': 'Submit'
		}
	});
}

function makeError(msg) {
	printError.apply(this, arguments);
	return {
		error: msg
	};
}

function printError(msg) {
	bot.send('owner', `Error: ${msg}`);
	let args = [];
	for (let key in arguments) {
		args.push(arguments[key]);
	}
	args.unshift('Error:');
	console.log.apply(this, args);
}

function eq(s1, s2) {
	return s1 && s2 && s1.toLowerCase() == s2.toLowerCase();
}

app.get('/', function (req, res) {
	res.status(404).send('NotFound\n');
});

app.get('/game/:id', async function (req, res) {
	try {
		res.send(await getPlayers(req.params.id));
	} catch(e) {
		console.log('/game/:id error:', req.params, e);
		res.status(500).send('Internal Error\n');
	}
});

app.get('/basket/api/game/slots', async function (req, res) {
	try {
		console.log('GAME GET SLOTS ->');
		let settings = await utils.getGameSettings();
		let players = await getPlayers(settings.gameId);
		let slots = [];
		players.reverse();

		for (let idx = 0; idx < settings.maxPlayers; idx++) {
			let p = players[idx];
			if (p) {
				if (p.email == "booking@zk.ru") {
					slots.push({"status":"booking", "player":"В процессе оплаты"});
				} else {
					slots.push({"status":"used", "player":`${p.firstName} ${p.surName}`});
				}
			} else {
				slots.push({"status":"free", "player":"Забронировать"});
			}
		}

		console.log(`OK game ${settings.gameId} - ${players.length}/${slots.length}`);
		res.send({
			gameId: settings.gameId,
			date: settings.date,
			time: settings.time,
			price: settings.price,
			slots: slots
		});
	} catch(e) {
		res.status(500).send(
			makeError('/api/game/slots', e));
	}
});

app.get('/basket/api/game/book/:name', async function (req, res) {
	try {
		console.log('GAME BOOK SLOT ->');

		let settings = await utils.getGameSettings();
		let players = await getPlayers(settings.gameId);

		let parts = req.params.name.split(' ');
		let firstName = parts[0];
		let surName = parts[1];
		if (parts.length < 2){
			res.send(
				makeError('Ошибка входных данных!', req.params));
			return;
		}

		let playerBookings = players.filter(p => eq(p.firstName, firstName) &&
			eq(p.surName, surName) &&
			p.email == 'booking@zk.ru');
		if(playerBookings.length == 0) {
			if (players.length >= settings.maxPlayers) {
				res.send(
					makeError('Свободных мест нет!', settings.maxPlayers, players));
				return;
			}

			console.log('MAKE booking', firstName, surName);
			await addPlayer(settings.gameId, {
				firstName: firstName,
				surName: surName,
				tel: '+79154729813',
				email: 'booking@zk.ru',
				pay: settings.priceBookEngine
			});

			players = await getPlayers(settings.gameId);
			playerBookings = players.filter(p => eq(p.firstName, firstName) &&
				eq(p.surName, surName) &&
				p.email == 'booking@zk.ru');
			if (playerBookings.length == 0) {
				res.send(
					makeError('Регистрация не удалась!', players));
				return;
			}
		} else {
			console.log('CONTINUE booking process with existing booking', firstName, surName);
		}

		player = playerBookings[0];

		res.send({
			gameId: settings.gameId,
			playerId: player.id,
			success: true
		});

		let freeSlots = settings.maxPlayers - players.length;
		bot.send('owner', `Book ok: ${settings.gameId}/${player.id} ${player.firstName} ${player.surName} slots: ${freeSlots}`);
		autoCancelation.add(settings.gameId, player, deletePlayer);
		console.log(`BOOK OK game ${settings.gameId} - ${player.id} ${player.firstName} ${player.surName}`);
	} catch(e) {
		res.status(500).send(
			makeError('/api/game/book', req.params, e));
	}
});

app.post('/basket/api/game/payment/complete', async function (req, res) {
	try {
		console.log('PAY NOTIFICATION ->');
		console.log(req.body);
		res.send('OK');

		let settings = await utils.getGameSettings();
		let parts = req.body.label.split('|');
		let gameId = parts[0];
		let playerId = parts[1];

		if(settings.gameId != gameId) {
			printError('Wrong game id in payment! current is:' + settings.gameId);
			return;
		}
		let players = await getPlayers(gameId);
		let playerBookings = players.filter(p => p.id == playerId && p.email == 'booking@zk.ru');

		if(playerBookings.length == 0) {
			printError(`Player ${gameId}/${playerId} has no bookings!`, players);
			return;
		}
		let player = playerBookings[0];

		await updatePlayer(settings.gameId, {
			id: player.id,
			firstName: player.firstName,
			surName: player.surName,
			tel: player.tel,
			email: 'k.zubkov@bk.ru',
			pay: settings.priceBookEngine
		});

		players = await getPlayers(settings.gameId);
		playerBookings = players.filter(p => p.id == playerId);
		player = playerBookings[0];

		if(player.email != 'k.zubkov@bk.ru'){
			printError(`Cannot update player email ${gameId}/${playerId}`, players);
			return;
		}

		let amount = req.body.withdraw_amount;
		let freeSlots = settings.maxPlayers - players.length;
		bot.send('owner', `Pay ok: ${settings.gameId}/${player.id} ${player.firstName} ${player.surName} ${amount} руб.`);
		bot.send('channel', `${player.firstName} ${player.surName} записался на игру\r\nСвободных мест: ${freeSlots}`);
		autoCancelation.del(settings.gameId, player);
		console.log('OK', playerId, player.firstName, player.surName, amount);
	} catch(e) {
		res.status(500).send(
			makeError('/api/game/payment/complete', req.body, e));
	}
});

console.log('TODO: проверка денег')
app.listen(3000);

// updatePlayer(659,{
// 	id: 6327,
// 	firstName: 'Смирнов',
// 	surName: 'Семен',
// 	tel: '+79154729800',
// 	email: 'k.zubkov@bk.ru',
// 	pay: 20
// }).then(r=>{
// 	console.log(r)
// }).catch(e => {
// 	console.log(e)
// });


// addPlayer(659,{
// 	firstName: 'Смирнов',
// 	surName: 'Семен',
// 	tel: '+79154729813',
// 	email: 'k.zubkov@bk.ru',
// 	pay: 250
// }).then(r=>{
// 	// console.log(r)
// }).catch(e => {
// 	console.log(e)
// })

// deletePlayer(659, 6326);

// getPlayers(659).then(r => {
// 	console.log(r);
// })
