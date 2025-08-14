import { createThirdwebClient } from "thirdweb";

function getClientConfig() {
  if (typeof window === "undefined") {
    // ✅ Server-side: Use secret key
    return {
      secretKey: process.env.THIRDWEB_SECRET_KEY!,
    };
  } else {
    // ✅ Client-side: Use public client ID
    return {
      clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
    };
  }
}

export const thirdwebClient = createThirdwebClient(getClientConfig());
