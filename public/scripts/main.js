
var socket = io();
let txtBox;
let messagesBox;
let UserInfo;

window.onload = () => {
    txtBox = document.getElementById('m');
    document.getElementById("SendBtn").addEventListener('click', () => { SendMsg() })
    messagesBox = document.getElementById('messages')
    tableBody = messagesBox.querySelector('tbody');
    if (tableBody) messagesBox = tableBody;

    let userInfoBox = document.getElementById('userInfo');
    userInfo = JSON.parse(userInfoBox.value);
    userInfoBox.remove();

    console.log(userInfo);

    socket.emit('init', userInfo);
    txtBox.select();


    txtBox.addEventListener("keyup", event => {
        if (event.key !== "Enter") return;
        document.querySelector("#SendBtn").click();
        event.preventDefault();
    });
}


function SendMsg() {
    if (txtBox.value.length > 0 && txtBox.value != "") {
        let messageText = txtBox.value.trim();
        socket.emit('chat message', messageText);
        txtBox.value = '';
    }
}

function CreateMessage(msg) {
  /*  let newMsg = document.createElement('tr');
    let userBox = document.createElement('td');
    let msgContent = document.createElement('td');
    //let timeBox = document.createElement('td');
    userBox.textContent = msg.user.username + ":"
    userBox.style.color = msg.user.color;
    newMsg.appendChild(userBox);
    msgContent.textContent = msg.msg.text;
    msgContent.className = "msgContent"
    newMsg.appendChild(msgContent);
    //timeBox.textContent = new Date(msg.time * 1000).toString()
    //messagesBox.appendChild(timeBox);
    messagesBox.appendChild(newMsg);*/
   // console.log(msg)
    messagesBox.innerHTML +=msg.html;
}

socket.on('chat message', function (msg) {
    CreateMessage(msg);
});
socket.on('err', function (msg) {
    alert(msg.reason);
});