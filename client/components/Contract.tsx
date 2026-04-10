"use client";

import { useState, useCallback } from "react";
import {
  registerCreator,
  isCreator,
  tipCreator,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" x2="19" y1="8" y2="14" />
      <line x1="22" x2="16" y1="11" y2="11" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────

type Tab = "register" | "verify" | "tip";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("register");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTipping, setIsTipping] = useState(false);

  const [verifyAddress, setVerifyAddress] = useState("");
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);

  const [tipAddress, setTipAddress] = useState("");
  const [tipAmount, setTipAmount] = useState("");

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleRegister = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsRegistering(true);
    setTxStatus("Awaiting signature...");
    try {
      await registerCreator(walletAddress);
      setTxStatus("Registered as creator on-chain!");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsRegistering(false);
    }
  }, [walletAddress]);

  const handleVerify = useCallback(async () => {
    if (!verifyAddress.trim()) return setError("Enter an address to verify");
    setError(null);
    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const result = await isCreator(verifyAddress.trim(), walletAddress || undefined);
      setVerifyResult(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsVerifying(false);
    }
  }, [verifyAddress, walletAddress]);

  const handleTip = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!tipAddress.trim()) return setError("Enter creator address");
    if (!tipAmount.trim() || isNaN(Number(tipAmount)) || Number(tipAmount) <= 0) return setError("Enter a valid amount");
    setError(null);
    setIsTipping(true);
    setTxStatus("Awaiting signature...");
    try {
      await tipCreator(walletAddress, tipAddress.trim(), BigInt(Number(tipAmount) * 10000000)); // Convert to stroops
      setTxStatus("Tip sent successfully!");
      setTipAddress("");
      setTipAmount("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsTipping(false);
    }
  }, [walletAddress, tipAddress, tipAmount]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "register", label: "Join", icon: <UserPlusIcon />, color: "#7c6cf0" },
    { key: "verify", label: "Verify", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "tip", label: "Tip", icon: <HeartIcon />, color: "#f472b6" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("successfully") || txStatus.includes("sent") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#f472b6]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f472b6]">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Creator Economy</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="success" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setVerifyResult(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Register */}
            {activeTab === "register" && (
              <div className="space-y-5">
                <MethodSignature name="register_creator" params="(creator: Address)" color="#7c6cf0" />
                
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="text-sm text-white/60 leading-relaxed">
                    Register as a creator on the platform to receive tips and support from your audience.
                  </p>
                </div>

                {walletAddress ? (
                  <ShimmerButton onClick={handleRegister} disabled={isRegistering} shimmerColor="#7c6cf0" className="w-full">
                    {isRegistering ? <><SpinnerIcon /> Registering...</> : <><UserPlusIcon /> Become a Creator</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to register
                  </button>
                )}
              </div>
            )}

            {/* Verify */}
            {activeTab === "verify" && (
              <div className="space-y-5">
                <MethodSignature name="is_creator" params="(creator: Address)" returns="-> bool" color="#4fc3f7" />
                <Input 
                  label="Creator Address" 
                  value={verifyAddress} 
                  onChange={(e) => setVerifyAddress(e.target.value)} 
                  placeholder="G... address to verify" 
                />
                <ShimmerButton onClick={handleVerify} disabled={isVerifying} shimmerColor="#4fc3f7" className="w-full">
                  {isVerifying ? <><SpinnerIcon /> Checking...</> : <><SearchIcon /> Verify Creator</>}
                </ShimmerButton>

                {verifyResult !== null && (
                  <div className={cn(
                    "rounded-xl border px-4 py-3 animate-fade-in-up",
                    verifyResult 
                      ? "border-[#34d399]/20 bg-[#34d399]/[0.05]" 
                      : "border-[#fbbf24]/20 bg-[#fbbf24]/[0.05]"
                  )}>
                    <div className="flex items-center gap-2">
                      {verifyResult ? (
                        <>
                          <CheckIcon />
                          <span className="text-sm text-[#34d399]">This address is a registered creator</span>
                        </>
                      ) : (
                        <>
                          <AlertIcon />
                          <span className="text-sm text-[#fbbf24]">This address is not a creator</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tip */}
            {activeTab === "tip" && (
              <div className="space-y-5">
                <MethodSignature name="tip_creator" params="(from: Address, to: Address, amount: i128)" color="#f472b6" />
                
                <Input 
                  label="Creator Address" 
                  value={tipAddress} 
                  onChange={(e) => setTipAddress(e.target.value)} 
                  placeholder="G... address of creator" 
                />
                <Input 
                  label="Amount (XLM)" 
                  type="number"
                  min="0"
                  step="0.0000001"
                  value={tipAmount} 
                  onChange={(e) => setTipAmount(e.target.value)} 
                  placeholder="0.5" 
                />

                {walletAddress ? (
                  <ShimmerButton onClick={handleTip} disabled={isTipping} shimmerColor="#f472b6" className="w-full">
                    {isTipping ? <><SpinnerIcon /> Sending...</> : <><HeartIcon /> Send Tip</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#f472b6]/20 bg-[#f472b6]/[0.03] py-4 text-sm text-[#f472b6]/60 hover:border-[#f472b6]/30 hover:text-[#f472b6]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to tip
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Creator Economy &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#7c6cf0]" />
                <span className="font-mono text-[9px] text-white/15">Register</span>
              </span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#4fc3f7]" />
                <span className="font-mono text-[9px] text-white/15">Verify</span>
              </span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#f472b6]" />
                <span className="font-mono text-[9px] text-white/15">Tip</span>
              </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}