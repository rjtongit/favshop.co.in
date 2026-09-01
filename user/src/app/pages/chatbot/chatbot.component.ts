

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { API } from '../../core/api';
import { marked } from 'marked';
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  
  isOpen = false;
  question = '';
  loading = false;

  messages: Message[] = [
    {
      role: 'assistant',
      content: 'হ্যালো! কী জানতে চান?'
    }
  ];

  private apiUrl = API+'/chat';

  constructor(private http: HttpClient) {}

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  sendMessage(): void {

    const text = this.question.trim();

    if (!text || this.loading) {
      return;
    }

    // User message
    this.messages.push({
      role: 'user',
      content: text
    });

    this.question = '';
    this.loading = true;

    this.http.post<{ reply: string }>(
      this.apiUrl,
      {
        chatUser: 'user',
        askedQuestion: text
      }
    ).subscribe({

      next: (response:any) => {

        this.messages.push({
          role: 'assistant',
          content: response.answer
        });

        this.loading = false;
      },

      error: (error) => {

        console.error(error);

        this.messages.push({
          role: 'assistant',
          content: 'দুঃখিত, বর্তমানে উত্তর দিতে পারছি না।'
        });

        this.loading = false;
      }

    });
  }

  onEnter(event: KeyboardEvent): void {

    if (event.key === 'Enter' && !event.shiftKey) {

      event.preventDefault();

      this.sendMessage();
    }
  }
  renderMarkdown(content: string): string {
    return marked.parse(content) as string;
  }
}
