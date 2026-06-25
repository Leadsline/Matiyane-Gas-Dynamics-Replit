import { useState } from "react";
import { useAdminLogin, useAdminListOrders, useAdminUpdateOrderStatus, useAdminListContacts, useGetOrderSummary, useAdminGetAnalytics } from "@workspace/api-client-react";
import { Flame, LogOut, ShoppingBag, MessageSquare, BarChart3, Search, Loader2, Eye, AlertCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const ADMIN_TOKEN_KEY = "mgd_admin_token";

const STATUS_OPTIONS = ["pending", "confirmed", "out_for_delivery", "delivered", "paid", "cancelled"] as const;
type OrderStatus = typeof STATUS_OPTIONS[number];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  paid: "Paid",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  out_for_delivery: "bg-orange-100 text-orange-800 border-orange-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  paid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

function StatusBadge({ status }: { status: string }) {
  const s = status as OrderStatus;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[s] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
      {STATUS_LABELS[s] || status}
    </span>
  );
}

function LoginScreen({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const loginMutation = useAdminLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await loginMutation.mutateAsync({ data: { password } });
      if (result.token) {
        localStorage.setItem(ADMIN_TOKEN_KEY, result.token);
        onLogin(result.token);
      }
    } catch {
      setError("Invalid password. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl p-10 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-8 h-8 text-secondary" />
            <span className="font-bold text-2xl text-primary">Matiyane Gas</span>
          </div>
          <h1 className="text-xl font-bold text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Enter your admin password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className={error ? "border-destructive" : ""}
          />
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertCircle size={14} />
              {error}
            </div>
          )}
          <Button type="submit" className="w-full bg-primary text-white hover:bg-secondary font-bold" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? <><Loader2 className="animate-spin mr-2 w-4 h-4" /> Signing in...</> : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}

