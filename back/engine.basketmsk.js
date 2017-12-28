const arequest = require('async-request');
const extend = require('util')._extend;
const utils = require('./utils');

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

const urlGameAuth = 'http://basketmsk.ru/admin/index.php';
const urlGameExit = 'http://basketmsk.ru/admin/exit';
const urlGamePlayersList = 'http://basketmsk.ru/admin/games/registered/';
const urlGameAddPlayer = 'http://basketmsk.ru/admin/games/add_user/';
const urlGameDeletePlayer = 'http://basketmsk.ru/admin/games/registered/$GAME/delete/';
const urlGameModifyPlayer =  'http://basketmsk.ru/admin/games/user/';

const bookingEmail = "booking@zk.ru";
const payedEmail = "complete@zk.ru";
const playerTel = "+79154729813";

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

exports.getPlayers = async (gameId) =>{
  let res = await request(urlGamePlayersList + gameId);
  let playerList = [];
  let html = res.body.replace(/(<td>|<tr>)/g, '');
  let table = html.match(/<table(.*?)<\/table>/);
  if(!table) {
    console.log('ERROR getPlayers(): no game table for', gameId);
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
        sum: Number(p[7]),
        payed: (p[5] !== bookingEmail) // email оплаченого заказа может быть отличным
                                       // если забронировано в другой системе
      });
    }
  });

  return playerList.filter(p => p.sum > 0);
};

exports.addPlayer = async (gameId, player) => {
  let url = urlGameAddPlayer + gameId;
  let h = extend(headers, {
    'Content-Type': 'multipart/form-data'
  });
  let email = player.payed ? payedEmail : bookingEmail;

  await request(url, {
    method: 'POST',
    headers: h,
    data: {
      'form[value2]': player.firstName,
      'form[value3]': player.surName,
      'form[value4]': playerTel,
      'form[value5]': email,
      'form[value6]': player.sum,
      'ok': 'Submit'
    }
  });

  let players = await exports.getPlayers(gameId);
  let playerBookings = players.filter(p => utils.eq(p.firstName, player.firstName) &&
                                           utils.eq(p.surName, player.surName) &&
                                           p.email === email);
  if (playerBookings.length == 0) {
    console.log('ERROR addPlayer(): can not add player to database', gameId, player.id);
    return;
  };

  return playerBookings[0];
}

exports.deletePlayer = async (gameId, playerId) => {
  let url = urlGameDeletePlayer.replace('$GAME', gameId) + playerId;
  return request(url);
};

exports.updatePlayer = async (player, gameId) => {
  let url = urlGameModifyPlayer + player.id;
  let h = extend(headers, {
    'Content-Type': 'multipart/form-data'
  });

  let players = await exports.getPlayers(gameId);
  let dbPlayer = players.filter(p => p.id == player.id)[0];
  if (!dbPlayer) {
    console.log('ERROR updatePlayer(): no player in database', player.id);
    return;
  }

  let firstName = player.firstName || dbPlayer.firstName;
  let surName = player.surName || dbPlayer.surName;
  let tel = player.tel || dbPlayer.tel;
  let email = player.payed ? payedEmail : bookingEmail;
  let sum = player.sum || dbPlayer.sum;

  await request(url, {
    method: 'POST',
    headers: h,
    data: {
      'form[value1]': gameId,
      'form[value2]': firstName,
      'form[value3]': surName,
      'form[value4]': tel,
      'form[value5]': email,
      'form[value6]': sum,
      'ok': 'Submit'
    }
  });

  players = await exports.getPlayers(gameId);
  let writeCheck = players.filter(p =>
          p.id == player.id && p.firstName == firstName && p.surName == surName &&
          p.tel == tel && p.email == email && p.sum == sum);

  if (writeCheck.length == 0){
    console.log('ERROR updatePlayer(): can\'t update player in database', player.id);
    return;
  }
  return writeCheck[0];
};
