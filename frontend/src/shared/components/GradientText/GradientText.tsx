import './GradientText.css';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
}

export function GradientText({
  children,
  className = '',
  colors = ['var(--color-app-secondary)', 'var(--color-app-white)', 'var(--color-app-secondary)'],
  animationSpeed = 8,
  showBorder = false,
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(', ')})`,
    animationDuration: `${animationSpeed}s`,
  };

  return (
    <span className={`gradient-text-animated ${className}`}>
      {showBorder && (
        <span className="gradient-text-border" style={gradientStyle} />
      )}
      <span className="gradient-text-content" style={gradientStyle}>
        {children}
      </span>
    </span>
  );
}
