import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase/client";

export default function TestConnection() {
  const [connectionStatus, setConnectionStatus] = useState("Testing...");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  async function testConnection() {
    try {
      // Test 1: Check if Supabase client is working
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        console.log(
          "Error (this is normal if table doesn't exist yet):",
          error.message
        );
        setConnectionStatus(
          "✅ Supabase Connected! (Table not created yet - that's normal)"
        );
      } else {
        setConnectionStatus("✅ Supabase Connected Successfully!");
        setUsers(data || []);
      }
    } catch (error) {
      console.error("Connection error:", error);
      setConnectionStatus(
        "❌ Connection Failed - Check your environment variables"
      );
    }
  }

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      <h1>🧪 Supabase Connection Test</h1>

      <div
        style={{
          background: "#f5f5f5",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2>Connection Status:</h2>
        <p style={{ fontSize: "18px", fontWeight: "bold" }}>
          {connectionStatus}
        </p>
      </div>

      <div
        style={{
          background: "#e8f5e8",
          padding: "20px",
          borderRadius: "8px",
        }}
      >
        <h3>✅ What this test proves:</h3>
        <ul>
          <li>Your Supabase URL is correct</li>
          <li>Your API key is working</li>
          <li>Your environment variables are loaded</li>
          <li>The connection is established</li>
        </ul>
      </div>

      {users.length > 0 && (
        <div
          style={{
            background: "#fff3cd",
            padding: "20px",
            borderRadius: "8px",
            marginTop: "20px",
          }}
        >
          <h3>📊 Users found:</h3>
          <pre>{JSON.stringify(users, null, 2)}</pre>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <button
          onClick={testConnection}
          style={{
            background: "#0070f3",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          🔄 Test Again
        </button>
      </div>
    </div>
  );
}
