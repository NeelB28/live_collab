import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  SOCKET_EVENTS,
  UserInfo,
  RoomData,
  PageChangeData,
  CursorMoveData,
  CommentData,
} from "@/lib/socket/events";
import { useAuth } from "@/context/AuthContext";

interface UseSocketReturn {
  // Connection state
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;

  // Room management
  joinRoom: (roomCode: string) => void;
  leaveRoom: () => void;
  currentRoom: string | null;
  roomUsers: UserInfo[];

  // Real-time events
  emitPageChange: (roomCode: string, pageNumber: number) => void;
  emitCursorMove: (
    roomCode: string,
    position: { x: number; y: number }
  ) => void;
  emitComment: (roomCode: string, comment: any) => void;

  // Event listeners
  onUserJoined: (callback: (user: UserInfo) => void) => void;
  onUserLeft: (callback: (user: UserInfo) => void) => void;
  onPageChanged: (
    callback: (data: { pageNumber: number; userId: string }) => void
  ) => void;
  onCursorMoved: (callback: (data: CursorMoveData) => void) => void;
  onCommentReceived: (callback: (data: CommentData) => void) => void;

  // Utility
  clearError: () => void;
}

export const useSocket = (): UseSocketReturn => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [roomUsers, setRoomUsers] = useState<UserInfo[]>([]);

  /**
   * Initialize Socket.IO connection
   */
  const initializeSocket = useCallback(() => {
    if (!user || socketRef.current) return;

    setIsConnecting(true);
    setError(null);

    // Create socket connection
    const socket = io({
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    socket.on(SOCKET_EVENTS.CONNECT, () => {
      console.log("🔌 Socket connected:", socket.id);
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      console.log("🔌 Socket disconnected:", reason);
      setIsConnected(false);
      setIsConnecting(false);
      setCurrentRoom(null);
      setRoomUsers([]);
    });

    socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
      console.error("🚨 Socket connection error:", error);
      setIsConnecting(false);
      setError("Failed to connect to collaboration server");
    });

    socket.on(SOCKET_EVENTS.ERROR, (error) => {
      console.error("🚨 Socket error:", error);
      setError("Connection error occurred");
    });

    // Room event handlers
    socket.on(SOCKET_EVENTS.USER_JOINED, (user: UserInfo) => {
      console.log("👤 User joined:", user.userName);
      setRoomUsers((prev) => [
        ...prev.filter((u) => u.userId !== user.userId),
        user,
      ]);
    });

    socket.on(SOCKET_EVENTS.USER_LEFT, (user: UserInfo) => {
      console.log("👋 User left:", user.userName);
      setRoomUsers((prev) => prev.filter((u) => u.userId !== user.userId));
    });

    socket.on(SOCKET_EVENTS.ROOM_USERS, (users: UserInfo[]) => {
      console.log("👥 Room users:", users);
      setRoomUsers(users);
    });

    socketRef.current = socket;
  }, [user]);

  /**
   * Cleanup socket connection
   */
  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setIsConnected(false);
    setCurrentRoom(null);
    setRoomUsers([]);
  }, []);

  // Initialize socket when user is available
  useEffect(() => {
    if (user) {
      initializeSocket();
    } else {
      cleanup();
    }

    return cleanup;
  }, [user, initializeSocket, cleanup]);

  /**
   * Join a collaboration room
   */
  const joinRoom = useCallback(
    (roomCode: string) => {
      if (!socketRef.current || !user) return;

      const roomData: RoomData = {
        roomCode,
        user: {
          id: user.id,
          email: user.email || '',
          user_metadata: user.user_metadata,
        },
      };

      socketRef.current.emit(SOCKET_EVENTS.JOIN_ROOM, roomData);
      setCurrentRoom(roomCode);
      console.log("🏠 Joining room:", roomCode);
    },
    [user]
  );

  /**
   * Leave current room
   */
  const leaveRoom = useCallback(() => {
    if (!socketRef.current || !currentRoom) return;

    socketRef.current.emit(SOCKET_EVENTS.LEAVE_ROOM, { roomCode: currentRoom });
    setCurrentRoom(null);
    setRoomUsers([]);
    console.log("🚪 Left room");
  }, [currentRoom]);

  /**
   * Emit page change to other users
   */
  const emitPageChange = useCallback(
    (roomCode: string, pageNumber: number) => {
      if (!socketRef.current || !user) return;

      const data: PageChangeData = {
        roomCode,
        pageNumber,
        userId: user.id,
      };

      socketRef.current.emit(SOCKET_EVENTS.PAGE_CHANGE, data);
    },
    [user]
  );

  /**
   * Emit cursor movement
   */
  const emitCursorMove = useCallback(
    (roomCode: string, position: { x: number; y: number }) => {
      if (!socketRef.current || !user) return;

      const data: CursorMoveData = {
        roomCode,
        position,
        userId: user.id,
      };

      socketRef.current.emit(SOCKET_EVENTS.CURSOR_MOVE, data);
    },
    [user]
  );

  /**
   * Emit comment
   */
  const emitComment = useCallback((roomCode: string, comment: any) => {
    if (!socketRef.current) return;

    const data: CommentData = {
      roomCode,
      comment,
    };

    socketRef.current.emit(SOCKET_EVENTS.COMMENT_ADDED, data);
  }, []);

  /**
   * Event listener setup functions
   */
  const onUserJoined = useCallback((callback: (user: UserInfo) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on(SOCKET_EVENTS.USER_JOINED, callback);
  }, []);

  const onUserLeft = useCallback((callback: (user: UserInfo) => void) => {
    if (!socketRef.current) return;
    socketRef.current.on(SOCKET_EVENTS.USER_LEFT, callback);
  }, []);

  const onPageChanged = useCallback(
    (callback: (data: { pageNumber: number; userId: string }) => void) => {
      if (!socketRef.current) return;
      socketRef.current.on(SOCKET_EVENTS.PAGE_CHANGED, callback);
    },
    []
  );

  const onCursorMoved = useCallback(
    (callback: (data: CursorMoveData) => void) => {
      if (!socketRef.current) return;
      socketRef.current.on(SOCKET_EVENTS.CURSOR_MOVED, callback);
    },
    []
  );

  const onCommentReceived = useCallback(
    (callback: (data: CommentData) => void) => {
      if (!socketRef.current) return;
      socketRef.current.on(SOCKET_EVENTS.COMMENT_RECEIVED, callback);
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
    error,
    joinRoom,
    leaveRoom,
    currentRoom,
    roomUsers,
    emitPageChange,
    emitCursorMove,
    emitComment,
    onUserJoined,
    onUserLeft,
    onPageChanged,
    onCursorMoved,
    onCommentReceived,
    clearError,
  };
};

export default useSocket;
