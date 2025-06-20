/**
 * Socket.IO event definitions for LiveCollab
 * Centralized event names to prevent typos and ensure consistency
 */

// Connection Events
export const CONNECTION_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  ERROR: "error",
  CONNECT_ERROR: "connect_error",
} as const;

// Room Events
export const ROOM_EVENTS = {
  JOIN_ROOM: "join-room",
  LEAVE_ROOM: "leave-room",
  USER_JOINED: "user-joined",
  USER_LEFT: "user-left",
  ROOM_USERS: "room-users",
} as const;

// Document Events
export const DOCUMENT_EVENTS = {
  PAGE_CHANGE: "page-change",
  PAGE_CHANGED: "page-changed",
  DOCUMENT_LOADED: "document-loaded",
  ZOOM_CHANGE: "zoom-change",
  ZOOM_CHANGED: "zoom-changed",
} as const;

// Collaboration Events
export const COLLABORATION_EVENTS = {
  CURSOR_MOVE: "cursor-move",
  CURSOR_MOVED: "cursor-moved",
  SELECTION_CHANGE: "selection-change",
  SELECTION_CHANGED: "selection-changed",
} as const;

// Comment Events
export const COMMENT_EVENTS = {
  COMMENT_ADDED: "comment-added",
  COMMENT_RECEIVED: "comment-received",
  COMMENT_UPDATED: "comment-updated",
  COMMENT_DELETED: "comment-deleted",
} as const;

// Activity Events
export const ACTIVITY_EVENTS = {
  ACTIVITY_UPDATE: "activity-update",
  TYPING_START: "typing-start",
  TYPING_STOP: "typing-stop",
} as const;

// Export all events for convenience
export const SOCKET_EVENTS = {
  ...CONNECTION_EVENTS,
  ...ROOM_EVENTS,
  ...DOCUMENT_EVENTS,
  ...COLLABORATION_EVENTS,
  ...COMMENT_EVENTS,
  ...ACTIVITY_EVENTS,
} as const;

// Types for better type safety
export type SocketEventName =
  (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];

// Event payload types
export interface UserInfo {
  userId: string;
  userName: string;
  socketId?: string;
}

export interface RoomData {
  roomCode: string;
  user: {
    id: string;
    email: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

export interface PageChangeData {
  roomCode: string;
  pageNumber: number;
  userId: string;
}

export interface CursorMoveData {
  roomCode: string;
  position: {
    x: number;
    y: number;
  };
  userId: string;
}

export interface CommentData {
  roomCode: string;
  comment: {
    id: string;
    content: string;
    pageNumber: number;
    position?: {
      x: number;
      y: number;
    };
    userId: string;
    userName: string;
  };
}
