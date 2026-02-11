"use client";

import { useState, useEffect, createContext, useContext } from "react";

// ── Types ──

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

// ── Storage keys ──

const USERS_KEY = "birdie-users";
const SESSION_KEY = "birdie-session";

// ── Helpers ──

interface StoredUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

/** Simple hash for client-side demo auth. NOT cryptographically secure.
 *  Replace with bcrypt + server-side when a real backend is added. */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  // Add a salt-like prefix to make it slightly less trivial
  return `bh_${Math.abs(hash).toString(36)}`;
}

function getStoredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {}
}

function getSession(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function setSession(userId: string): void {
  try {
    localStorage.setItem(SESSION_KEY, userId);
  } catch {}
}

function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {}
}

// ── Validation ──

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_NAME_LENGTH = 50;
const MAX_EMAIL_LENGTH = 100;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required";
  if (email.length > MAX_EMAIL_LENGTH) return "Email is too long";
  if (!EMAIL_REGEX.test(email)) return "Invalid email format";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  if (password.length > 128) return "Password is too long";
  return null;
}

export function validateName(name: string): string | null {
  if (!name.trim()) return "Name is required";
  if (name.length > MAX_NAME_LENGTH) return "Name is too long";
  return null;
}

// ── Context ──

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: () => ({ success: false, error: "Not initialized" }),
  register: () => ({ success: false, error: "Not initialized" }),
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

// ── Hook ──

export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const sessionUserId = getSession();
    if (sessionUserId) {
      const users = getStoredUsers();
      const found = users.find((u) => u.id === sessionUserId);
      if (found) {
        setUser({ id: found.id, name: found.name, email: found.email });
      } else {
        clearSession();
      }
    }
    setLoading(false);
  }, []);

  function login(email: string, password: string): { success: boolean; error?: string } {
    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };

    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!found) return { success: false, error: "Invalid email or password" };

    const hash = simpleHash(password);
    if (found.passwordHash !== hash) return { success: false, error: "Invalid email or password" };

    setUser({ id: found.id, name: found.name, email: found.email });
    setSession(found.id);
    return { success: true };
  }

  function register(name: string, email: string, password: string): { success: boolean; error?: string } {
    const nameErr = validateName(name);
    if (nameErr) return { success: false, error: nameErr };

    const emailErr = validateEmail(email);
    if (emailErr) return { success: false, error: emailErr };

    const passErr = validatePassword(password);
    if (passErr) return { success: false, error: passErr };

    const users = getStoredUsers();
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
    if (exists) return { success: false, error: "An account with this email already exists" };

    const newUser: StoredUser = {
      id: crypto.randomUUID(),
      name: name.trim().slice(0, MAX_NAME_LENGTH),
      email: email.trim().toLowerCase().slice(0, MAX_EMAIL_LENGTH),
      passwordHash: simpleHash(password),
    };

    users.push(newUser);
    saveUsers(users);
    setUser({ id: newUser.id, name: newUser.name, email: newUser.email });
    setSession(newUser.id);
    return { success: true };
  }

  function logout() {
    setUser(null);
    clearSession();
  }

  return { user, loading, login, register, logout };
}
