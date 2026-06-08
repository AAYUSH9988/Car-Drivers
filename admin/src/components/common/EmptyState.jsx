const EmptyState = ({ icon: Icon, title, description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center py-20 text-center ${className}`}>
    {Icon && (
      <div className="p-4 bg-admin-elevated border border-admin-border rounded-full mb-4">
        <Icon size={28} className="text-admin-text-3" strokeWidth={1.5} />
      </div>
    )}
    <h3 className="text-base font-medium text-admin-text-1 mb-1">{title}</h3>
    {description && <p className="text-sm text-admin-text-3 mb-6 max-w-xs">{description}</p>}
    {action && (
      <button onClick={action.onClick} className="px-4 py-2 bg-admin-accent text-white text-sm font-medium rounded-md hover:bg-admin-accent-dim transition-colors">
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
