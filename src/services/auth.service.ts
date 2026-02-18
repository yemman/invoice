import { Injectable, inject, signal } from '@angular/core';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  Auth,
  User,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { FirebaseService } from './firebase.service';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseService = inject(FirebaseService);
  private auth: Auth | null = null;
  
  // Signal to track authentication state
  isAuthenticated = signal(false);
  currentUser = signal<AuthUser | null>(null);
  loading = signal(true);

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    try {
      this.auth = getAuth();
      
      // Listen to authentication state changes
      onAuthStateChanged(this.auth, (user: User | null) => {
        if (user) {
          this.isAuthenticated.set(true);
          this.currentUser.set({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          });
        } else {
          this.isAuthenticated.set(false);
          this.currentUser.set(null);
        }
        this.loading.set(false);
      });
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.loading.set(false);
    }
  }

  /**
   * Sign in with Google using popup
   */
  async signInWithGoogle(): Promise<AuthUser | null> {
    if (!this.auth) {
      throw new Error('Auth not initialized');
    }

    try {
      const provider = new GoogleAuthProvider();
      // Add scopes for additional permissions if needed
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(this.auth, provider);
      const user = result.user;
      
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(`Google sign-in failed: ${error.message}`);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(email: string, password: string, displayName?: string): Promise<AuthUser | null> {
    if (!this.auth) {
      throw new Error('Auth not initialized');
    }

    try {
      const result = await createUserWithEmailAndPassword(this.auth, email, password);
      const user = result.user;

      // Update user profile with display name if provided
      if (displayName && user) {
        await user.updateProfile({ displayName });
      }

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error: any) {
      console.error('Sign-up error:', error);
      throw new Error(`Sign-up failed: ${error.message}`);
    }
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(email: string, password: string): Promise<AuthUser | null> {
    if (!this.auth) {
      throw new Error('Auth not initialized');
    }

    try {
      const result = await signInWithEmailAndPassword(this.auth, email, password);
      const user = result.user;

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL
      };
    } catch (error: any) {
      console.error('Sign-in error:', error);
      throw new Error(`Sign-in failed: ${error.message}`);
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    if (!this.auth) {
      throw new Error('Auth not initialized');
    }

    try {
      await signOut(this.auth);
    } catch (error: any) {
      console.error('Sign-out error:', error);
      throw new Error(`Sign-out failed: ${error.message}`);
    }
  }

  /**
   * Get the current user
   */
  getCurrentUser(): AuthUser | null {
    return this.currentUser();
  }

  /**
   * Check if user is authenticated
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Get authentication token
   */
  async getAuthToken(): Promise<string | null> {
    if (!this.auth || !this.auth.currentUser) {
      return null;
    }

    try {
      return await this.auth.currentUser.getIdToken();
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }
}
