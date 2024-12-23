import { Component, OnInit } from '@angular/core';
import { io } from 'socket.io-client';

// socket.io-
// In socket, there are two ways to emit data such as events. One way is from the user to everyone (including user) and the other which emits an event to all the other instances.

// // Custom namespace

// var socket = io('http://localhost:5000'); // pass the URL of your server for different domain and for same domain leave it empty io() , io("/admin") same origin version, io("https://server-domain.com/admin")  cross origin version
// socket.id // x8WIv7-mJelg7on_ALbx // Each new connection is assigned a random 20-characters identifier.
// socket.on('connect', () => {}) // This event is fired by the Socket instance upon connection and reconnection By default, any event emitted while the Socket is not connected will be buffered until reconnection. While useful in most cases (when the reconnection delay is short), it could result in a huge spike of events when the connection is restored. to solve this Offline behavior clear buffer using sendBuffer property socket.sendBuffer = [] then you can receive and sendMessage

// socket.on("disconnect", (reason) => {}) here if the disconnection was initiated by the server, you can reconnect manually here
// socket.on("connect_error", () => {}) fired when the connection is denied by the server in a middleware function here you can modify the auth attribute

var socket = io('http://localhost:5000');

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    this.initializeApp();
  }

  sendMessage() {
    socket.emit('join', 'Hello World from client');
  }

  receiveMessage() {
    socket.on('messages', function (data) {
      console.log(data, 'data');
    });

    // you shouldn’t register event handlers in the connect handler itself
    // event handler
    socket.on("data", () => { /* ... */ });
  }

  // new user is created so we generate nickname and emit event
  initializeApp() {

    const inboxPeople = document.querySelector(".inbox__people");

    let userName = "";

    const newUserConnected = (user?) => {
      userName = user || `User${Math.floor(Math.random() * 1000000)}`;
      socket.emit("new user", userName);
      addToUsersBox(userName);
    };

    const addToUsersBox = (userName) => {
      if (!!document.querySelector(`.${userName}-userlist`)) {
        return;
      }

      const userBox = `
    <div class="chat_ib ${userName}-userlist">
      <h5>${userName}</h5>
    </div>
  `;
      inboxPeople.innerHTML += userBox;
    };


    newUserConnected();

    socket.on("new user", function (data) {
      data.map((user) => addToUsersBox(user));
    });

    socket.on("user disconnected", function (userName) {
      document.querySelector(`.${userName}-userlist`).remove();
    });

    const inputField = <HTMLInputElement>(document.querySelector(".message_form__input"));
    const messageForm = document.querySelector(".message_form");
    const messageBox = document.querySelector(".messages__history");
    const fallback = document.querySelector(".fallback");
    const addNewMessage = ({ user, message }) => {
      const time = new Date();
      const formattedTime = time.toLocaleString("en-US", { hour: "numeric", minute: "numeric" });

      const receivedMsg = `
  <div class="incoming__message">
    <div class="received__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="message__author">${user}</span>
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

      const myMsg = `
  <div class="outgoing__message">
    <div class="sent__message">
      <p>${message}</p>
      <div class="message__info">
        <span class="time_date">${formattedTime}</span>
      </div>
    </div>
  </div>`;

      messageBox.innerHTML += user === userName ? myMsg : receivedMsg;
    };

    messageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!inputField.value) {
        return;
      }

      socket.emit("chat message", {
        message: inputField.value,
        nick: userName,
      });

      inputField.value = "";
    });

    socket.on("chat message", function (data) {
      addNewMessage({ user: data.nick, message: data.message });
    });

    socket.on("typing", function (data) {
      const { isTyping, nick } = data;

      if (!isTyping) {
        fallback.innerHTML = "";
        return;
      }

      fallback.innerHTML = `<p>${nick} is typing...</p>`;
    });
  }


}
