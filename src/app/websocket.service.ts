import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject: Subject<any> = new Subject<any>();  // Observable to emit received messages
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectInterval = 1000;  // Retry every 1 second

  constructor() {}

  // Connect to WebSocket server
  public connect(url: string): void {
    this.socket = new WebSocket(url);

    // When the connection is successfully established
    this.socket.onopen = () => {
      console.log('WebSocket connection established');
      this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    };

    // Handle any incoming messages
    this.socket.onmessage = (event) => {
      console.log('Message from server:', event.data);
      this.messageSubject.next(event.data);  // Emit data to subscribers
    };

    // Handle connection error
    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    // Handle WebSocket closure
    this.socket.onclose = (event) => {
      console.log('WebSocket closed:', event.code);
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log(`Attempting to reconnect in ${this.reconnectInterval}ms...`);
        setTimeout(() => {
          this.reconnectAttempts++;
          this.connect(url);  // Retry connecting
        }, this.reconnectInterval);
      } else {
        console.error('Max reconnection attempts reached');
      }
    };
  }

  // Send a message to the WebSocket server
  public sendMessage(message: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(message);
      console.log('Sent message:', message);
    } else {
      console.error('WebSocket is not open. Cannot send message');
    }
  }

  // Get observable to listen for incoming messages
  public getMessages(): Observable<any> {
    return this.messageSubject.asObservable();
  }

  // Close the WebSocket connection
  public closeConnection(): void {
    if (this.socket) {
      this.socket.close();
      console.log('WebSocket connection closed');
    }
  }
}
