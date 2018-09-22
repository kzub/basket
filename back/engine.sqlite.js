const extend = require('util')._extend;
const utils = require('./utils');
const config = utils.getConfig();

let sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database(config.sqlite.filename);
console.log('config.sqlite.filename', config.sqlite.filename);

db.serialize();
db.run('CREATE TABLE IF NOT EXISTS games (date TEXT, gameId INT, firstName TEXT, surName TEXT, ' +
  'tel TEXT, sum INT, payed INT)');
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
    db.run(query, ...rest, function (err, res){
      if (err) reject(err);
      else fulfill(this);
    });
  });
};

exports.getPlayers = async (gameId) => {
  let players = await dbSelect(`SELECT ROWID, * FROM games WHERE gameId = ${gameId} ORDER BY date DESC`);
  let playerList = players.map((p) => {
    return {
      id: p.rowid,
      firstName: p.firstName,
      surName: p.surName,
      tel: p.tel,
      sum: Number(p.sum),
      payed: Number(p.payed),
    }
  });

  return playerList;
};

exports.addPlayer = async (gameId, player) => {
  const query = `INSERT INTO games VALUES(datetime("now"), ${gameId}, "${player.firstName}", ` +
    `"${player.surName}", "${player.tel}", ${Number(player.sum)}, ${Number(player.payed)})`;

  let { lastID } = await dbExec(query);
  let newPlayer = extend({ id: lastID }, player);
  return newPlayer;
}

exports.deletePlayer = async (gameId, playerId) => {
  const query = `DELETE FROM games WHERE gameId = ${gameId} AND ROWID = ${playerId}`;

  let { changes } = await dbExec(query);
  // console.log('delete:', changes);  
  return changes;
};

exports.updatePlayer = async (player, gameId) => {
  let fields = '';

  if (player.firstName) {
    fields += `, firstName = "${player.firstName}"`;
  }
  if (player.surName) {
    fields += `, surName = "${player.surName}"`;
  }
  if (player.tel) {
    fields += `, tel = "${player.tel}"`;
  }
  if (player.payed !== undefined) {
    fields += `, payed = "${Number(player.payed)}"`;
  }
  if (player.sum !== undefined) {
    fields += `, sum = "${Number(player.sum)}"`;
  }
  const query = `UPDATE games SET date = datetime("now") ${fields} WHERE gameId = ${gameId} AND ROWID = ${player.id}`;

  let { changes } = await dbExec(query);
  return changes;
};

// async function main (){
//   // db.run('INSERT INTO games VALUES(1, "z", "k", 100)');
//   try{
//     // let r = await exports.getPlayers(1);
//     // let r = await exports.addPlayer(2, { firstName: "zubko",      surName: "kostya",      tel: "716212121",      sum: 200,      payed: 1,    });
//     // let r = await exports.deletePlayer(2, 17);
//     // let r = await exports.updatePlayer({ id:16, firstName: "ZZZ",surName: "kostya",tel: "716212121",sum: 200,payed: 1}, 2);
//     // let r = await exports.updatePlayer({ id:16, payed:0}, 2);
//     console.log(r);
//   }catch (e) {
//     console.log(e);
//   }
// };
// main(); 

