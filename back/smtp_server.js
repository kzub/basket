const net = require('net');
const utils = require('./utils');
const config = utils.getConfig();
const eventCallbacks = [];

exports.addHandler = callback => {
  if (!(callback instanceof Function)) {
    console.log('SMTP ERROR addHandle() bad callback');
    return;
  }

  eventCallbacks.push(callback);
};

function checkEvent(data) {
  if (data.indexOf(config.smtp.email) > -1) {
    console.log('SMTP GOT EVENT!');
    for (let idx in eventCallbacks) {
      eventCallbacks[idx]();
    }
  }
}

const server = net.createServer((c) => {
  let data = '';
  console.log('SMTP --- client connected');

  let write = (txt, end) => {
    console.log(`SMTP >>> ${txt}`);
    if (end) {
      c.end(txt + '\r\n');
    } else {
      c.write(txt + '\r\n');
    }
  };

  c.on('end', () => {
    console.log('SMTP --- client disconnected');
    checkEvent(data);
  });

  write('220 basket.msk.ru SMTP Custom');

  c.on('data', d => {
    let line = d.toString();
    data += line;
    console.log(`SMTP <<< ${line}`);
    let [cmd] = line.split(/\r\n|\s/);
    let res;
    if (cmd == 'DATA') {
      write('354 ready');
    }
    else if (cmd == 'QUIT') {
      write('221 Bye', true);
    }
    else {
      write('250 ok');
    }
  });
});

server.on('error', (err) => {
  console.log('SMTP --- ERROR:', err);
});

server.listen(25, () => {
  console.log('SMTP --- server bound');
});