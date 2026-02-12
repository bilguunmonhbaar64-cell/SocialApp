import Constants from "expo-constants";
import { Platform } from "react-native";

// ─── Pick the right server URL per platform ─────────────────────────────
// Web browser     → localhost works directly
// Android/iOS     → use the same host that Expo DevTools is using
//                   (this auto-detects your PC's IP for physical devices)
const getBaseUrl = (): string => {
  if (Platform.OS === "web") {
    return "http://localhost:4000";
  }

  // For native (Android/iOS): try to get the dev server host from Expo
  const debuggerHost =
    Constants.expoConfig?.hostUri ??
    Constants.manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    const host = debuggerHost.split(":")[0]; // strip the Expo port
    console.log("[API] Detected dev host:", host);
    return `http://${host}:4000`;
  }

  // Fallback: Android emulator uses 10.0.2.2, iOS uses localhost
  if (Platform.OS === "android") {
    return "http://10.0.2.2:4000";
  }
  return "http://localhost:4000";
};

const BASE_URL = getBaseUrl();

console.log(`[API] Platform: ${Platform.OS}, BASE_URL: ${BASE_URL}`);

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> {
  try {
    console.log("[API] registerUser called", {
      name,
      email,
      url: `${BASE_URL}/api/auth/register`,
    });

    const response = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const json = await response.json();
    console.log("[API] register response", {
      status: response.status,
      body: json,
    });

    if (!response.ok) {
      const errorMsg =
        json.message ||
        json.error ||
        (json.details ? JSON.stringify(json.details) : null) ||
        `Registration failed (HTTP ${response.status})`;
      console.warn("[API] register error:", errorMsg);
      return { error: errorMsg };
    }

    console.log("[API] register success", json.user);
    return { data: json };
  } catch (err: any) {
    console.error("[API] register network error:", err);
    return { error: err.message || "Network error – is the server running?" };
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<ApiResponse<AuthResponse>> {
  try {
    console.log("[API] loginUser called", {
      email,
      url: `${BASE_URL}/api/auth/login`,
    });

    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await response.json();
    console.log("[API] login response", {
      status: response.status,
      body: json,
    });

    if (!response.ok) {
      const errorMsg =
        json.message || json.error || `Login failed (HTTP ${response.status})`;
      console.warn("[API] login error:", errorMsg);
      return { error: errorMsg };
    }

    console.log("[API] login success", json.user);
    return { data: json };
  } catch (err: any) {
    console.error("[API] login network error:", err);
    return { error: err.message || "Network error – is the server running?" };
  }
}