interface OrderItemRow {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

interface OrderRow {
  id: number;
  orderRef: string;
  fullName: string;
  phone: string;
  email: string;
  deliveryAddress: string;
  suburb: string;
  specialInstructions?: string | null;
  status: string;
  totalAmount: number;
  deliveryFee: number;
  items: OrderItemRow[];
  createdAt: string;
}

function OrdersTab({ token }: { token: string }) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const updateStatus = useAdminUpdateOrderStatus({
    request: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data, isLoading, refetch } = useAdminListOrders(
    undefined,
    {
      query: { queryKey: ["admin-orders", statusFilter, token] },
      request: { headers: { Authorization: `Bearer ${token}` } },
    }
  );

  const orders: OrderRow[] = (data?.orders as OrderRow[] | undefined) || [];

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    const matchSearch = !search || o.fullName.toLowerCase().includes(search.toLowerCase()) || o.orderRef.toLowerCase().includes(search.toLowerCase()) || o.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      await updateStatus.mutateAsync({
        id: orderId,
        data: { status: newStatus },
      });
      await refetch();
      queryClient.invalidateQueries({ queryKey: ["admin-summary"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input className="pl-9" placeholder="Search by name, ref, or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select
          className="border border-border rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="animate-spin w-5 h-5" /> Loading orders...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-border overflow-hidden hover:border-primary/30 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-primary text-sm">{order.orderRef}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-sm font-medium text-foreground mt-0.5">{order.fullName}</p>
                  <p className="text-xs text-muted-foreground">{order.phone} · {order.suburb}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-extrabold text-secondary">R{order.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-ZA")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="border border-border rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                  >
                    {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                  </select>
                  {updatingId === order.id && <Loader2 className="animate-spin w-4 h-4 text-primary" />}
                  <button
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                    className="text-muted-foreground hover:text-primary transition-colors p-1 rounded"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>

              {expandedId === order.id && (
                <div className="border-t border-border bg-gray-50 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                      <p className="font-medium">{order.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-0.5">Delivery Address</p>
                      <p className="font-medium">{order.deliveryAddress}, {order.suburb}</p>
                    </div>
                    {order.specialInstructions && (
                      <div className="sm:col-span-2">
                        <p className="text-xs text-muted-foreground mb-0.5">Special Instructions</p>
                        <p className="font-medium">{order.specialInstructions}</p>
                      </div>
                    )}
                  </div>
                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">ORDER ITEMS</p>
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex justify-between text-sm py-1">
                        <span>{item.productName} × {item.quantity}</span>
                        <span className="font-semibold text-primary">R{item.subtotal.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-primary pt-2 border-t border-border mt-1">
                      <span>Total</span>
                      <span>R{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ContactsTab({ token }: { token: string }) {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useAdminListContacts(
    undefined,
    {
      query: { queryKey: ["admin-contacts", token] },
      request: { headers: { Authorization: `Bearer ${token}` } },
    }
  );

  interface ContactRow { id: number; name: string; email: string; phone?: string | null; service?: string | null; message: string; createdAt: string; }
  const contacts: ContactRow[] = (data?.contacts as ContactRow[] | undefined) || [];
  const filtered = contacts.filter((c) =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || (c.service?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input className="pl-9" placeholder="Search contacts by name, email, or service..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
          <Loader2 className="animate-spin w-5 h-5" /> Loading contacts...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No messages found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-border p-5 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-bold text-primary">{c.name}</p>
                  <p className="text-sm text-muted-foreground">{c.email}{c.phone ? ` · ${c.phone}` : ""}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{new Date(c.createdAt).toLocaleDateString("en-ZA")}</span>
              </div>
              {c.service && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-secondary/10 text-secondary border-secondary/20 mb-2">
                  {c.service}
                </span>
              )}
              <p className="text-sm text-foreground/80 leading-relaxed bg-gray-50 rounded-lg p-3">{c.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type Period = "7d" | "30d" | "90d";

const PERIOD_LABELS: Record<Period, string> = {
  "7d": "7 Days",
  "30d": "30 Days",
  "90d": "90 Days",
};

const PRIMARY_COLOR = "#0f2d5a";
const SECONDARY_COLOR = "#d97706";

function AnalyticsTab({ token }: { token: string }) {
  const [period, setPeriod] = useState<Period>("30d");

  const { data, isLoading } = useAdminGetAnalytics(
    { period },
    {
      query: { queryKey: ["admin-analytics", token, period] },
      request: { headers: { Authorization: `Bearer ${token}` } },
    }
  );

  const chartData = (data?.dailyData ?? []).map((d) => ({
    date: new Date(d.date + "T00:00:00").toLocaleDateString("en-ZA", { month: "short", day: "numeric" }),
    orders: d.orders,
    revenue: Number(d.revenue),
  }));

  const totalOrders = chartData.reduce((s, d) => s + d.orders, 0);
  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="font-bold text-lg text-primary">Order Analytics</h2>
        <div className="flex gap-1 bg-white rounded-lg p-1 border border-border w-fit">
          {(["7d", "30d", "90d"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded text-xs font-semibold transition-all ${period === p ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Orders</p>
          <p className="text-2xl font-extrabold text-primary">{isLoading ? "—" : totalOrders}</p>
          <p className="text-xs text-muted-foreground mt-0.5">in this period</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Revenue</p>
          <p className="text-2xl font-extrabold text-secondary">{isLoading ? "—" : `R${totalRevenue.toFixed(0)}`}</p>
          <p className="text-xs text-muted-foreground mt-0.5">in this period</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">Avg Order</p>
          <p className="text-2xl font-extrabold text-primary">{isLoading ? "—" : `R${avgOrderValue.toFixed(0)}`}</p>
          <p className="text-xs text-muted-foreground mt-0.5">per order</p>
        </div>
      </div>

      {/* Chart */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground gap-2 bg-white rounded-xl border border-border">
          <Loader2 className="animate-spin w-5 h-5" /> Loading chart...
        </div>
      ) : chartData.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground bg-white rounded-xl border border-border">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No orders yet in this period</p>
          <p className="text-sm mt-1">Place your first order to see data here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-border p-6">
          <p className="text-xs text-muted-foreground mb-4 font-medium uppercase tracking-wide">
            Orders &amp; Revenue — {PERIOD_LABELS[period]}
          </p>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={chartData} margin={{ top: 4, right: 32, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                yAxisId="left"
                orientation="left"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={28}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#6b7280" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => `R${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                width={48}
              />
              <Tooltip
                cursor={{ fill: "#f9fafb" }}
                contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                formatter={(value: number, name: string) =>
                  name === "revenue"
                    ? [`R${value.toFixed(2)}`, "Revenue"]
                    : [value, "Orders"]
                }
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                formatter={(value: string) => value === "revenue" ? "Revenue (R)" : "Orders"}
              />
              <Bar
                yAxisId="left"
                dataKey="orders"
                fill={PRIMARY_COLOR}
                radius={[4, 4, 0, 0]}
                name="orders"
                maxBarSize={36}
                opacity={0.9}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="revenue"
                stroke={SECONDARY_COLOR}
                strokeWidth={2.5}
                dot={{ r: 3, fill: SECONDARY_COLOR, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                name="revenue"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function StatsGrid({ token }: { token: string }) {
  const { data } = useGetOrderSummary({ query: { queryKey: ["admin-summary", token] } });
  const stats = [
    { label: "Total Orders", value: data?.totalOrders ?? "—", color: "text-primary" },
    { label: "Pending", value: data?.pendingOrders ?? "—", color: "text-yellow-600" },
    { label: "Completed", value: data?.completedOrders ?? "—", color: "text-green-600" },
    { label: "Revenue (Paid)", value: data ? `R${data.totalRevenue.toFixed(0)}` : "—", color: "text-secondary" },
  ];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-1">{s.label}</p>
          <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}

type ActiveTab = "orders" | "contacts" | "analytics";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(ADMIN_TOKEN_KEY));
  const [activeTab, setActiveTab] = useState<ActiveTab>("orders");

  const handleLogout = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
  };

  if (!token) {
    return <LoginScreen onLogin={setToken} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-primary text-white sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-secondary" />
            <span className="font-bold text-lg">Matiyane Gas</span>
            <span className="text-white/40 mx-2">|</span>
            <span className="text-white/70 text-sm">Admin Dashboard</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm">
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <StatsGrid token={token} />

        <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-border w-fit">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "orders" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <ShoppingBag size={15} /> Orders
          </button>
          <button
            onClick={() => setActiveTab("contacts")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "contacts" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <MessageSquare size={15} /> Messages
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === "analytics" ? "bg-primary text-white shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <BarChart3 size={15} /> Analytics
          </button>
        </div>

        {activeTab === "orders" && <OrdersTab token={token} />}
        {activeTab === "contacts" && <ContactsTab token={token} />}
        {activeTab === "analytics" && <AnalyticsTab token={token} />}
      </div>
    </div>
  );
}
