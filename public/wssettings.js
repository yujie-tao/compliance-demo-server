const wsclient = {}; 
// wsclient.sock = new WebSocket("ws://34.125.186.152:5001");
wsclient.sock = new WebSocket("ws://0.0.0.0:5001");
wsclient.is_connected_to_dev = false;

const reset_connect_button = () => {
  wsclient.button = wsclient.button || document.getElementById("connect");
  wsclient.is_connected_to_dev = false;
  wsclient.button.innerText = "Try the remote EMS";
}

const wrilte_nl_in_logbox = (str_nl) => {
  wsclient.logbox = wsclient.logbox || document.getElementById("log_box");
  wsclient.logbox.lastline = wsclient.logbox.lastline || '';
  wsclient.logbox.oldlines = wsclient.logbox.oldlines || '';
  wsclient.logbox.oldlines = "* " + wsclient.logbox.lastline + "<br /> " + wsclient.logbox.oldlines;
  wsclient.logbox.innerHTML = "* " + str_nl + "<br /> ----- new line ----- <br /><br />" + wsclient.logbox.oldlines;
  wsclient.logbox.lastline = str_nl;
}

wsclient.sock.addEventListener("open", e => {
  console.log("event as connected");
  reset_connect_button();
});

const send_request = (arg_request, arg_option, arg_name) => {
  wsclient.sock.send(JSON.stringify({
    request: arg_request,
    option: arg_option,
    name: arg_name
  }));
}

wsclient.sock.addEventListener("message", ev => {
  let message_type = undefined;
  let message = {};
  // parse payload
  // A json type message is supposed to contain
  // - response: {"Can I try?", "disconnect", "start", "stop", "time"},
  // - option : 
  // --- {1-60}; when time ticks;
  // --- {finger : [1,2,3,4], type: [0,1,2]}; when "start" is requested; 
  // ----- type 0 -> click&hold
  // ----- type 1 -> click then 1sec stim
  // ----- type 2 -> undefined 
  // - name : name who requests
  try {
    message_type = 'JSON';
    message = JSON.parse(ev.data);
  } catch (err) {
    if (typeof (ev.data) === String) {
      message_type = 'String';
      message = ev.data;
    }
  } finally {
    console.log("Message Event from server: " + ev.data);
  }
  wsclient.button = wsclient.button || document.getElementById("connect");
  // response
  if (message_type == 'String'){
    wrilte_nl_in_logbox("@server> " + ev.data);
  }
  if (message_type == 'JSON'){
    if (message.response == "accepted"){
      wsclient.is_connected_to_dev = true;
      wrilte_nl_in_logbox("Your turn! > @" + message.name);
      wsclient.button.innerText = "Release the control now";
    }
    else if (message.response == "rejected"){
      wrilte_nl_in_logbox("Sorry, now @" + message.name);
    }
    else if (message.response == "connected"){
      wrilte_nl_in_logbox("@" + message.name + " has got it started.");
    }
    else if (message.response == "disconnected"){
      if(wsclient.is_connected_to_dev) {
        wrilte_nl_in_logbox("You has been disconnected");
      }
      reset_connect_button();
      wrilte_nl_in_logbox("@" + message.name + " has released the control. Another attendee can try it now!");
    }
    else if (message.response == "time"){
      wsclient.button.innerText = "@" + message.name + "'s turn ends in " + message.option;
      if (wsclient.is_connected_to_dev){
        wsclient.button.innerHTML += " or <b>Release the control now</b>"
      }
    }
    else if(message.response == "start"){
      gwd.actions.events.setInlineStyle('electrode_' + message.option.finger, 'background-color: #FFFF55;');
    }
    else if(message.response == "stop"){
      gwd.actions.events.setInlineStyle('electrode_' + message.option.finger, 'background-color: #FFFFFF;');
    }
  }
  else {
    wrilte_nl_in_logbox("@server> " + e.data);
  }

});

wsclient.sock.addEventListener("close", e => {
  console.log("event as closed");
});

wsclient.sock.addEventListener("error", e => {
  console.log("event as some error occurs");
});

wsclient.connect_to_dev = (name) => {
  send_request("Can I try?", undefined, name);
};

wsclient.disconnect_from_dev = () => {
  send_request("disconnect", undefined, undefined);
};

wsclient.start_dev = (index, stim_type) => {
  send_request("start", {finger: index, type: stim_type}, undefined);
}

wsclient.stop_dev = (index, stim_type) => {
  send_request("stop", {finger: index, type: stim_type}, undefined);
}