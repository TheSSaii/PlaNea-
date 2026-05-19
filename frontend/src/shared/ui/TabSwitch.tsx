type Tab = { id: string; label: string; count?: number };

type TabSwitchProps = {
  tabs: Tab[];
  activeId: string;
  onChange: (id: string) => void;
};

export function TabSwitch({ tabs, activeId, onChange }: TabSwitchProps) {
  return (
    <div className="tab-switch" role="tablist">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`tab-switch-item ${active ? 'tab-switch-item--active' : ''}`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 ? ` (${tab.count})` : ''}
          </button>
        );
      })}
    </div>
  );
}
