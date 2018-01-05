const fs = require('fs');
const promisify = require('util').promisify;
const readFile = promisify(fs.readFile);

exports.getGameSettings = async () => {
	let data = await readFile('settings.game.json');
	let mode = getMode();
	return JSON.parse(data)[mode];
}

exports.getConfig = () => {
	let data = fs.readFileSync('settings.json');
	let mode = getMode();
	return JSON.parse(data)[mode];
}

exports.eq = (s1, s2) => {
  return s1 && s2 && s1.toLowerCase() == s2.toLowerCase();
};

function getMode () {
	let mode = process.env.BASKET_MODE;
	if (!mode || ['prod', 'dev'].indexOf(mode) === -1) {
		console.log('no mode specified');
		process.exit(-1)
	}
	return mode;
}