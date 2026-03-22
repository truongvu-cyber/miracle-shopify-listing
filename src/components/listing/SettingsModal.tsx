import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { FolderOpen, Save, Loader2, Zap, BookOpen, Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { ApiGuideModal } from "./ApiGuideModal";

interface Settings {
  googleApiKey: string;
  csvSaveDirectory: string;
}

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const STORAGE_KEY = "shopify-listing-settings";

function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return {
    googleApiKey: "",
    csvSaveDirectory: "",
  };
}

function saveSettingsToStorage(settings: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function SettingsModal({ open: isOpen, onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<Settings>(loadSettings);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(loadSettings());
    }
  }, [isOpen]);

  function updateField<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleTestApiKey() {
    if (!settings.googleApiKey.trim()) {
      toast.error("Vui lòng nhập API Key trước");
      return;
    }

    // Save settings first so the backend can access the key
    saveSettingsToStorage(settings);
    try {
      await invoke("save_settings", { settings });
    } catch {
      // ignore backend save error
    }

    setTesting(true);
    try {
      const result = await invoke<string>("test_api_key", { apiKey: settings.googleApiKey });
      toast.success(result || "API Key hoạt động!");
    } catch (err) {
      const msg = typeof err === "string" ? err : (err instanceof Error ? err.message : "API Key không hợp lệ!");
      toast.error(msg);
    } finally {
      setTesting(false);
    }
  }

  async function handlePickFolder() {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Chọn thư mục lưu CSV",
      });
      if (selected && typeof selected === "string") {
        updateField("csvSaveDirectory", selected);
      }
    } catch (err) {
      console.error("Folder picker error:", err);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      saveSettingsToStorage(settings);
      await invoke("save_settings", { settings });
      toast.success("Đã lưu cài đặt");
      onClose();
    } catch (err) {
      // Settings saved locally even if backend fails
      saveSettingsToStorage(settings);
      const msg = typeof err === "string" ? err : "";
      if (msg) {
        console.warn("Backend save warning:", msg);
      }
      toast.success("Đã lưu cài đặt");
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={isOpen} onClose={onClose} title="Cài đặt">
      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-medium text-[var(--text-secondary)]">Google API Key</label>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type={showApiKey ? "text" : "password"}
                value={settings.googleApiKey}
                onChange={(e) => updateField("googleApiKey", e.target.value)}
                placeholder="AIza..."
                className="
                  w-full px-3 py-2 pr-20 text-sm rounded-lg border border-[var(--border)]
                  bg-[var(--bg-input)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                  transition-colors duration-150
                  focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--border-focus)]
                  hover:border-[var(--border-hover)]
                "
              />
              {/* Eye toggle + Copy buttons inside input */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                  title={showApiKey ? "Ẩn API Key" : "Hiện API Key"}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (settings.googleApiKey) {
                      navigator.clipboard.writeText(settings.googleApiKey);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                      toast.success("Đã copy API Key");
                    }
                  }}
                  className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors cursor-pointer"
                  title="Copy API Key"
                >
                  {copied ? <Check className="h-4 w-4 text-[var(--brand)]" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              variant="secondary"
              onClick={handleTestApiKey}
              disabled={testing}
              className="shrink-0"
            >
              {testing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
              Kiểm tra
            </Button>
          </div>
          <p className="text-xs text-[var(--text-muted)]">Miễn phí - Chỉ cần cài đặt 1 lần. Tạo tại console.cloud.google.com</p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setGuideOpen(true)}
          className="w-full"
        >
          <BookOpen className="h-4 w-4" />
          Hướng dẫn kết nối Google Drive API
        </Button>

        <ApiGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-secondary)]">
            Thư mục lưu CSV
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={settings.csvSaveDirectory}
              placeholder="Chọn thư mục..."
              className="
                flex-1 px-3 py-2 text-sm rounded-lg border border-[var(--border)]
                bg-[var(--bg-input)] text-[var(--text-secondary)] placeholder:text-[var(--text-muted)]
              "
            />
            <Button variant="secondary" onClick={handlePickFolder}>
              <FolderOpen className="h-4 w-4" />
              Chọn thư mục
            </Button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[var(--border)]">
          <Button variant="ghost" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} loading={saving}>
            <Save className="h-4 w-4" />
            Lưu cài đặt
          </Button>
        </div>
      </div>
    </Modal>
  );
}
