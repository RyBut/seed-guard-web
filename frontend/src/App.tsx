import { useState, useEffect } from "react";
import axios from "axios";
import { wordlist } from "@scure/bip39/wordlists/english";
import { QRCodeSVG } from "qrcode.react";

function generateBip39SeedPhrase(length = 12): string {
  const phrase = [];
  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * wordlist.length);
    phrase.push(wordlist[index]);
  }
  return phrase.join(" ");
}

export default function App() {
  const [seedWords, setSeedWords] = useState<string[]>(Array(12).fill(""));
  const [phraseLength, setPhraseLength] = useState(12);
  const [sharesRequired, setSharesRequired] = useState(3);
  const [sharesTotal, setSharesTotal] = useState(5);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [encodeResult, setEncodeResult] = useState<any>(null);
  const [decodePrimary, setDecodePrimary] = useState("");
  const [decodeShares, setDecodeShares] = useState<string[]>([""]);
  const [decodePassword, setDecodePassword] = useState("");
  const [decodedPhrase, setDecodedPhrase] = useState<string[]>([]);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [showShutdownModal, setShowShutdownModal] = useState(false);

  const api = axios.create({ baseURL: "http://localhost:8000" });

  useEffect(() => {
    setSeedWords(Array(phraseLength).fill(""));
  }, [phraseLength]);

  const handleGenerate = () => {
    const phrase = generateBip39SeedPhrase(phraseLength);
    setSeedWords(phrase.split(" "));
  };

  const handleEncode = async () => {
    const phrase = seedWords.join(" ").trim();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      console.log("Sending POST to /encode...");
      const res = await api.post("/encode", {
        seed_phrase: phrase,
        shares_required: sharesRequired,
        shares_total: sharesTotal,
        password,
      });
      console.log("Response status:", res.status);
      console.log("Response data:", res.data);
      setEncodeResult(res.data);
    } catch (err: any) {
      alert("Encoding error: " + err.response?.data?.detail || err.message);
    }
  };

  const handleDecode = async () => {
    try {
      const res = await api.post("/decode", {
        primary: decodePrimary,
        shares: decodeShares.map(s => s.trim()).filter(s => s.length > 0),
        password: decodePassword
      });
      const phrase = Array.isArray(res.data.seed_phrase)
        ? res.data.seed_phrase
        : (res.data.seed_phrase || "").toString().trim().split(/\s+/);
      setDecodedPhrase(phrase);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const message = typeof detail === "string" ? detail : JSON.stringify(detail || err.message);
      alert("Decoding error: " + message);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(text);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch (err) {
      alert("Failed to copy");
    }
  };

  const renderSeedInputs = (words: string[], setWords?: (w: string[]) => void) => {
    const half = Math.ceil(words.length / 2);
    const left = words.slice(0, half);
    const right = words.slice(half);

    return (
      <div className="grid grid-cols-2 gap-4">
        {[left, right].map((group, colIndex) => (
          <div key={colIndex} className="space-y-2">
            {group.map((word, i) => {
              const index = colIndex === 0 ? i : i + half;
              return (
                <div key={index} className="flex items-center gap-2">
                  <label className="text-xs text-gray-400 w-4 text-right">{index + 1}</label>
                  <input
                    type="text"
                    value={word}
                    readOnly={!setWords}
                    onChange={(e) => {
                      if (!setWords) return;
                      const updated = [...words];
                      updated[index] = e.target.value;
                      setWords(updated);
                    }}
                    className="flex-1 p-2 rounded bg-gray-800 border border-gray-600"
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-16 px-4">
      <title>Seed-Guard</title>
      <div className="flex items-center justify-center gap-4 mb-16">
        <img src="/seed-guard-icon.png" alt="Seed-Guard Icon" className="w-12 h-12" />
        <h1 className="text-5xl font-bold">Seed-Guard</h1>
      </div>
      <div className="max-w-6xl mx-auto grid gap-16 grid-cols-1 lg:grid-cols-2">
        {/* Encode Section */}
        <section className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-xl space-y-6 border border-white/10">
          <header className="space-y-2">
            <h2 className="text-3xl font-bold">Encode Seed Phrase</h2>
            <p className="text-gray-300">Split your seed into secure shares.</p>
          </header>

          <div className="flex items-center justify-between">
            <button onClick={handleGenerate} className="text-sm text-blue-400 hover:underline">
              Generate Random Phrase
            </button>
            <select
              value={phraseLength}
              onChange={(e) => setPhraseLength(Number(e.target.value))}
              className="bg-gray-800 border border-gray-600 text-white p-1 rounded"
            >
              <option value={12}>12 words</option>
              <option value={24}>24 words</option>
            </select>
          </div>

          {renderSeedInputs(seedWords, setSeedWords)}

          <div className="grid grid-cols-2 gap-4 text-sm text-gray-300 font-medium px-1">
            <span>Shares Required</span>
            <span>Total Shares</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input type="number" className="p-3 rounded-xl bg-gray-800 border border-gray-600" placeholder="Required" value={sharesRequired} onChange={(e) => setSharesRequired(Number(e.target.value))} />
            <input type="number" className="p-3 rounded-xl bg-gray-800 border border-gray-600" placeholder="Total" value={sharesTotal} onChange={(e) => setSharesTotal(Number(e.target.value))} />
          </div>

          <input type="password" className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600" placeholder="Optional Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <input type="password" className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

          <button onClick={handleEncode} className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold">
            Encode
          </button>

          {encodeResult && (
            <div className="pt-6 space-y-4 border-t border-gray-700">
              <div>
                <h4 className="font-semibold">Primary Piece</h4>
                <div className="space-y-1">
                  <div className="flex justify-end">
                    <button
                      onClick={() => copyToClipboard(encodeResult.primary)}
                      className="text-xs text-blue-300 hover:underline"
                    >
                      {copiedItem === encodeResult.primary ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={() => setQrCodeData(encodeResult.primary)}
                      className="text-xs text-green-300 hover:underline ml-4"
                    >
                      Show QR
                    </button>
                  </div>
                  <textarea className="w-full p-3 bg-gray-700 rounded-md text-sm" rows={3} readOnly value={encodeResult.primary} />
                </div>
              </div>
              <div>
                <h4 className="font-semibold">Shares</h4>
                <ul className="space-y-2 text-sm">
                  {encodeResult.shares.map((s: string, i: number) => (
                    <li key={i} className="relative bg-gray-800 p-3 rounded-md border border-gray-600 break-words">
                      {s}
                      <button onClick={() => copyToClipboard(s)} className="absolute top-2 right-2 text-xs text-blue-300 hover:underline">
                        {copiedItem === s ? "Copied" : "Copy"}
                      </button>
                      <button
                        onClick={() => setQrCodeData(s)}
                        className="absolute bottom-2 right-2 text-xs text-green-300 hover:underline"
                      >
                        QR
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </section>

        {/* Decode Section */}
        <section className="bg-white/5 backdrop-blur-lg p-8 rounded-2xl shadow-xl space-y-6 border border-white/10">
          <header className="space-y-2">
            <h2 className="text-3xl font-bold">Decode Seed Phrase</h2>
            <p className="text-gray-300">Reconstruct your seed using shares + primary.</p>
          </header>

          <textarea className="w-full p-4 rounded-xl bg-gray-800 border border-gray-600 placeholder-gray-400" rows={3} placeholder="Enter primary piece..." value={decodePrimary} onChange={(e) => setDecodePrimary(e.target.value)} />

          <textarea className="w-full p-4 rounded-xl bg-gray-800 border border-gray-600 placeholder-gray-400" rows={5} placeholder="Enter shares (one per line)" value={decodeShares.join("\n")} onChange={(e) => setDecodeShares(e.target.value.split("\n"))} />

          <input type="password" className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600" placeholder="Optional Password" value={decodePassword} onChange={(e) => setDecodePassword(e.target.value)} />

          <button onClick={handleDecode} className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-semibold">
            Decode
          </button>

          {decodedPhrase.length > 0 && (
            <div className="pt-6 space-y-2 border-t border-gray-700">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Recovered Seed Phrase</h4>
                <button
                  onClick={() => copyToClipboard(decodedPhrase.join(" "))}
                  className="text-xs text-blue-300 hover:underline"
                >
                  {copiedItem === decodedPhrase.join(" ") ? "Copied" : "Copy All"}
                </button>
              </div>
              {renderSeedInputs(decodedPhrase, () => {})}
            </div>
          )}
        </section>
      </div>

      <div className="mt-16 flex justify-center">
        <button
          onClick={() => {
            setShowShutdownModal(true); 
            setTimeout(() => {
              fetch("/shutdown", { method: "POST" });
            }, 500); 
          }}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white font-semibold"
        >
          Stop App
        </button>
      </div>

      {qrCodeData && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-black shadow-2xl relative">
            <button
              onClick={() => setQrCodeData(null)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              ✕
            </button>
            <QRCodeSVG value={qrCodeData} size={256} />
          </div>
        </div>
      )}

      {showShutdownModal && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60]">
          <div className="bg-white p-6 rounded-xl text-black shadow-2xl relative max-w-md w-full text-center animate-fade-in">
            <h3 className="text-2xl font-bold mb-2">App Stopped</h3>
            <p className="mb-4 text-gray-700">
              The backend server has shut down. You may now close this tab.
            </p>
            <button
              onClick={() => window.location.href = "about:blank"}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Close Tab
            </button>
          </div>
        </div>
      )}
    </div>
    
  );
}