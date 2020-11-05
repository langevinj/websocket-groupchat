/** Client-side of groupchat. */

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);

const name = prompt("Username?");


/** called when connection opens, sends join info to server. */

ws.onopen = function(evt) {
  console.log("open", evt);

  let data = {type: "join", name: name};
  ws.send(JSON.stringify(data));
};


/** called when msg received from server; displays it. */

ws.onmessage = async function(evt) {
  console.log("message", evt);

  let msg = JSON.parse(evt.data);
  let item;

  if (msg.type === "note") {
    item = $(`<li><i>${msg.text}</i></li>`);
  }

  else if (msg.type === "chat") {
    item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
  }

  else if (msg.type === "joke") {
    item = $(`<li><b>Server: </b>${msg.text}</li>`);
    console.log(msg.name)
    if (msg.name === name) {
      $('#messages').append(item);
    }
  }

  else if (msg.type === "members") {
    item = $(`<li><b>Server: </b>${msg.text}</li>`);
    if (msg.name === name) {
      $('#messages').append(item);
    }
  }

  else if (msg.type === "private") {
    item = $(`<li><b><em>${msg.name} says: <em></b>${msg.text}</li>`);
    if(msg.to === name){
      $('#messages').append(item);
    }
  }

  else {
    return console.error(`bad message: ${msg}`);
  }

  if(msg.type === "chat" || msg.type === "note"){
    $('#messages').append(item);
  }
};


/** called on error; logs it. */

ws.onerror = function (evt) {
  console.error(`err ${evt}`);
};


/** called on connection-closed; logs it. */

ws.onclose = function (evt) {
  console.log("close", evt);
};


/** send message when button pushed. */

$('form').submit(function (evt) {
  evt.preventDefault();
  let data;

  if($("#m").val() === "/joke"){
    data = { type: "get-joke", name: name}
  } else if ($("#m").val() === "/members"){
    data = { type: "get-members", name: name}
  } else if ($('#m').val().split(" ")[0] === "/priv") {
    let arr = $('#m').val().split(" ")
    let details = arr.slice(0,2)
    details.push(arr.slice(2).join(' '))
    data = { type: "private", name: name, to: details[1], text: details[2] }
  } else {
    data = { type: "chat", text: $("#m").val() };
  }

  ws.send(JSON.stringify(data));

  $('#m').val('');
});

