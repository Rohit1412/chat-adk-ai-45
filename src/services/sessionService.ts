export interface Session {
  sessionId: string;
  userId: string;
  appName: string;
  createdAt: number;
}

export interface CreateSessionRequest {
  initial_state: Record<string, unknown>;
}

export interface CreateSessionResponse {
  sessionId: string;
  userId: string;
  appName: string;
  createdAt: number;
}

class SessionService {
  private readonly SESSION_STORAGE_KEY = 'ai_chat_session';
  private readonly BASE_URL = 'http://34.47.226.66:8080';
  private readonly APP_NAME = 'startup_investor_agent';

  async createSession(initialState: Record<string, unknown> = {}): Promise<Session> {
    try {
      // Generate unique IDs
      const userId = `test-user-${Date.now()}`;
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(`${this.BASE_URL}/apps/${this.APP_NAME}/users/${userId}/sessions/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          initial_state: initialState,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to create session: ${response.status} ${response.statusText}`);
      }

      // Create session object from our generated IDs
      const sessionData: Session = {
        sessionId,
        userId,
        appName: this.APP_NAME,
        createdAt: Date.now(),
      };
      
      // Store session in localStorage
      this.storeSession(sessionData);
      
      return sessionData;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  getStoredSession(): Session | null {
    try {
      const storedData = localStorage.getItem(this.SESSION_STORAGE_KEY);
      if (!storedData) return null;
      
      return JSON.parse(storedData) as Session;
    } catch (error) {
      console.error('Error retrieving stored session:', error);
      this.deleteSession(); // Clear corrupted data
      return null;
    }
  }

  storeSession(session: Session): void {
    try {
      localStorage.setItem(this.SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Error storing session:', error);
    }
  }

  deleteSession(): void {
    try {
      localStorage.removeItem(this.SESSION_STORAGE_KEY);
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  }

  async terminateSession(session: Session): Promise<void> {
    try {
      // Call the correct endpoint format with DELETE method
      const response = await fetch(`${this.BASE_URL}/apps/${session.appName}/users/${session.userId}/sessions/${session.sessionId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn(`Failed to delete session on backend: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.warn('Warning: Failed to notify backend of session termination:', error);
    } finally {
      // Always clear local session and messages regardless of backend response
      this.deleteSession();
      this.clearMessages();
    }
  }

  // Message persistence methods
  private readonly MESSAGES_STORAGE_KEY = 'ai_chat_messages';

  storeMessages(sessionId: string, messages: any[]): void {
    try {
      localStorage.setItem(`${this.MESSAGES_STORAGE_KEY}_${sessionId}`, JSON.stringify(messages));
    } catch (error) {
      console.error('Error storing messages:', error);
    }
  }

  getStoredMessages(sessionId: string): any[] {
    try {
      const storedData = localStorage.getItem(`${this.MESSAGES_STORAGE_KEY}_${sessionId}`);
      return storedData ? JSON.parse(storedData) : [];
    } catch (error) {
      console.error('Error retrieving stored messages:', error);
      return [];
    }
  }

  clearMessages(sessionId?: string): void {
    try {
      if (sessionId) {
        localStorage.removeItem(`${this.MESSAGES_STORAGE_KEY}_${sessionId}`);
      } else {
        // Clear all message keys if no specific session
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith(this.MESSAGES_STORAGE_KEY)) {
            localStorage.removeItem(key);
          }
        });
      }
    } catch (error) {
      console.error('Error clearing messages:', error);
    }
  }

  hasValidSession(): boolean {
    const session = this.getStoredSession();
    return session !== null && 
           Boolean(session.sessionId) && 
           Boolean(session.userId) && 
           Boolean(session.appName);
  }
}

export const sessionService = new SessionService();