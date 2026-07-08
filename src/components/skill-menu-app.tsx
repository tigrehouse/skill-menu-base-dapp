"use client";

import {
  BadgeDollarSign,
  BadgeCheck,
  Clock3,
  ConciergeBell,
  Loader2,
  MenuSquare,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseEventLogs, type Address } from "viem";
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import {
  MAX_DELIVERY_LENGTH,
  MAX_DETAILS_LENGTH,
  MAX_PRICE_LENGTH,
  MAX_SKILL_LENGTH,
  skillMenuAbi,
  skillMenuContractAddress,
} from "@/lib/skill-menu";

const DELIVERY_OPTIONS = ["24h", "2-3 days", "This week", "Custom"] as const;

function shortAddress(address?: Address) {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "--";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatDate(value?: bigint) {
  if (!value) return "--";
  return new Date(Number(value) * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function friendlyError(error: unknown) {
  if (!(error instanceof Error)) return "Transaction was cancelled.";
  if (error.message.includes("User rejected")) return "Request cancelled in wallet.";
  if (error.message.includes("Invalid skill")) return "Skill needs 1 to 48 characters.";
  if (error.message.includes("Invalid price")) return "Price note needs 1 to 28 characters.";
  if (error.message.includes("Invalid delivery")) return "Delivery needs 1 to 28 characters.";
  if (error.message.includes("Invalid details")) return "Details need 1 to 220 characters.";
  return error.message;
}

function SkillCard({
  skillName,
  priceNote,
  deliveryTime,
  details,
  creator,
  createdAt,
}: {
  skillName: string;
  priceNote: string;
  deliveryTime: string;
  details: string;
  creator?: Address;
  createdAt?: bigint;
}) {
  return (
    <article className="relative overflow-hidden rounded-[8px] border border-[#1f2430] bg-[#fffdf7] p-5 text-[#1f2430] shadow-[0_28px_90px_rgba(31,36,48,0.16)] sm:p-8">
      <div className="absolute inset-y-0 right-0 w-24 bg-[#2bb7b0]" />
      <div className="absolute right-6 top-6 grid h-16 w-16 place-items-center rounded-[8px] border border-[#1f2430] bg-[#ff6361] text-white">
        <ConciergeBell className="h-9 w-9" />
      </div>
      <div className="relative pr-20">
        <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#2b7f7a]">Skill Menu</p>
        <h2 className="mt-4 max-w-4xl break-words text-5xl font-black leading-none sm:text-7xl">
          {skillName || "Untitled skill"}
        </h2>
      </div>

      <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
        <div className="rounded-[8px] border border-[#1f2430] bg-[#1f2430] p-4 text-white">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#ffd166]">Price</p>
          <p className="mt-2 break-words text-3xl font-black">{priceNote}</p>
        </div>
        <div className="rounded-[8px] border border-[#1f2430] bg-[#ffd166] p-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#6f5200]">Delivery</p>
          <p className="mt-2 break-words text-3xl font-black">{deliveryTime}</p>
        </div>
        <div className="rounded-[8px] border border-[#1f2430] bg-[#dff4ee] p-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#2b7f7a]">Chain</p>
          <p className="mt-2 text-3xl font-black">Base</p>
        </div>
      </div>

      <section className="relative mt-5 rounded-[8px] border border-[#1f2430] bg-[#fbf6ec] p-5">
        <div className="flex items-center gap-2">
          <MenuSquare className="h-5 w-5 text-[#ff6361]" />
          <h3 className="text-xl font-black">Service details</h3>
        </div>
        <p className="mt-5 min-h-[220px] whitespace-pre-wrap text-2xl font-semibold leading-10">
          {details || "Describe the useful thing you can deliver."}
        </p>
      </section>

      <div className="relative mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[8px] border border-[#1f2430] bg-[#fbf6ec] p-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#2b7f7a]">Creator</p>
          <p className="mt-2 text-xl font-black">{shortAddress(creator)}</p>
        </div>
        <div className="rounded-[8px] border border-[#1f2430] bg-[#fbf6ec] p-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#2b7f7a]">Published</p>
          <p className="mt-2 text-xl font-black">{formatDate(createdAt)}</p>
        </div>
      </div>
    </article>
  );
}

export function SkillMenuApp() {
  const [skillIdInput, setSkillIdInput] = useState("1");
  const [skillName, setSkillName] = useState("Mini app polish review");
  const [priceNote, setPriceNote] = useState("0.01 ETH");
  const [deliveryTime, setDeliveryTime] = useState<(typeof DELIVERY_OPTIONS)[number]>("24h");
  const [details, setDetails] = useState(
    "I review your Base mini app screen, find confusing flows, and send a short fix list for mobile polish.",
  );
  const [message, setMessage] = useState("Publish a creator service card on Base.");
  const [lastAction, setLastAction] = useState<"create" | null>(null);

  const { address, chainId, connector, isConnected } = useAccount();
  const { connectors, connectAsync, isPending: connecting } = useConnect();
  const { disconnectAsync } = useDisconnect();
  async function disconnectWallet() {
    try {
      if (connector) {
        await disconnectAsync({ connector });
      } else {
        await disconnectAsync();
      }
    } catch {}
  }
  const { switchChain, isPending: switching } = useSwitchChain();
  const { data: hash, writeContractAsync, isPending: writing } = useWriteContract();
  const { data: receipt, isLoading: confirming } = useWaitForTransactionReceipt({ hash });

  const selectedConnector =
    connectors.find((connector) => connector.id === "injected") ??
    connectors.find((connector) => connector.id === "baseAccount") ??
    connectors[0];
  const parsedSkillId = BigInt(Math.max(1, Number(skillIdInput || "1")));

  const skillQuery = useReadContract({
    abi: skillMenuAbi,
    address: skillMenuContractAddress,
    functionName: "getSkill",
    args: [parsedSkillId],
    query: { enabled: Boolean(skillMenuContractAddress), refetchInterval: 12000 },
  });

  const totalQuery = useReadContract({
    abi: skillMenuAbi,
    address: skillMenuContractAddress,
    functionName: "nextSkillId",
    query: { enabled: Boolean(skillMenuContractAddress), refetchInterval: 12000 },
  });

  const tuple = skillQuery.data as
    | readonly [Address, string, string, string, string, bigint]
    | undefined;

  const liveSkill = useMemo(
    () =>
      tuple
        ? {
            creator: tuple[0],
            skillName: tuple[1],
            priceNote: tuple[2],
            deliveryTime: tuple[3],
            details: tuple[4],
            createdAt: tuple[5],
          }
        : undefined,
    [tuple],
  );

  const totalSkills = totalQuery.data ? Math.max(Number(totalQuery.data) - 1, 0) : 0;
  const validFields =
    skillName.trim().length > 0 &&
    skillName.trim().length <= MAX_SKILL_LENGTH &&
    priceNote.trim().length > 0 &&
    priceNote.trim().length <= MAX_PRICE_LENGTH &&
    deliveryTime.trim().length > 0 &&
    deliveryTime.trim().length <= MAX_DELIVERY_LENGTH &&
    details.trim().length > 0 &&
    details.trim().length <= MAX_DETAILS_LENGTH;

  const createBlocker = !skillMenuContractAddress
    ? "Contract not deployed yet. Run npm run deploy:contract, then add NEXT_PUBLIC_SKILL_MENU_CONTRACT_ADDRESS."
    : !isConnected
      ? "Connect wallet first."
      : chainId !== base.id
        ? "Switch to Base first."
        : !validFields
          ? "Fill skill, price, delivery, and details."
          : "";

  useEffect(() => {
    if (!receipt || lastAction !== "create") return;
    void totalQuery.refetch();
    void skillQuery.refetch();
    const logs = parseEventLogs({ abi: skillMenuAbi, logs: receipt.logs, eventName: "SkillPublished" });
    const skillId = logs[0]?.args.skillId;
    window.setTimeout(() => {
      if (skillId) setSkillIdInput(skillId.toString());
      setMessage(skillId ? `Skill #${skillId.toString()} published on Base.` : "Skill published on Base.");
    }, 0);
  }, [lastAction, receipt, skillQuery, totalQuery]);

  async function connectWallet() {
    const connectorQueue = [
      connectors.find((connector) => connector.id === "injected"),
      connectors.find((connector) => connector.id === "baseAccount"),
      selectedConnector,
    ]
      .filter((connector): connector is NonNullable<typeof selectedConnector> => Boolean(connector))
      .filter((connector, index, queue) => queue.findIndex((item) => item.id === connector.id) === index);

    if (connectorQueue.length === 0) {
      setMessage("No wallet connector found. Open this app inside Base App or a wallet browser.");
      return;
    }

    let lastError: unknown;
    setMessage("Opening wallet connection...");
    for (const connector of connectorQueue) {
      try {
        await connectAsync({ connector });
        setMessage("Wallet connected. Publish a skill when ready.");
        return;
      } catch (error) {
        lastError = error;
      }
    }
    setMessage(friendlyError(lastError));
  }

  async function publishSkill() {
    const contractAddress = skillMenuContractAddress;
    if (createBlocker) {
      setMessage(createBlocker);
      return;
    }
    if (!contractAddress) {
      setMessage("Contract not deployed yet. Run npm run deploy:contract first.");
      return;
    }
    try {
      setLastAction("create");
      setMessage("Confirm the skill card in your wallet.");
      await writeContractAsync({
        address: contractAddress,
        abi: skillMenuAbi,
        functionName: "publishSkill",
        args: [skillName.trim(), priceNote.trim(), deliveryTime.trim(), details.trim()],
        chainId: base.id,
      });
      setMessage("Skill sent. Waiting for Base confirmation...");
    } catch (error) {
      setMessage(friendlyError(error));
    }
  }

  return (
    <main className="min-h-screen bg-[#fbf6ec] text-[#1f2430]">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-4 px-4 py-4 lg:grid-cols-[392px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[8px] border border-[#1f2430] bg-[#fffdf7] p-4 shadow-[0_20px_80px_rgba(31,36,48,0.12)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#2b7f7a]">Skill Menu</p>
              <h1 className="mt-2 text-4xl font-black leading-none">List what you do.</h1>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[8px] border border-[#1f2430] bg-[#ff6361] text-white">
              <Store className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[8px] border border-[#1f2430] bg-[#fbf6ec] p-3">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#2b7f7a]">Skills</p>
              <p className="mt-2 text-3xl font-black">{totalSkills}</p>
            </div>
            <div className="rounded-[8px] border border-[#1f2430] bg-[#1f2430] p-3 text-white">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#ffd166]">Chain</p>
              <p className="mt-2 text-xl font-black">Base</p>
            </div>
          </div>

          <section className="mt-4 rounded-[8px] border border-[#1f2430] bg-[#fbf6ec] p-4">
            <h2 className="text-xl font-black">New skill</h2>
            <div className="mt-4 space-y-3">
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#2b7f7a]">Skill</span>
                <input value={skillName} onChange={(event) => setSkillName(event.target.value)} maxLength={MAX_SKILL_LENGTH} className="mt-1 w-full rounded-[8px] border border-[#1f2430] bg-[#fffdf7] px-3 py-3 font-black outline-none" />
              </label>
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#2b7f7a]">Price</span>
                <input value={priceNote} onChange={(event) => setPriceNote(event.target.value)} maxLength={MAX_PRICE_LENGTH} className="mt-1 w-full rounded-[8px] border border-[#1f2430] bg-[#fffdf7] px-3 py-3 font-black outline-none" />
              </label>
              <div>
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#2b7f7a]">Delivery</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {DELIVERY_OPTIONS.map((value) => (
                    <button key={value} className={`rounded-[8px] border px-2 py-3 text-sm font-black ${value === deliveryTime ? "border-[#1f2430] bg-[#ffd166]" : "border-[#1f2430] bg-[#fffdf7]"}`} onClick={() => setDeliveryTime(value)}>
                      {value}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#2b7f7a]">Details</span>
                <textarea value={details} onChange={(event) => setDetails(event.target.value)} maxLength={MAX_DETAILS_LENGTH} rows={5} className="mt-1 w-full rounded-[8px] border border-[#1f2430] bg-[#fffdf7] px-3 py-3 text-sm font-bold leading-6 outline-none" />
              </label>
            </div>
          </section>

          <div className="mt-4 space-y-3">
            {isConnected && chainId !== base.id ? (
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#1f2430] bg-[#ffd166] px-4 py-3 font-black disabled:opacity-60" disabled={switching} onClick={() => switchChain({ chainId: base.id })}>
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Switch to Base
              </button>
            ) : (
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] bg-[#2bb7b0] px-4 py-3 font-black text-white disabled:opacity-60" disabled={writing || confirming} onClick={publishSkill}>
                {writing || confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Publish Skill
              </button>
            )}
            {isConnected ? (
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#1f2430] bg-[#fffdf7] px-4 py-3 font-black" onClick={disconnectWallet}>{shortAddress(address)}</button>
            ) : (
              <button className="inline-flex w-full items-center justify-center gap-2 rounded-[8px] border border-[#1f2430] bg-[#fffdf7] px-4 py-3 font-black disabled:opacity-60" disabled={!selectedConnector || connecting} onClick={connectWallet}>
                {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
                Connect wallet
              </button>
            )}
            <p className="rounded-[8px] border border-[#1f2430] bg-[#fbf6ec] px-3 py-3 text-sm font-bold leading-6">{message}</p>
            {hash ? <a className="block rounded-[8px] border border-[#1f2430] bg-[#1f2430] px-3 py-3 text-xs font-black leading-5 text-[#ffd166] underline" href={`https://basescan.org/tx/${hash}`} rel="noreferrer" target="_blank">View transaction on BaseScan</a> : null}
            {createBlocker && isConnected ? <p className="rounded-[8px] border border-[#1f2430] bg-[#fffdf7] px-3 py-3 text-xs font-bold leading-5">{createBlocker}</p> : null}
          </div>
        </aside>

        <section className="grid gap-4">
          <SkillCard skillName={liveSkill?.skillName || skillName} priceNote={liveSkill?.priceNote || priceNote} deliveryTime={liveSkill?.deliveryTime || deliveryTime} details={liveSkill?.details ?? details} creator={liveSkill?.creator} createdAt={liveSkill?.createdAt} />
          <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
            <div className="rounded-[8px] border border-[#1f2430] bg-[#fffdf7] p-4">
              <div className="flex items-center gap-2"><Search className="h-5 w-5" /><h2 className="text-2xl font-black">Load skill</h2></div>
              <label className="mt-4 block">
                <span className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#2b7f7a]">Skill ID</span>
                <input value={skillIdInput} onChange={(event) => setSkillIdInput(event.target.value.replace(/\D/g, ""))} className="mt-1 w-full rounded-[8px] border border-[#1f2430] bg-[#fbf6ec] px-3 py-3 text-2xl font-black outline-none" />
              </label>
            </div>
            <div className="rounded-[8px] border border-[#1f2430] bg-[#fffdf7] p-4">
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#2b7f7a]">What it does</p>
              <p className="mt-3 max-w-xl text-sm font-bold leading-6">Skill Menu publishes a creator service card with skill, price, delivery time, creator wallet, and timestamp on Base.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1f2430] bg-[#fbf6ec] px-3 py-2 text-xs font-black"><Palette className="h-4 w-4 text-[#ff6361]" /> Creator service</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1f2430] bg-[#fbf6ec] px-3 py-2 text-xs font-black"><BadgeDollarSign className="h-4 w-4 text-[#ff6361]" /> Price note</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1f2430] bg-[#fbf6ec] px-3 py-2 text-xs font-black"><Clock3 className="h-4 w-4 text-[#ff6361]" /> Delivery time</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1f2430] bg-[#fbf6ec] px-3 py-2 text-xs font-black"><ShieldCheck className="h-4 w-4 text-[#ff6361]" /> Onchain card</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1f2430] bg-[#fbf6ec] px-3 py-2 text-xs font-black"><BadgeCheck className="h-4 w-4 text-[#ff6361]" /> Wallet-authored</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
