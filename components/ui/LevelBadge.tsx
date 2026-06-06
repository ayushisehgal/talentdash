const LEVEL_STYLE: Record<string, { bg: string; color: string }> = {
  L3:        { bg: '#f1f5f9', color: '#475569' },
  SDE_I:     { bg: '#f1f5f9', color: '#475569' },
  L4:        { bg: '#dbeafe', color: '#1d4ed8' },
  SDE_II:    { bg: '#dbeafe', color: '#1d4ed8' },
  L5:        { bg: '#e0e7ff', color: '#4338ca' },
  SDE_III:   { bg: '#e0e7ff', color: '#4338ca' },
  L6:        { bg: '#f3e8ff', color: '#7e22ce' },
  STAFF:     { bg: '#f3e8ff', color: '#7e22ce' },
  IC4:       { bg: '#dbeafe', color: '#1d4ed8' },
  IC5:       { bg: '#e0e7ff', color: '#4338ca' },
  PRINCIPAL: { bg: '#1e1b4b', color: '#ffffff' },
};

export default function LevelBadge({ level }: { level: string }) {
  const style = LEVEL_STYLE[level] || { bg: '#f3f4f6', color: '#374151' };
  return (
    <span
      style={{ backgroundColor: style.bg, color: style.color }}
      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
    >
      {level.replace('_', '-')}
    </span>
  );
}