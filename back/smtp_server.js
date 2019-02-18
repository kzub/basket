const net = require('net');
const utils = require('./utils');
const config = utils.getConfig();
const eventCallbacks = [];

exports.addHandler = callback => {
  if (!(callback instanceof Function)) {
    console.log('SMTP --- ERROR addHandle() bad callback');
    return;
  }

  eventCallbacks.push(callback);
};

function checkEvent(data) {
  if (data.indexOf(config.smtp.email) > -1) {
    console.log('SMTP --- GOT EVENT for:', config.smtp.email);
    for (let idx in eventCallbacks) {
      eventCallbacks[idx](data);
    }
  }

  if (config.smtp.forwardPort) {
    console.log('SMTP >>> FORWARD MESSAGE >>>');
    sendDataToDev(data);
  }
}

function sendDataToDev(data) {
  const client = net.createConnection({ port: config.smtp.forwardPort }, () => {
    client.end(data);
  });
  client.on('error', e => {
    console.log(`SMTP --- FORWARD ERROR: ${e}`);
  });
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

  c.on('error', e => {
    console.log(`SMTP <<< ERROR: ${e}`);
  });
});

server.on('error', (err) => {
  console.log('SMTP --- ERROR:', err);
});

server.listen(config.smtp.port, () => {
  console.log('SMTP --- server bound to port:', config.smtp.port);
});