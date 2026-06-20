// src/components/FocusLockBar.jsx
export default function FocusLockBar({ enabled, onToggle }) {
  return (
    <div className={enabled ? 'fbar active-lock' : 'fbar'}>
      <div className="fbar-left">
        <div className={enabled ? 'fdot on' : 'fdot'} />
        <span className="fbar-text">
          <b>Focus Lock</b> — {enabled ? <span className="fbar-active-txt">active</span> : 'off'}
        </span>
      </div>
      <button className={enabled ? 'flbtn on-btn' : 'flbtn'} onClick={onToggle}>
        {enabled ? '🔒 Disable' : '🔓 Enable'}
      </button>
    </div>
  );
}
