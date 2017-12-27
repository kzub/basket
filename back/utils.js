const fs = require('fs');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);

exports.getGameSettings = async () => {
	return JSON.parse(await readFile('settings.json'));
}

exports.getBotSettings = () => {
	return JSON.parse(fs.readFileSync('bot.settings.json'));
}

