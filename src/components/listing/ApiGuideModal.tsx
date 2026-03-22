import { Modal } from "@/components/ui/Modal";

interface ApiGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function ApiGuideModal({ open, onClose }: ApiGuideModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="Hướng dẫn kết nối Google Drive API" maxWidth="max-w-2xl">
      <div className="space-y-6 text-sm text-[var(--text-secondary)]">
        <div className="p-4 rounded-lg bg-[var(--brand-muted)] border border-[var(--brand)]/30">
          <p className="text-[var(--brand)] font-medium mb-1">Miễn phí & chỉ cần làm 1 lần</p>
          <p className="text-[var(--text-muted)]">Google API Key hoàn toàn miễn phí. Bạn chỉ cần tạo 1 lần và sử dụng mãi mãi.</p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[var(--brand)] flex items-center justify-center text-white text-xs font-bold">1</div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">Truy cập Google Cloud Console</p>
              <p className="text-[var(--text-muted)] mt-1">Mở trình duyệt và truy cập:</p>
              <code className="block mt-1 px-3 py-2 rounded bg-[var(--bg-input)] text-[var(--brand)] text-xs break-all select-all">
                https://console.cloud.google.com
              </code>
              <p className="text-[var(--text-muted)] mt-1">Đăng nhập bằng tài khoản Google của bạn.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[var(--brand)] flex items-center justify-center text-white text-xs font-bold">2</div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">Tạo Project mới</p>
              <p className="text-[var(--text-muted)] mt-1">Click vào dropdown project ở thanh trên cùng → <strong>New Project</strong></p>
              <p className="text-[var(--text-muted)]">Đặt tên bất kỳ (VD: "My Listing App") → <strong>Create</strong></p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[var(--brand)] flex items-center justify-center text-white text-xs font-bold">3</div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">Bật Google Drive API</p>
              <p className="text-[var(--text-muted)] mt-1">Vào menu bên trái → <strong>APIs & Services</strong> → <strong>Library</strong></p>
              <p className="text-[var(--text-muted)]">Tìm kiếm "<strong>Google Drive API</strong>" → Click vào → <strong>Enable</strong></p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[var(--brand)] flex items-center justify-center text-white text-xs font-bold">4</div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">Tạo API Key</p>
              <p className="text-[var(--text-muted)] mt-1">Vào <strong>APIs & Services</strong> → <strong>Credentials</strong></p>
              <p className="text-[var(--text-muted)]">Click <strong>+ CREATE CREDENTIALS</strong> → <strong>API Key</strong></p>
              <p className="text-[var(--text-muted)]">API Key sẽ được tạo tự động. <strong>Copy API Key</strong> này.</p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[var(--brand)] flex items-center justify-center text-white text-xs font-bold">5</div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">Dán API Key vào App</p>
              <p className="text-[var(--text-muted)] mt-1">Quay lại app → <strong>Cài đặt</strong> → Dán API Key vào ô <strong>Google API Key</strong></p>
              <p className="text-[var(--text-muted)]">Click <strong>Kiểm tra kết nối</strong> để xác nhận hoạt động → <strong>Lưu cài đặt</strong></p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 h-7 w-7 rounded-full bg-[var(--brand)] flex items-center justify-center text-white text-xs font-bold">6</div>
            <div>
              <p className="font-medium text-[var(--text-primary)]">Chia sẻ thư mục Drive</p>
              <p className="text-[var(--text-muted)] mt-1">Mở Google Drive → Click chuột phải vào thư mục ảnh → <strong>Share</strong></p>
              <p className="text-[var(--text-muted)]">Chọn <strong>"Anyone with the link"</strong> → Quyền: <strong>Viewer</strong></p>
              <p className="text-[var(--text-muted)]">Copy link thư mục → Dán vào ô <strong>Google Drive URL</strong> trong form tạo listing.</p>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-[var(--warning-muted)] border border-[var(--warning)]/30">
          <p className="text-[var(--warning)] font-medium mb-1">Lưu ý quan trọng</p>
          <ul className="text-[var(--text-muted)] space-y-1 list-disc list-inside">
            <li>Thư mục Google Drive <strong>phải được chia sẻ công khai</strong> (Anyone with the link)</li>
            <li>Tên file ảnh nên chứa tên Option để app tự động match</li>
            <li>Hỗ trợ định dạng: PNG, JPG, JPEG, WebP</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
