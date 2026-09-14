import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { usePaystackPayment } from "react-paystack";
import { supabase } from "../supabaseClient";

interface CheckoutPageProps {
  onNavigate: (page: string) => void;
}

export default function CheckoutPage({ onNavigate }: CheckoutPageProps) {
  const { theme } = useTheme();
  const { items, total, setIsOpen } = useCart();
  const dark = theme === "dark";
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    zip: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

    const validateDelivery = () => {
    const newErrors: Record<string, string> = {};
    const required = ["firstName", "lastName", "email", "phone", "address", "city", "country"];

    required.forEach((field) => {
      if (!form[field as keyof typeof form].trim()) {
        newErrors[field] = "This field is required";
      }
    });

    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const NGN_RATE = 1600; // approximate USD → NGN rate; update this if it drifts
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: form.email,
    amount: Math.round(total * NGN_RATE * 100), // total (USD) converted to Naira, then to kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const handlePaystackSuccess = async (reference: any) => {
    try {
      const res = await fetch("/api/verify-transaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference: reference.reference }),
      });
      const data = await res.json();

      if (data.status === true) {
        const { error } = await supabase.from("orders").insert({
          email: form.email,
          order_reference: reference.reference,
          first_name: form.firstName,
          last_name: form.lastName,
          address: form.address,
          city: form.city,
          country: form.country,
          total_usd: total,
        });

        if (error) {
          console.error("Failed to save order:", error);
        }

        setOrderPlaced(true);
        setIsOpen(false);
      } else {
        alert(
          "Payment could not be verified. Please try again or contact support.",
        );
      }
    } catch (err) {
      alert("Something went wrong verifying your payment.");
    }
  };

  const handlePlaceOrder = () => {
    initializePayment({
      onSuccess: handlePaystackSuccess,
      onClose: () => {
        console.log("Payment popup closed");
      },
    });
  };

  if (orderPlaced) {
    return (
      <div
        className={`min-h-screen pt-20 flex items-center justify-center ${dark ? "bg-noir-900" : "bg-white"}`}
      >
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-6">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#C9A84C"
              strokeWidth="1.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2
            className={`font-display text-4xl font-light mb-3 ${dark ? "text-noir-50" : "text-noir-900"}`}
          >
            Order Confirmed
          </h2>
          <p
            className={`font-body text-sm leading-relaxed mb-8 ${dark ? "text-noir-400" : "text-noir-500"}`}
          >
            Thank you for your order. A confirmation has been sent to{" "}
            {form.email || "your email"}. Your pieces will be carefully prepared
            and dispatched within 2–3 business days.
          </p>
          <button onClick={() => onNavigate("home")} className="btn-gold">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen pt-20 ${dark ? "bg-noir-900 text-noir-50" : "bg-white text-noir-900"}`}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-16">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => onNavigate("home")}
            className={`flex items-center gap-2 font-body text-xs tracking-widest uppercase mb-6 transition-colors ${dark ? "text-noir-400 hover:text-gold" : "text-noir-500 hover:text-gold"}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Continue Shopping
          </button>
          <h1
            className={`font-display text-5xl font-light ${dark ? "text-noir-50" : "text-noir-900"}`}
          >
            Checkout
          </h1>

          {/* Steps */}
          <div className="flex items-center gap-4 mt-6">
            {["Delivery", "Review", "Payment"].map((s, i) => (
              <div key={s} className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium transition-colors ${
                      step > i + 1
                        ? "bg-gold text-noir-900"
                        : step === i + 1
                          ? "bg-gold text-noir-900"
                          : dark
                            ? "bg-noir-700 text-noir-400"
                            : "bg-noir-100 text-noir-400"
                    }`}
                  >
                    {step > i + 1 ? "✓" : i + 1}
                  </div>
                  <span
                    className={`font-body text-xs tracking-widest uppercase ${
                      step === i + 1
                        ? "text-gold"
                        : dark
                          ? "text-noir-500"
                          : "text-noir-400"
                    }`}
                  >
                    {s}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`w-12 h-px ${dark ? "bg-white/10" : "bg-black/10"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          {/* Form */}
          <div className="md:col-span-2 space-y-8">
            {/* Step 1 — Delivery */}
            {step === 1 && (
              <div>
                <h2
                  className={`font-display text-2xl font-light mb-6 ${dark ? "text-noir-50" : "text-noir-900"}`}
                >
                  Delivery Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "firstName", label: "First Name", col: 1 },
                    { name: "lastName", label: "Last Name", col: 1 },
                    { name: "email", label: "Email Address", col: 2 },
                    { name: "phone", label: "Phone Number", col: 2 },
                    { name: "address", label: "Street Address", col: 2 },
                    { name: "city", label: "City", col: 1 },
                    { name: "country", label: "Country", col: 1 },
                    { name: "zip", label: "Postal Code", col: 1 },
                  ].map((field) => (
                    <div
                      key={field.name}
                      className={field.col === 2 ? "col-span-2" : ""}
                    >
                      <label
                        className={`block font-body text-xs tracking-widest uppercase mb-2 ${dark ? "text-noir-400" : "text-noir-500"}`}
                      >
                        {field.label}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 font-body text-sm border focus:outline-none focus:border-gold transition-colors ${
                          errors[field.name]
                            ? "border-red-500"
                            : dark
                              ? "bg-noir-800 border-white/10 text-noir-100 placeholder-noir-600"
                              : "bg-white border-black/10 text-noir-900 placeholder-noir-400"
                        }`}
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    if (validateDelivery()) setStep(2);
                  }}
                  className="btn-gold mt-8"
                >
                  Preview Delivery Details
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            )}

            {/* Step 2 — Review */}
            {step === 2 && (
              <div>
                <h2
                  className={`font-display text-2xl font-light mb-6 ${dark ? "text-noir-50" : "text-noir-900"}`}
                >
                  Review Your Order
                </h2>

                {/* Delivery summary */}
                <div
                  className={`p-6 mb-8 border ${dark ? "border-white/10" : "border-black/10"}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <p
                      className={`font-body text-xs tracking-widest uppercase ${dark ? "text-noir-400" : "text-noir-500"}`}
                    >
                      Delivery
                    </p>
                    <button
                      onClick={() => setStep(1)}
                      className="font-body text-xs text-gold hover:text-gold-light"
                    >
                      Edit
                    </button>
                  </div>
                  <p
                    className={`font-body text-sm ${dark ? "text-noir-200" : "text-noir-700"}`}
                  >
                    {form.firstName} {form.lastName} · {form.address},{" "}
                    {form.city}, {form.country}
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className={`btn-outline ${dark ? "text-noir-200 border-white/20" : "text-noir-700 border-black/20"}`}
                  >
                    Back
                  </button>
                  <button onClick={() => setStep(3)} className="btn-gold">
                    Continue to Payment
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Payment */}
            {step === 3 && (
              <div>
                <h2
                  className={`font-display text-2xl font-light mb-6 ${dark ? "text-noir-50" : "text-noir-900"}`}
                >
                  Payment
                </h2>
                <p
                  className={`font-body text-sm leading-relaxed mb-4 ${dark ? "text-noir-400" : "text-noir-500"}`}
                >
                  You'll securely enter your card details via Paystack. Your card
                  information is never stored or processed by Maison Noir
                  directly.
                </p>
                <p
                  className={`font-body text-xs mb-8 ${dark ? "text-noir-500" : "text-noir-400"}`}
                >
                  You'll be charged ₦{(total * NGN_RATE).toLocaleString()}{" "}
                  (Paystack processes in Naira)
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className={`btn-outline ${dark ? "text-noir-200 border-white/20" : "text-noir-700 border-black/20"}`}
                  >
                    Back
                  </button>
                  <button onClick={handlePlaceOrder} className="btn-gold">
                    Place Order · ${total.toLocaleString()}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div
            className={`p-6 h-fit border ${dark ? "border-white/10 bg-noir-800" : "border-black/10 bg-noir-50"}`}
          >
            <h3
              className={`font-display text-xl font-light mb-6 ${dark ? "text-noir-50" : "text-noir-900"}`}
            >
              Order Summary
            </h3>
            <div className="space-y-4 mb-6">
              {items.map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-18 object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`font-display text-sm font-medium truncate ${dark ? "text-noir-100" : "text-noir-800"}`}
                    >
                      {item.name}
                    </p>
                    <p
                      className={`font-body text-xs tracking-wider mt-0.5 ${dark ? "text-noir-500" : "text-noir-400"}`}
                    >
                      {item.color} · Size {item.size} · Qty {item.quantity}
                    </p>
                    <p
                      className={`font-body text-xs font-medium mt-1 ${dark ? "text-noir-200" : "text-noir-700"}`}
                    >
                      ${(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div
              className={`space-y-2 pt-4 border-t ${dark ? "border-white/10" : "border-black/10"}`}
            >
              <div className="flex justify-between">
                <span
                  className={`font-body text-xs tracking-wider ${dark ? "text-noir-400" : "text-noir-500"}`}
                >
                  Subtotal
                </span>
                <span
                  className={`font-body text-xs ${dark ? "text-noir-200" : "text-noir-700"}`}
                >
                  ${total.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span
                  className={`font-body text-xs tracking-wider ${dark ? "text-noir-400" : "text-noir-500"}`}
                >
                  Shipping
                </span>
                <span className="font-body text-xs text-gold">
                  Complimentary
                </span>
              </div>
              <div
                className={`flex justify-between pt-3 border-t ${dark ? "border-white/10" : "border-black/10"}`}
              >
                <span
                  className={`font-body text-xs tracking-widest uppercase ${dark ? "text-noir-300" : "text-noir-600"}`}
                >
                  Total
                </span>
                <span
                  className={`font-display text-xl font-light ${dark ? "text-noir-50" : "text-noir-900"}`}
                >
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
