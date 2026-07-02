export default function ConfirmModal({ open, title = 'Confirmar', message, confirmText = 'Sí, confirmar', cancelText = 'Volver', onConfirm, onCancel, variant = 'danger', loading = false }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={loading ? null : onCancel}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon">
          {variant === 'danger' ? '⚠️' : 'ℹ️'}
        </div>
        <h2 style={{ color: variant === 'danger' ? 'var(--danger)' : 'var(--primary)', marginBottom: '8px' }}>
          {title}
        </h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '24px', lineHeight: 1.5 }}>
          {message}
        </p>
        <div className="confirm-modal-buttons">
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`btn-confirm btn-confirm-${variant}`}
          >
            {loading ? (
              <span className="btn-loading">Procesando…</span>
            ) : confirmText}
          </button>
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn-confirm btn-confirm-cancel"
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
