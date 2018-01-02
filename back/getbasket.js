let engine = require('./engine.basketmsk');

main();

async function main(){
	// loadGame(702)
	// return;
	for (let i = 168; i < 703; i++){
		console.log(i);
		await loadGame(i);
	}
}

async function loadGame(id) {
	let res = await engine.getPlayers(id);
	if (res.length) {
		let lines = res.map(a => {
			let result = [id];
			for (let k in a) {
				result.push(a[k])
			}
			return result.join();
		});		
		console.error(lines.join('\r\n'));
	}
}