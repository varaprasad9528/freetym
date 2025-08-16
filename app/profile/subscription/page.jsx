"use client";
import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Store,
  Lightbulb,
  BarChart3,
  Flame,
  CalendarDays,
  UserPlus,
  Layers,
  Brush,
  UsersRound,
  CheckCircle2,
} from "lucide-react";

/* =================== API base + helpers =================== */
function cleanBase(base) {
  const b = (base || "http://localhost:5000").replace(/\/+$/, "");
  try {
    const u = new URL(b.includes("://") ? b : `http://${b}`);
    return u.origin; // e.g., http://localhost:5000
  } catch {
    return "http://localhost:5000";
  }
}
const API_BASE = cleanBase(process.env.NEXT_PUBLIC_API_BASE);

function authHeaders(extra = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

const ENDPOINTS = {
  PLANS: `${API_BASE}/api/subscription/plans`,
  HISTORY: `${API_BASE}/api/subscription/history`,
  ORDER: `${API_BASE}/api/subscription/order`,
  VERIFY: `${API_BASE}/api/subscription/verify`,
  CANCEL: (id) =>
    `${API_BASE}/api/subscription/cancel/${encodeURIComponent(id)}`,
};

/* =================== Page =================== */
export default function SubscriptionPage() {
  const [tab, setTab] = useState("Subscription Plan");
  const [billing, setBilling] = useState("Annually"); // Annually | Monthly
  const [message, setMessage] = useState("");

  // Plans
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansErr, setPlansErr] = useState("");

  // Order + Verify
  const [ordering, setOrdering] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [lastOrder, setLastOrder] = useState(null); // { orderId, planId, ... }

  // History
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(false);
  const [histErr, setHistErr] = useState("");

  // Modal (history card details)
  const [selectedSub, setSelectedSub] = useState(null); // normalized history item
  const closeModal = () => setSelectedSub(null);

  // fetch plans when entering Plan tab
  useEffect(() => {
    if (tab !== "Subscription Plan") return;
    (async () => {
      try {
        setPlansErr("");
        setPlansLoading(true);
        const res = await fetch(ENDPOINTS.PLANS, {
          method: "GET",
          headers: authHeaders(),
          cache: "no-store",
          mode: "cors",
        });
        if (!res.ok) throw new Error("Failed to load plans");
        const data = await res.json();
        setPlans(Array.isArray(data?.plans) ? data.plans : []);
      } catch (e) {
        setPlansErr(e.message || "Unable to load plans");
      } finally {
        setPlansLoading(false);
      }
    })();
  }, [tab]);

  // fetch history when entering History tab
  useEffect(() => {
    if (tab !== "Subscription history") return;
    void reloadHistory();
  }, [tab]);

  const reloadHistory = async () => {
    try {
      setHistErr("");
      setHistLoading(true);
      const res = await fetch(ENDPOINTS.HISTORY, {
        method: "GET",
        headers: authHeaders(),
        cache: "no-store",
        mode: "cors",
      });
      if (!res.ok) throw new Error("Failed to load history");
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : data?.items || []);
    } catch (e) {
      setHistErr(e.message || "Unable to load history");
    } finally {
      setHistLoading(false);
    }
  };

  const handleBuy = async (planId) => {
    setMessage("");
    setLastOrder(null);
    try {
      setOrdering(true);
      const res = await fetch(ENDPOINTS.ORDER, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ planId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.message || "Order creation failed");
        return;
      }
      setLastOrder({ orderId: data?.orderId, planId, raw: data });
      setMessage("Order created. Complete payment and click Verify.");
    } catch {
      setMessage("Network error while creating order");
    } finally {
      setOrdering(false);
    }
  };

  const handleVerify = async () => {
    if (!lastOrder?.orderId) return;
    setMessage("");
    try {
      setVerifying(true);
      const res = await fetch(ENDPOINTS.VERIFY, {
        method: "POST",
        headers: authHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ orderId: lastOrder.orderId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.message || "Verification failed");
        return;
      }
      setMessage(data?.message || "Payment verified successfully");
      await reloadHistory();
      setLastOrder(null);
      setTab("Subscription history");
    } catch {
      setMessage("Network error while verifying");
    } finally {
      setVerifying(false);
    }
  };

  const onCancel = async (subscriptionId) => {
    if (!subscriptionId) return;
    setMessage("");
    try {
      const res = await fetch(ENDPOINTS.CANCEL(subscriptionId), {
        method: "PUT",
        headers: authHeaders(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMessage(data?.message || "Cancel failed");
        return;
      }
      setMessage(data?.message || "Subscription canceled");
      await reloadHistory();
      closeModal(); // close popup after success
    } catch {
      setMessage("Network error while canceling");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0]">
      {/* ===== Header (two rows) ===== */}
      <div className="bg-white">
        {/* Row 1: Title */}
        <div
          className="h-[50px] flex items-center border-b border-[#DCDCDC]"
          style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
        >
          <h2 className="text-lg font-semibold ml-6">Subscription</h2>
        </div>

        {/* Row 2: Tabs (left) + info (right only on Plan tab) */}
        <div
          className="h-[50px] flex items-end justify-between border-b border-[#DCDCDC] px-6"
          style={{ boxShadow: "0px 4px 4px 0px #00000040" }}
        >
          <div className="flex items-end gap-8">
            {["Subscription Plan", "Subscription history"].map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-0 py-0 text-sm font-semibold border-b-[3px] ${
                    active
                      ? "border-[#F16623] text-black"
                      : "border-transparent text-gray-500"
                  }`}
                  style={{ background: "none", paddingBottom: 6 }}
                >
                  {t}
                </button>
              );
            })}
          </div>

          {tab === "Subscription Plan" ? (
            <div className="text-sm text-gray-700 mb-[6px]">
              GST charges apply
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* ===== Flash message ===== */}
      {message && (
        <div className="mx-6 mt-4 rounded-md bg-white border border-[#E7E7E7] px-4 py-2 text-sm text-gray-800">
          {message}
        </div>
      )}

      {/* ===== Content ===== */}
      {tab === "Subscription Plan" ? (
        <PlanView
          billing={billing}
          setBilling={setBilling}
          plans={plans}
          plansLoading={plansLoading}
          plansErr={plansErr}
          onBuy={handleBuy}
          ordering={ordering}
          lastOrder={lastOrder}
          onVerify={handleVerify}
          verifying={verifying}
        />
      ) : (
        <HistoryView
          items={history}
          loading={histLoading}
          error={histErr}
          onCardClick={setSelectedSub} // <<< open modal with this item
        />
      )}

      {/* ===== Popup Modal (history item details) ===== */}
      {selectedSub && (
        <Modal onClose={closeModal}>
          <HistoryModalContent item={selectedSub} onCancel={onCancel} />
        </Modal>
      )}
    </div>
  );
}

/* =================== Subscription Plan View =================== */
function PlanView({
  billing,
  setBilling,
  plans,
  plansLoading,
  plansErr,
  onBuy,
  ordering,
  lastOrder,
  onVerify,
  verifying,
}) {
  const normalizedPlans = useMemo(() => {
    if (!Array.isArray(plans) || plans.length === 0) return [];
    return plans.map((p, i) => ({
      id: p.id || p.planId || p._id || String(i + 1),
      name: p.name || p.title || "Plan",
      priceAnnual:
        p.priceAnnual ?? p.annualPrice ?? p.yearly ?? p.priceYearly ?? null,
      priceMonthly:
        p.priceMonthly ?? p.monthlyPrice ?? p.monthly ?? p.priceMonthly ?? null,
      features: p.features || [],
      raw: p,
    }));
  }, [plans]);

  return (
    <div className="px-6 py-6">
      {/* Loading / Error / Empty */}
      {plansLoading && (
        <div className="text-sm text-gray-700">Loading plans…</div>
      )}
      {plansErr && (
        <div className="text-sm text-red-600">Error: {plansErr}</div>
      )}
      {!plansLoading && !plansErr && normalizedPlans.length === 0 && (
        <div className="text-sm text-gray-700">
          No plans available right now.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left card: API first plan or default */}
        <PlanCard
          plan={
            normalizedPlans[0] || {
              id: "dynamic",
              name: "Dynamic Package",
              priceAnnual: 999,
              priceMonthly: null,
              features: [
                {
                  icon: <LineChart size={18} />,
                  title: "Personal report",
                  desc: "30+ metrics about your account performance",
                },
                {
                  icon: <Store size={18} />,
                  title: "Brand deals",
                  desc: "Marketplace with collaboration offers",
                },
                {
                  icon: <Lightbulb size={18} />,
                  title: "Weekly insights",
                  desc: "Personalised insights and advice",
                },
                {
                  icon: <BarChart3 size={18} />,
                  title: "Content analytics",
                  desc: "In-depth analysis of posted content",
                },
                {
                  icon: <Flame size={18} />,
                  title: "Viral video info",
                  desc: "100K+ trending Reels database",
                },
                {
                  icon: <CalendarDays size={18} />,
                  title: "Daily creator tracking",
                  desc: "Auto-track performance daily",
                },
              ],
            }
          }
          billing={billing}
          fixedBilling="Annually"
          ordering={ordering}
          onBuy={onBuy}
          extraFeaturesRenderer={(features) => (
            <FeatureList features={features} />
          )}
        />

        {/* Right card: API second plan or default with toggle */}
        <PlanCard
          plan={
            normalizedPlans[1] || {
              id: "compee",
              name: "Compee Package",
              priceAnnual: 2999,
              priceMonthly: 299,
              features: [
                {
                  icon: <UsersRound size={18} />,
                  title: "Competitor analysis",
                  desc: "10 reports/mo to analyze others",
                },
                {
                  icon: <Layers size={18} />,
                  title: "Unlimited content analytics",
                  desc: "Analyze posted content from others",
                },
                {
                  icon: <Brush size={18} />,
                  title: "Media kit customization",
                  desc: "Customize cover and links",
                },
                {
                  icon: <UserPlus size={18} />,
                  title: "Tracked accounts",
                  desc: "Auto-track 10 other influencers daily",
                },
              ],
            }
          }
          billing={billing}
          setBilling={setBilling}
          ordering={ordering}
          onBuy={onBuy}
          showBillingToggle
          extraFeaturesRenderer={(features) => (
            <FeatureList features={features} />
          )}
        />
      </div>

      {/* Simple verify flow */}
      {lastOrder?.orderId && (
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={onVerify}
            disabled={verifying}
            className="px-5 py-2 rounded-md bg-[#4C4DDC] text-white text-sm font-semibold disabled:opacity-60"
          >
            {verifying ? "Verifying…" : "Verify Payment"}
          </button>
          <span className="text-xs text-gray-600">
            Order ID: <b>{lastOrder.orderId}</b>
          </span>
        </div>
      )}
    </div>
  );
}

/* ---- One plan card ---- */
function PlanCard({
  plan,
  billing,
  setBilling,
  fixedBilling,
  showBillingToggle,
  ordering,
  onBuy,
  extraFeaturesRenderer,
}) {
  const displayPrice =
    billing === "Annually" || fixedBilling === "Annually"
      ? plan.priceAnnual
      : plan.priceMonthly;

  return (
    <div className="bg-white rounded-xl border border-[#E7E7E7]">
      <div className="p-5">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">{plan.name}</div>
          <div className="text-xs text-gray-500">
            {fixedBilling ? `Billed ${fixedBilling}` : `Billed ${billing}`}
          </div>
        </div>

        <div className="mt-2">
          <div className="flex items-baseline gap-2">
            {displayPrice ? (
              <>
                <span className="text-2xl font-bold">₹{displayPrice}</span>
                <span className="text-lg font-semibold">/-</span>
              </>
            ) : (
              <span className="text-sm text-gray-500">Contact for pricing</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">(GST charges apply)</div>
        </div>

        {/* Billing toggle for plans that support both */}
        {showBillingToggle && (
          <div className="mt-4 space-y-3">
            <BillingOption
              label="Annually"
              price={plan.priceAnnual ? `₹${plan.priceAnnual}/-` : "N/A"}
              checked={billing === "Annually"}
              onChange={() => setBilling?.("Annually")}
            />
            <BillingOption
              label="Monthly"
              price={plan.priceMonthly ? `₹${plan.priceMonthly}/-` : "N/A"}
              checked={billing === "Monthly"}
              onChange={() => setBilling?.("Monthly")}
            />
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <button
            className="w-[150px] h-[36px] rounded-md bg-[#F16623] hover:bg-[#d95312] text-white font-semibold text-sm disabled:opacity-60"
            disabled={ordering || !plan.id}
            onClick={() => onBuy?.(plan.id)}
            type="button"
          >
            {ordering ? "Processing…" : "BUY NOW"}
          </button>
        </div>
      </div>

      <div className="px-5 pb-5">{extraFeaturesRenderer?.(plan.features)}</div>
    </div>
  );
}

function FeatureList({ features }) {
  if (!features?.length) return null;
  return (
    <>
      {features.map((f, idx) => (
        <div key={idx}>
          <FeatureRow
            icon={f.icon ?? <CheckCircle2 size={18} />}
            title={f.title}
            desc={f.desc}
          />
          {idx < features.length - 1 && <Divider />}
        </div>
      ))}
    </>
  );
}

/* =================== Subscription History View + Modal =================== */
function HistoryView({ items, loading, error, onCardClick }) {
  return (
    <div className="px-6 py-6">
      {loading && <div className="text-sm text-gray-700">Loading history…</div>}
      {error && <div className="text-sm text-red-600">Error: {error}</div>}
      {!loading && !error && items?.length === 0 && (
        <div className="text-sm text-gray-700">No subscriptions found.</div>
      )}

      <div className="space-y-5">
        {items?.map((it, idx) => {
          const subscriptionId =
            it.subscriptionId || it.id || it._id || it.subId || String(idx + 1);
          const status = (it.status || it.currentStatus || "").toLowerCase();
          const isCurrent =
            status === "current" || status === "active" || it.isActive === true;

          const name = it.name || it.planName || "Subscription";
          const amount = it.price || it.amount || it.displayPrice || null;
          const price =
            amount && it.interval
              ? it.interval === "year"
                ? `₹${amount}/year`
                : `₹${amount}/month`
              : amount
              ? `₹${amount}`
              : "";

          const start =
            it.start ||
            it.startDate ||
            (it.startedAt ? formatDate(it.startedAt) : undefined);
          const renews =
            it.renews ||
            it.renewDate ||
            (it.renewsAt ? formatDate(it.renewsAt) : undefined);
          const end =
            it.end ||
            it.endDate ||
            (it.endedAt ? formatDate(it.endedAt) : undefined);

          // build a normalized object for the modal
          const normalized = {
            id: subscriptionId,
            name,
            price,
            isCurrent,
            status: status || (isCurrent ? "current" : "expired"),
            start,
            renews,
            end,
          };

          return (
            <button
              key={subscriptionId}
              type="button"
              onClick={() => onCardClick(normalized)}
              className="w-full text-left bg-white rounded-xl border border-[#E7E7E7] px-5 py-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left: title + price + chip */}
                <div>
                  {isCurrent && (
                    <span className="inline-block text-[10px] font-bold tracking-wide bg-[#4C4DDC] text-white rounded-full px-2.5 py-1 mb-2">
                      CURRENT PLAN
                    </span>
                  )}
                  <div className="text-base font-semibold">{name}</div>
                  {price && (
                    <div className="text-sm font-semibold">{price}</div>
                  )}
                </div>

                {/* Right: status badge */}
                <div className="pt-2">
                  <span className="px-4 py-2 rounded-md bg-[#F16623] text-white font-semibold text-xs inline-block">
                    {isCurrent ? "MANAGE" : (status || "expired").toUpperCase()}
                  </span>
                </div>
              </div>

              {/* dates row */}
              <div className="mt-4 text-xs text-gray-700 flex flex-wrap gap-x-10 gap-y-1">
                {start && (
                  <span>
                    <span className="text-gray-600">Start date: </span>
                    {start}
                  </span>
                )}
                {isCurrent && renews ? (
                  <span>
                    <span className="text-gray-600">Renews: </span>
                    {renews}
                  </span>
                ) : (
                  end && (
                    <span>
                      <span className="text-gray-600">End date: </span>
                      {end}
                    </span>
                  )
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===== Modal container and content (same file) ===== */
function Modal({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative z-10 w-[90%] max-w-sm rounded-lg bg-white shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
          aria-label="Close"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}

function HistoryModalContent({ item, onCancel }) {
  const { id, name, price, isCurrent, start, renews, end } = item;
  const endOrRenews = isCurrent ? renews : end;

  return (
    <div>
      {isCurrent && (
        <span className="inline-block text-[10px] font-bold tracking-wide bg-[#4C4DDC] text-white rounded-full px-2.5 py-1 mb-2">
          CURRENT PLAN
        </span>
      )}

      <div className="text-lg font-semibold">{name}</div>
      {price && <div className="text-base font-semibold mt-1">{price}</div>}

      <div className="mt-3 text-sm space-y-1">
        {start && (
          <div>
            <span className="text-gray-600">Start date: </span>
            {start}
          </div>
        )}
        {isCurrent && renews ? (
          <div>
            <span className="text-gray-600">Renews: </span>
            {renews}
          </div>
        ) : (
          end && (
            <div>
              <span className="text-gray-600">End date: </span>
              {end}
            </div>
          )
        )}
      </div>

      {endOrRenews && (
        <div className="mt-3 text-xs text-gray-600">
          Your plan will {isCurrent ? "renew" : "end"} on <b>{endOrRenews}</b>
        </div>
      )}

      {isCurrent ? (
        <>
          <button
            type="button"
            onClick={() => onCancel(id)}
            className="w-full mt-4 bg-[#F16623] hover:bg-[#d95312] text-white px-4 py-2 rounded-md font-semibold"
          >
            Cancel Subscription
          </button>
          <p className="text-[11px] text-gray-500 mt-2 text-center">
            Note: No refund will be issued upon cancellation.
          </p>
        </>
      ) : null}
    </div>
  );
}

/* =================== Small building blocks =================== */

function Divider() {
  return <div className="border-t border-[#EAEAEA] my-3" />;
}

function FeatureRow({ icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-[#F16623]">{icon}</div>
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-gray-600">{desc}</div>
      </div>
    </div>
  );
}

function BillingOption({ label, price, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-[#E7E7E7] px-4 py-3 cursor-pointer">
      <span className="flex items-center gap-3">
        <span className="relative w-5 h-5 inline-flex items-center justify-center">
          <input
            type="radio"
            className="appearance-none w-5 h-5 rounded-full border border-gray-400"
            checked={checked}
            onChange={onChange}
          />
          {checked && (
            <CheckCircle2
              size={20}
              className="absolute text-[#F16623] pointer-events-none"
            />
          )}
        </span>
        <span className="text-sm font-semibold">{label}</span>
        <span className="text-[11px] text-gray-500">(GST charges apply)</span>
      </span>
      <span className="text-base font-semibold">{price}</span>
    </label>
  );
}

function formatDate(d) {
  try {
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}
