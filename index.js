const http = require('http');
const server = http.createServer();
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });


wss.on('connection', function connection(ws, req) {
  const user_id = new URLSearchParams(req.url.split('?')[1]).get('user_id');
  console.log(`WebSocket client connected with user_id ${user_id}`);
  toIntendedRecipients('connected', user_id, [user_id])
  ws.user = user_id;

  ws.on('message', function incoming(messageObject) { 
    const message = JSON.parse(messageObject);
    const sender    = message.sender
    const recipients= message.recipients
    const content   = message.content

    console.log('sender:', sender);
    console.log('recipients:', recipients);
    console.log('text:', content );

    function toIntendedRecipients(content, sender, recipients){ 
      for (const recipient of recipients) {
        const recipientSocket = findSocketByUser(recipient);
        if (recipientSocket) {
          recipientSocket.send(`From ${sender}: ${content}`);
        }
      }
    }
    toIntendedRecipients(content, sender, recipients)  
  });
});


function findSocketByUser(user) {
  for (const ws of wss.clients) {
    if (ws.user === user) {
      return ws;
    }
  }
  return null;
}

server.listen(3000, function () {
  console.log('Listening on http://localhost:3000');
});
