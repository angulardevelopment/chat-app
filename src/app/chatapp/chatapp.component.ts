import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../websocket.service';

@Component({
  selector: 'app-chat-demo',
  templateUrl: './chatapp.component.html',
  styleUrls: ['./chatapp.component.scss']
})
export class ChatAppComponent implements OnInit, OnDestroy {
  private serverUrl = 'ws://localhost:8080/server1';  // wss://myserver.com/something Replace with your WebSocket server URL
  public messages: string[] = [];
  public message: string = '';

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    // Connect to the WebSocket server when the component is initialized
    this.webSocketService.connect(this.serverUrl);

    // Subscribe to incoming messages
    this.webSocketService.getMessages().subscribe((message) => {
      this.messages.push(message);
    });
  }

  // Send a message when the button is clicked
  sendMessage() {
    if (this.message.trim()) {
      this.webSocketService.sendMessage(this.message);
      this.message = '';  // Reset the input field
    }
  }

  // Clean up when the component is destroyed
  ngOnDestroy() {
    this.webSocketService.closeConnection();
  }
}
