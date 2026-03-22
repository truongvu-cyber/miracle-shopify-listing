import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { invoke } from "@tauri-apps/api/core";
import type { UserInfo } from "@/hooks/useAuthStore";
import { UserPlus, Trash2, Shield, User } from "lucide-react";
import { toast } from "sonner";

export function UserManagement() {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newDisplayName, setNewDisplayName] = useState("");
  const [adding, setAdding] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      const list = await invoke<UserInfo[]>("list_users");
      setUsers(list);
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Lỗi tải danh sách");
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  async function handleAddUser(e: React.FormEvent) {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newDisplayName.trim()) return;

    setAdding(true);
    try {
      await invoke("add_user", {
        username: newUsername.trim(),
        password: newPassword,
        displayName: newDisplayName.trim(),
      });
      toast.success(`Đã thêm người dùng: ${newDisplayName}`);
      setAddModalOpen(false);
      setNewUsername("");
      setNewPassword("");
      setNewDisplayName("");
      loadUsers();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Lỗi thêm người dùng");
    } finally {
      setAdding(false);
    }
  }

  async function handleRemoveUser(username: string, displayName: string) {
    if (!confirm(`Xóa người dùng "${displayName}"?`)) return;

    try {
      await invoke("remove_user", { username });
      toast.success(`Đã xóa: ${displayName}`);
      loadUsers();
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Lỗi xóa người dùng");
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Quản lý tài khoản</h2>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Thêm hoặc xóa người dùng</p>
        </div>
        <Button variant="primary" onClick={() => setAddModalOpen(true)}>
          <UserPlus className="h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--bg-surface-hover)]">
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Người dùng</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Vai trò</th>
                <th className="px-4 py-3 text-left font-medium text-[var(--text-muted)]">Ngày tạo</th>
                <th className="px-4 py-3 text-right font-medium text-[var(--text-muted)]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.username} className="border-b border-[var(--border)] hover:bg-[var(--bg-surface-hover)] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[var(--brand-muted)] flex items-center justify-center">
                        {user.role === "admin" ? (
                          <Shield className="h-4 w-4 text-[var(--brand)]" />
                        ) : (
                          <User className="h-4 w-4 text-[var(--text-muted)]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">{user.displayName}</p>
                        <p className="text-xs text-[var(--text-muted)]">@{user.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={user.role === "admin" ? "success" : "info"}>
                      {user.role === "admin" ? "Admin" : "Thành viên"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">
                    {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.role !== "admin" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveUser(user.username, user.displayName)}
                      >
                        <Trash2 className="h-4 w-4 text-[var(--danger)]" />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Thêm người dùng mới">
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input
            label="Tên hiển thị"
            value={newDisplayName}
            onChange={(e) => setNewDisplayName(e.target.value)}
            placeholder="VD: Nguyễn Văn A"
            required
          />
          <Input
            label="Tên đăng nhập"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="VD: nguyenvana"
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            required
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setAddModalOpen(false)}>Hủy</Button>
            <Button type="submit" loading={adding}>
              <UserPlus className="h-4 w-4" />
              Thêm
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
