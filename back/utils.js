const fs = require('fs');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);

exports.getGameSettings = async () => {
	return JSON.parse(await readFile('settings.game.json'));
}

exports.getConfig = () => {
	return JSON.parse(fs.readFileSync('settings.json'));
}

exports.eq = (s1, s2) => {
  return s1 && s2 && s1.toLowerCase() == s2.toLowerCase();
};
