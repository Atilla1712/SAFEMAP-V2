import { LocaleStrings } from "./data/locales";

export interface SupportResource {
  id: string;
  name: string;
  category: "shelter" | "legal" | "clinic" | "community" | "job";
  address: string;
  phone: string;
  hours: string;
  free: boolean;
  lat: number;
  lng: number;
  notes: string;
  tags: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "model" | "admin";
  text: string;
  timestamp: string;
}

export interface ChatSession {
  sessionId: string;
  createdAt: string;
  updatedAt: string;
  needsHuman: boolean;
  language: "id" | "en";
  messages: ChatMessage[];
}

export type ScreenType = 
  | "onboarding" 
  | "home" 
  | "map" 
  | "quiz-select" 
  | "quiz-question" 
  | "quiz-result" 
  | "about" 
  | "admin";
