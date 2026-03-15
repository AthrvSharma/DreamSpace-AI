import useToastStore from '../store/toastStore';

export default function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);
    if (!toasts.length) return null;
    return (
        <div className="toast-container">
            {toasts.map((t) => (
                <div key={t.id} className={`toast toast-${t.type}`}>{t.message}</div>
            ))}
        </div>
    );
}
