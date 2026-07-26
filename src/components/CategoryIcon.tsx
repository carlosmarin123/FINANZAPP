import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = 'w-5 h-5',
  size = 20,
  color,
}) => {
  // Normalize icon name to PascalCase
  const normalizedName = name
    .split(/[-_]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');

  // Dynamically find icon component or fallback
  const IconComponent = (LucideIcons as Record<string, React.FC<LucideIcons.LucideProps>>)[
    normalizedName
  ] || LucideIcons.Tag;

  return <IconComponent className={className} size={size} style={color ? { color } : undefined} />;
};
