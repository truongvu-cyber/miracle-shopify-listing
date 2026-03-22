import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/hooks/useAuthStore";
import { ShoppingBag, LogIn, Loader2 } from "lucide-react";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuthStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    await login(username.trim(), password);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-16 w-16 rounded-2xl bg-[var(--brand)] flex items-center justify-center shadow-lg shadow-[var(--brand)]/30 mb-4">
            <ShoppingBag className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Miracle Shopify Listing</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Đăng nhập để tiếp tục</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-6 space-y-4 shadow-[var(--shadow-lg)]">
          <Input
            label="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập..."
            autoFocus
            autoComplete="username"
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            autoComplete="current-password"
          />

          {error && (
            <div className="p-3 rounded-lg bg-[var(--danger-muted)] border border-[var(--danger)]/30 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={loading || !username.trim() || !password.trim()}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogIn className="h-5 w-5" />
            )}
            Đăng nhập
          </Button>
        </form>
      </div>
    </div>
  );
}
