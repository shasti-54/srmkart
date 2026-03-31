import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MessageService, Message } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';

interface Conversation {
  id: string; // listingId_otherUserId
  listingId: number;
  otherUserId: number;
  messages: Message[];
  lastMessageAt: Date;
}

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inbox-page">
      <div class="container inbox-container">
        <div class="card retail-inbox-wrapper border">
          <!-- Left Sidebar: Conversations -->
          <div class="conversations-list border-right">
            <div class="inbox-header">
              <h3>Messages</h3>
            </div>
            
            <div *ngIf="loading" class="text-center p-4 text-muted">Loading messages...</div>
            <div *ngIf="!loading && conversations.length === 0" class="text-center p-4 text-muted">No messages yet.</div>

            <div class="conversation-item" 
                 *ngFor="let conv of conversations" 
                 [class.active]="selectedConversation?.id === conv.id"
                 (click)="selectConversation(conv)">
              <div class="avatar">
                <span class="material-icons">person</span>
              </div>
              <div class="details">
                <h4>User {{conv.otherUserId}}</h4>
                <p>Listing #{{conv.listingId}}</p>
              </div>
            </div>
          </div>
          
          <!-- Right Area: Chat -->
          <div class="chat-area">
            <ng-container *ngIf="selectedConversation; else noSelection">
              <div class="chat-header border-bottom">
                <h4>Chat with User {{selectedConversation.otherUserId}}</h4>
                <span class="context">Regarding: Listing #{{selectedConversation.listingId}}</span>
              </div>
              
              <div class="messages" #scrollContainer>
                <div class="message" 
                     *ngFor="let msg of selectedConversation.messages"
                     [ngClass]="msg.senderId === currentUserId ? 'sent' : 'received'">
                  <div class="bubble">{{msg.content}}</div>
                  <div class="time">{{msg.sentAt | date:'shortTime'}}</div>
                </div>
              </div>
              
              <div class="chat-input border-top">
                <input type="text" class="form-control" placeholder="Type a message..." 
                       [(ngModel)]="newMessage" (keyup.enter)="sendMessage()">
                <button class="btn btn-primary" (click)="sendMessage()" [disabled]="!newMessage.trim()">
                  <span class="material-icons">send</span>
                </button>
              </div>
            </ng-container>

            <!-- Pre-populated new message view from listing page -->
            <ng-container *ngIf="!selectedConversation && setupNewMessage">
               <div class="chat-header border-bottom">
                 <h4>New Message to Seller {{setupReceiverId}}</h4>
                 <span class="context">Regarding: Listing #{{setupListingId}}</span>
               </div>
               <div class="messages empty-chat">
                 <p class="text-muted">Start the conversation to buy this item!</p>
               </div>
               <div class="chat-input border-top">
                <input type="text" class="form-control" placeholder="Type a message..." 
                       [(ngModel)]="newMessage" (keyup.enter)="sendInitialMessage()">
                <button class="btn btn-primary" (click)="sendInitialMessage()" [disabled]="!newMessage.trim()">
                  <span class="material-icons">send</span>
                </button>
              </div>
            </ng-container>

            <ng-template #noSelection>
              <div *ngIf="!setupNewMessage" class="empty-selection">
                <span class="material-icons info-icon">forum</span>
                <h3>Select a conversation</h3>
                <p>Choose a thread from the left to start messaging.</p>
              </div>
            </ng-template>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inbox-page { background: var(--bg-main); min-height: calc(100vh - 80px); padding: 2rem 0; }
    .inbox-container { height: 75vh; }
    .retail-inbox-wrapper { display: flex; height: 100%; overflow: hidden; border-radius: 12px; }
    
    .border-right { border-right: 1px solid var(--border-color); }
    .border-bottom { border-bottom: 1px solid var(--border-color); }
    .border-top { border-top: 1px solid var(--border-color); }
    
    .conversations-list { width: 320px; background: #fafafa; display: flex; flex-direction: column; overflow-y: auto; }
    .inbox-header { padding: 1.25rem; background: #ffffff; border-bottom: 1px solid var(--border-color); }
    .inbox-header h3 { margin: 0; font-size: 1.25rem; font-family: 'Outfit', sans-serif; font-weight: 700; color: #111827; }
    
    .conversation-item {
      display: flex; padding: 1rem 1.25rem; gap: 1rem; cursor: pointer; border-bottom: 1px solid #f3f4f6; transition: all 0.2s;
    }
    .conversation-item:hover { background: #f3f4f6; }
    .conversation-item.active { background: #ffffff; border-left: 4px solid var(--primary-color); }
    
    .avatar { width: 45px; height: 45px; border-radius: 50%; background: #e2e8f0; color: #64748b; display: flex; align-items: center; justify-content: center; }
    .details { flex: 1; overflow: hidden; }
    .details h4 { margin: 0 0 0.25rem 0; font-size: 1rem; font-weight: 600; color: #1f2937; }
    .details p { margin: 0; font-size: 0.85rem; color: #6b7280; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

    .chat-area { flex: 1; display: flex; flex-direction: column; background: #ffffff; }
    .chat-header { padding: 1.25rem 1.5rem; background: #ffffff; }
    .chat-header h4 { margin: 0 0 0.25rem 0; font-size: 1.15rem; font-weight: 700; color: #1f2937; }
    .context { font-size: 0.85rem; color: #6b7280; font-weight: 500; }
    
    .messages { flex: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; background: #f8f9fc; }
    .message { max-width: 70%; display: flex; flex-direction: column; }
    .message.received { align-self: flex-start; }
    .message.sent { align-self: flex-end; align-items: flex-end; }
    
    .bubble { padding: 0.8rem 1.15rem; border-radius: 12px; font-size: 0.95rem; line-height: 1.4; }
    .received .bubble { background: #ffffff; border: 1px solid #e5e7eb; border-bottom-left-radius: 2px; color: #1f2937; }
    .sent .bubble { background: #312e81; color: #ffffff; border-bottom-right-radius: 2px; }
    .time { font-size: 0.7rem; color: #9ca3af; margin-top: 6px; }
    
    .chat-input { padding: 1.25rem 1.5rem; background: #ffffff; display: flex; gap: 1rem; align-items: center; }
    .chat-input input { flex: 1; border-radius: 8px; padding: 0.75rem 1rem; border: 1px solid #d1d5db; }
    
    .empty-selection, .empty-chat { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #9ca3af; }
    .info-icon { font-size: 4rem; color: #e5e7eb; margin-bottom: 1rem; }
    .empty-selection h3 { color: #4b5563; font-family: 'Outfit', sans-serif; font-weight: 600; margin-bottom: 0.5rem; }

    @media (max-width: 768px) {
      .conversations-list { width: 90px; }
      .details { display: none; }
      .conversation-item { justify-content: center; padding: 1rem 0; }
    }
  `]
})
export class InboxComponent implements OnInit, OnDestroy {
  currentUserId = 0;
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  newMessage = '';
  loading = true;
  pollInterval: any;

  // Setup state for new messages from listing details
  setupNewMessage = false;
  setupListingId = 0;
  setupReceiverId = 0;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.currentUserId = this.authService.getCurrentUserId() || 1; // Assuming a method or fallback

    // Check if navigating from 'Message Seller'
    this.route.queryParams.subscribe(params => {
      if (params['listingId'] && params['receiverId']) {
        this.setupNewMessage = true;
        this.setupListingId = +params['listingId'];
        this.setupReceiverId = +params['receiverId'];
      }
    });

    this.loadMessages();
    this.pollInterval = setInterval(() => this.loadMessages(), 5000); // Poll every 5s
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  loadMessages() {
    this.messageService.getMessages().subscribe({
      next: (msgs) => {
        this.groupMessages(msgs || []);
        this.loading = false;
        
        // Auto-select conversation if setupNewMessage matches an existing thread
        if (this.setupNewMessage) {
          const existingThread = this.conversations.find(c => c.listingId === this.setupListingId && c.otherUserId === this.setupReceiverId);
          if (existingThread) {
            this.selectedConversation = existingThread;
            this.setupNewMessage = false;
          }
        }
      },
      error: (err) => {
        console.error("Message load error", err);
        this.loading = false;
      }
    });
  }

  groupMessages(messages: Message[]) {
    const convMap = new Map<string, Conversation>();
    
    messages.forEach(msg => {
      const otherUserId = msg.senderId === this.currentUserId ? msg.receiverId : msg.senderId!;
      const convId = `${msg.listingId}_${otherUserId}`;
      
      if (!convMap.has(convId)) {
        convMap.set(convId, {
          id: convId,
          listingId: msg.listingId,
          otherUserId: otherUserId,
          messages: [],
          lastMessageAt: new Date(msg.sentAt || new Date())
        });
      }
      convMap.get(convId)!.messages.push(msg);
    });

    // Sort messages within conversations, and conversations by last message
    const convArray = Array.from(convMap.values());
    convArray.forEach(c => c.messages.sort((a, b) => new Date(a.sentAt!).getTime() - new Date(b.sentAt!).getTime()));
    convArray.sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
    
    this.conversations = convArray;
    
    if (this.selectedConversation) {
      const updated = this.conversations.find(c => c.id === this.selectedConversation!.id);
      if (updated) this.selectedConversation = updated;
    }
  }

  selectConversation(conv: Conversation) {
    this.selectedConversation = conv;
    this.setupNewMessage = false;
  }

  sendMessage() {
    if (!this.newMessage.trim() || !this.selectedConversation) return;

    const payload: Message = {
      listingId: this.selectedConversation.listingId,
      receiverId: this.selectedConversation.otherUserId,
      content: this.newMessage
    };

    this.messageService.sendMessage(payload).subscribe(() => {
      this.newMessage = '';
      this.loadMessages();
    });
  }

  sendInitialMessage() {
    if (!this.newMessage.trim() || !this.setupNewMessage) return;

    const payload: Message = {
      listingId: this.setupListingId,
      receiverId: this.setupReceiverId,
      content: this.newMessage
    };

    this.messageService.sendMessage(payload).subscribe(() => {
      this.newMessage = '';
      this.setupNewMessage = false;
      this.loadMessages(); // Will group and auto-select
    });
  }
}
