
import { useEffect, useState } from "react";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { useActiveAccount, ConnectButton } from "thirdweb/react";
import { CHAIN } from "@/lib/chain";
import { thirdwebClient } from "@/lib/thirdweb";

type CheckResult = {
  address: string;
  results: { address: string; tokenId: string; label?: string; owned: boolean }[];
  ownsAny: boolean;
  ownsAll: boolean;
  qualifies: boolean;
  requireAll: boolean;
};

type UserSession = {
  loggedIn: boolean;
  address?: string;
};

export default function Home() {
  const account = useActiveAccount();
  const [status, setStatus] = useState<string>("");
  const [check, setCheck] = useState<CheckResult | null>(null);
  const [user, setUser] = useState<UserSession>({ loggedIn: false });
  const [discordLinked, setDiscordLinked] = useState<boolean>(false);

  const wallets = [
    inAppWallet(),
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
    createWallet("me.rainbow"),
  ];

  useEffect(() => {
   
    fetch("/api/siwe/user").then(r => r.json()).then(setUser);
    
    fetch("/api/discord/status")
      .then(r => r.json())
      .then(data => setDiscordLinked(data.linked));
  }, [account]); 
  async function siwe() {
    if (!account) return setStatus("Please connect a wallet first.");
    setStatus("Generating challenge...");

    try {
      const res = await fetch("/api/siwe/challenge");
      const { nonce } = await res.json();
      if (!res.ok) throw new Error("Failed to get nonce.");

      const message = `Sign in to our app to verify your NFT ownership.\n\nNonce: ${nonce}`;
      const signature = await account.signMessage({ message });

      setStatus("Verifying signature...");
      const verifyRes = await fetch("/api/siwe/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: account.address, signature, message }),
      });

      if (!verifyRes.ok) {
        const errorText = await verifyRes.text();
        throw new Error(`Verification failed: ${errorText}`);
      }

      setStatus("Successfully logged in!");
      const updatedUser = await fetch("/api/siwe/user").then(r => r.json());
      setUser(updatedUser);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  }

  
  async function checkNFTs() {
    setStatus("Checking NFT ownership...");
    setCheck(null);
    try {
      const res = await fetch("/api/check-nfts");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to check NFTs.");
      setCheck(data);
      setStatus("Check complete.");
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  }

  async function grantRole() {
    setStatus("Granting Discord role...");
    try {
      const res = await fetch("/api/discord/add-role", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to grant role.");
      }
      setStatus("🎉 Role granted successfully! Please check your Discord server.");
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-900 text-white">
      <div className="w-full max-w-2xl p-8 space-y-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center">NFT Discord Role Gate</h1>
        
        <div className="flex flex-col items-center space-y-4">
         
          <div className="w-full p-4 border border-gray-600 rounded-lg">
            <h2 className="text-xl font-semibold">Step 1: Connect Your Wallet</h2>
            <p className="text-gray-400 mb-4">Connect the wallet that holds your NFT.</p>
            <ConnectButton
              client={thirdwebClient}
              wallets={wallets}
              chain={CHAIN}
              theme={"dark"}
            />
          </div>

         
          {account && (
            <div className="w-full p-4 border border-gray-600 rounded-lg">
              <h2 className="text-xl font-semibold">Step 2: Sign In with Ethereum</h2>
              <p className="text-gray-400 mb-4">Verify ownership of your wallet by signing a message.</p>
              {!user.loggedIn ? (
                <button onClick={siwe} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-500" disabled={!account}>
                  Sign In
                </button>
              ) : (
                <p className="text-green-400">✅ You are signed in as: {user.address}</p>
              )}
            </div>
          )}

          
          {user.loggedIn && (
            <div className="w-full p-4 border border-gray-600 rounded-lg">
              <h2 className="text-xl font-semibold">Step 3: Link Your Discord Account</h2>
              <p className="text-gray-400 mb-4">Authorize the bot to check your server membership.</p>
              {!discordLinked ? (
                <a href="/api/discord/login" className="block w-full px-4 py-2 font-bold text-center text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                  Link Discord
                </a>
              ) : (
                <p className="text-green-400">✅ Discord account is linked.</p>
              )}
            </div>
          )}

          
          {user.loggedIn && discordLinked && (
            <div className="w-full p-4 border border-gray-600 rounded-lg">
              <h2 className="text-xl font-semibold">Step 4: Verify & Get Role</h2>
              <p className="text-gray-400 mb-4">Check if you own the required NFT(s) to receive your special role.</p>
              <button onClick={checkNFTs} className="w-full px-4 py-2 font-bold text-white bg-purple-600 rounded-lg hover:bg-purple-700">
                Check My NFTs
              </button>
            </div>
          )}
        </div>

       
        {status && <p className="text-center text-gray-300 mt-4">{status}</p>}

        {check && (
          <div className="w-full p-4 mt-6 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold">Verification Results for {check.address}</h3>
            <ul className="list-disc list-inside mt-2">
              {check.results.map((r, i) => (
                <li key={i}>
                  {r.label ?? `${r.address.slice(0, 6)}...#${r.tokenId}`} — {r.owned ? "✅ Owned" : "❌ Not Owned"}
                </li>
              ))}
            </ul>
            <p className="mt-4">
              Requires {check.requireAll ? "ALL" : "ANY"} — Qualifies: {check.qualifies ? "✅ Yes" : "❌ No"}
            </p>
            {check.qualifies && (
              <button onClick={grantRole} className="w-full mt-4 px-4 py-2 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700">
                Get Role!
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
