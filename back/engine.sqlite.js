const extend = require('util')._extend;
const utils = require('./utils');
const config = utils.getConfig();

let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(config.sqlite.filename);
console.log('config.sqlite.filename:', config.sqlite.filename);

db.serialize();
db.run('CREATE TABLE IF NOT EXISTS bookings (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, date TEXT, ' +
  'gameId INT, firstName TEXT, surName TEXT, tel TEXT, sum INT, payed INT)');
db.run('CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, ' +
  'placeId INTEGER NOT NULL, maxPlayers INTEGER NOT NULL, price INTEGER NOT NULL, date DATETIME NOT NULL, ' +
  'time TEXT NOT NULL, props TEXT NOT NULL DEFAULT \'{}\')');
db.run('CREATE TABLE IF NOT EXISTS places (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, metro TEXT NOT NULL, name TEXT NOT NULL, link TEXT)');
// db.close();

const dbSelect = (query, ...rest) => {
  console.log(query);
  return new Promise(function (fulfill, reject){
    db.all(query, ...rest, function (err, res){
      if (err) reject(err);
      else fulfill(res);
    });
  });
};

const dbExec = (query, ...rest) => {
  console.log(query);
  return new Promise(function (fulfill, reject){
    db.run(query, ...rest, function (err){
      if (err) reject(err);
      else fulfill(this);
    });
  });
};

exports.getPlayers = async (gameId) => {
  let players = await dbSelect(`SELECT * FROM bookings WHERE gameId = ${gameId} ORDER BY date DESC`);
  let playerList = players.map((p) => {
    return {
      id: p.id,
      firstName: p.firstName,
      surName: p.surName,
      tel: p.tel,
      sum: Number(p.sum),
      payed: Number(p.payed),
    };
  });

  return playerList;
};

exports.addPlayer = async (gameId, player) => {
  const query = 'INSERT INTO bookings (date, gameId, firstName, surName, tel, sum, payed) ' +
    `VALUES(datetime("now"), ${gameId}, '${player.firstName}', '${player.surName}', '${player.tel}',` +
    `${Number(player.sum)}, ${Number(player.payed)})`;

  let { lastID } = await dbExec(query);
  let newPlayer = extend({ id: lastID }, player);
  return newPlayer;
};

exports.deletePlayer = async (gameId, playerId) => {
  const query = `DELETE FROM bookings WHERE gameId = ${gameId} AND id = ${playerId}`;

  let { changes } = await dbExec(query);
  return changes;
};

exports.updatePlayer = async (gameId, player) => {
  let fields = '';

  if (player.firstName) {
    fields += `, firstName = '${player.firstName}'`;
  }
  if (player.surName) {
    fields += `, surName = '${player.surName}'`;
  }
  if (player.tel) {
    fields += `, tel = '${player.tel}'`;
  }
  if (player.payed !== undefined) {
    fields += `, payed = ${Number(player.payed)}`;
  }
  if (player.sum !== undefined) {
    fields += `, sum = ${Number(player.sum)}`;
  }
  const query = `UPDATE bookings SET date = datetime("now") ${fields} WHERE gameId = ${gameId} AND id = ${player.id}`;

  let { changes } = await dbExec(query);
  return changes;
};

exports.getGames = async () => {
  const today = new Date();
  today.setSeconds(59);
  today.setMinutes(59);
  today.setHours(23);

  let games = await dbSelect(`SELECT g.id as gameId, * FROM games g LEFT JOIN places p ON g.id = p.id ` +
    `WHERE date > ${today.valueOf()} ORDER BY date DESC`);

  return games.map(game => gameMapper(game));;
};

exports.getGame = async (id) => {
  let [game] = await dbSelect(`SELECT g.id as gameId, * FROM games g LEFT JOIN places p ON g.id = p.id ` +
    `WHERE g.id = ${id} ORDER BY date DESC`);
  return gameMapper(game);
};

function gameMapper(game) {
  return {
    id: Number(game.gameId),
    place: {
      metro: game.metro || '',
      name: game.name || '',
      link: game.link || '',
    },
    maxPlayers: Number(game.maxPlayers),
    price: Number(game.price),
    date: utils.getBeautifulDate(game.date),
    time: game.time,
    props: JSON.parse(game.props),
  };
}

// async function main (){
//   // db.run('INSERT INTO games VALUES(1, "z", "k", 100)');
//   try{
//     let r = await exports.getGames();
//     console.log(r);
//   }catch (e) {
//     console.log(e);
//   }
// }
// main(); 

