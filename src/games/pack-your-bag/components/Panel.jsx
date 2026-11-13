// Shared dialog frame: coloured header with an icon, white body, action button.
export default function Panel({ title, icon, children, action, onAction, className = "" }) {
  return (
    <div className={`panel pop-in ${className}`} role="dialog" aria-label={title}>
      <div className="panel-head">
        {icon && <span className="panel-icon" aria-hidden="true">{icon}</span>}
        <h2>{title}</h2>
      </div>
      <div className="panel-body">
        {children}
        {action && (
          <div className="panel-actions">
            <button className="btn btn-blue" onClick={onAction} autoFocus>
              {action}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
