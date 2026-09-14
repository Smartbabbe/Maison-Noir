import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { supabase } from "../supabaseClient";

interface TrackOrderPageProps {
  onNavigate: (page: string) => void;
}

export default function TrackOrderPage({ onNavigate }: TrackOrderPageProps) {
  const { theme } = useTheme();
  const dark = theme === "dark";
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    setLoading(true);
    setNotFound(false);
    setOrder(null);

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("email", email)
      .eq("order_reference", reference)
      .single();

    setLoading(false);

    if (error || !data) {
      setNotFound(true);
    } else {
      setOrder(data);
    }
  };

  return (
    <div
      className={`min-h-screen pt-20 ${dark ? "bg-noir-900 text-noir-50" : "bg-white text-noir-900"}`}
    >
      <div className="max-w-xl mx-auto px-6 py-16">
        <button
          onClick={() => onNavigate("home")}
          className={`flex items-center gap-2 font-body text-xs tracking-widest uppercase mb-6 ${dark ? "text-noir-400 hover:text-gold" : "text-noir-500 hover:text-gold"}`}
        >
          ← Back to Home
        </button>

        <h1 className={`font-display text-4xl font-light mb-8 ${dark ? "text-noir-50" : "text-noir-900"}`}>
          Track Your Order
        </h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className={`block font-body text-xs tracking-widest uppercase mb-2 ${dark ? "text-noir-400" : "text-noir-500"}`}>
              Email Address
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 font-body text-sm border focus:outline-none focus:border-gold ${dark ? "bg-noir-800 border-white/10 text-noir-100" : "bg-white border-black/10 text-noir-900"}`}
            />
          </div>
          <div>
            <label className={`block font-body text-xs tracking-widest uppercase mb-2 ${dark ? "text-noir-400" : "text-noir-500"}`}>
              Order Reference
            </label>
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className={`w-full px-4 py-3 font-body text-sm border focus:outline-none focus:border-gold ${dark ? "bg-noir-800 border-white/10 text-noir-100" : "bg-white border-black/10 text-noir-900"}`}
            />
          </div>
        </div>

        <button onClick={handleTrack} className="btn-gold">
          {loading ? "Checking..." : "Track Order"}
        </button>

        {notFound && (
          <p className="text-red-500 text-sm mt-6">
            No order found with that email and reference number.
          </p>
        )}

        {order && (
          <div className={`mt-8 p-6 border ${dark ? "border-white/10" : "border-black/10"}`}>
            <p className={`font-body text-xs tracking-widest uppercase mb-2 ${dark ? "text-noir-400" : "text-noir-500"}`}>
              Status
            </p>
            <p className={`font-display text-2xl mb-4 text-gold`}>{order.status}</p>
            <p className={`font-body text-sm ${dark ? "text-noir-300" : "text-noir-600"}`}>
              {order.first_name} {order.last_name} · {order.address}, {order.city}, {order.country}
            </p>
            <p className={`font-body text-sm mt-2 ${dark ? "text-noir-300" : "text-noir-600"}`}>
              Order total: ${order.total_usd.toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}