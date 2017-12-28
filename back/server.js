const express = require('express');
const bodyParser = require('body-parser');
const bot = require('./telegram_bot');
const utils = require('./utils');
const config = utils.getConfig();
const smtpEvents = require('./smtp_server');

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

const autoCancelation = require('./autoCancelation');
const engines = {
  basketmsk: require('./engine.basketmsk')
};

app.get('/', function (req, res) {
  res.status(404).send('Not Found\n');
});

app.get('/api/game/slots', async function (req, res) {
  try {
    console.log('GAME GET SLOTS ->');
    let game = await utils.getGameSettings();
    let engine = engines[game.engine];
    let players = await engine.getPlayers(game.id);
    let slots = [];
    players.reverse();

    for (let idx = 0; idx < game.maxPlayers; idx++) {
      let p = players[idx];
      if (p && p.payed) {
        slots.push({"status":"used", "player":`${p.firstName} ${p.surName}`});
      } else if(p) {
        slots.push({"status":"booking", "player":"В процессе оплаты"});
      } else {
        slots.push({"status":"free", "player":"Забронировать"});
      }
    }

    console.log(`OK game ${game.id} - ${players.length}/${slots.length}`);
    res.send({
      gameId: game.id,
      date: game.date,
      time: game.time,
      price: game.price,
      slots: slots
    });
  } catch(e) {
    res.status(500).send(
      makeError('/api/game/slots', e));
  }
});

app.get('/api/game/book/:name/:phone', async function (req, res) {
  try {
    console.log('GAME BOOK SLOT ->');

    let game = await utils.getGameSettings();
    let engine = engines[game.engine];
    let players = await engine.getPlayers(game.id);

    let [firstName, surName] = req.params.name.split(' ');
    if (!firstName || !surName) {
      res.send(
        makeError('Ошибка входных данных! Имя Фамилия', req.params));
      return;
    }

    let tel = req.params.phone;
    if (!tel) {
      res.send(
        makeError('Ошибка входных данных! Телефон', req.params));
      return;
    }

    let player;
    let playerBookings = players.filter(p => !p.payed && utils.eq(p.firstName, firstName) &&
                                                         utils.eq(p.surName, surName));
    if(playerBookings.length > 0) {
      console.log('CONTINUE booking process with existing booking', firstName, surName);
      player = playerBookings[0];
    } else {
      if (players.length >= game.maxPlayers) {
        res.send(
          makeError('Свободных мест нет!', game.maxPlayers, players));
        return;
      }

      console.log('MAKE booking', firstName, surName, tel);
      player = await engine.addPlayer(game.id, {
        firstName: firstName,
        surName: surName,
        tel: tel,
        sum: game.priceBookEngine
      });

      if (!player) {
        res.send(
          makeError('Регистрация не удалась!', players));
        return;
      }
    }

    res.send({
      gameId: game.id,
      playerId: player.id,
      success: true
    });

    let freeSlots = game.maxPlayers - players.length;
    bot.send('owner', `Book ok: ${game.id}/${player.id} ${player.firstName} ${player.surName} ${tel} slots: ${freeSlots}`);
    autoCancelation.add(game.id, player, engine.deletePlayer);
    console.log(`BOOK OK game ${game.id} - ${player.id} ${player.firstName} ${player.surName} ${tel}`);
  } catch(e) {
    res.status(500).send(
      makeError('/api/game/book', req.params, e));
  }
});

app.post('/api/game/payment/complete', async function (req, res) {
  try {
    console.log('PAY NOTIFICATION ->');
    console.log(req.body);
    res.send('OK');

    let game = await utils.getGameSettings();
    let engine = engines[game.engine];
    let [gameId, playerId] = req.body.label.split('|');

    if(game.id != gameId) {
      printError('Wrong game id in payment! current is:' + game.id);
      return;
    }
    let players = await engine.getPlayers(gameId);
    let playerBookings = players.filter(p => p.id == playerId && !p.payed);

    if(playerBookings.length == 0) {
      printError(`Player ${gameId}/${playerId} has no bookings!`, players);
      return;
    }
    let player = playerBookings[0];

    let ok = await engine.updatePlayer({
      id: player.id,
      sum: game.priceBookEngine,
      payed: true
    }, game.id);

    if(!ok){
      printError(`Cannot update player email ${gameId}/${playerId}`, players);
      return;
    }

    let amount = req.body.withdraw_amount;
    let freeSlots = game.maxPlayers - players.length;
    bot.send('owner', `Pay ok: ${game.id}/${player.id} ${player.firstName} ${player.surName} ${amount} руб.`);
    bot.send('channel', `${player.firstName} ${player.surName} записался на игру\r\nСвободных мест: ${freeSlots}`);
    autoCancelation.del(game.id, player);
    console.log('OK', playerId, player.firstName, player.surName, amount);
  } catch(e) {
    res.status(500).send(
      makeError('/api/game/payment/complete', req.body, e));
  }
});

console.log('TODO: качнуть базу игроков');
console.log('TODO: проверка денег');
console.log('TODO: убрать номер телефона и почту в конфиг');

app.listen(config.server.port);
console.log(`listen on ${config.server.port}`);

// listen for events new from baskmsk system
smtpEvents.addHandler(async () => {
  let game = await utils.getGameSettings();
  if (game.engine != 'basketmsk') {
    printError('Some shit with game settings', game.engine);
    return;
  }

  let players = await engines.basketmsk.getPlayers(game.id);
  let last = players.filter(p => p.payed)[0];
  if (!last) {
    printError('Some shit with game settings', game.engine, game.id);
    return;
  }

  let freeSlots = game.maxPlayers - players.length;
  bot.send('channel', `${last.firstName} ${last.surName} записался на игру\r\nСвободных мест: ${freeSlots}`);
});

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

