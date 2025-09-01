import { useRive } from "@rive-app/react-canvas";

type CharacterProps = {
  name?: string;
  className?: string;   // e.g., "w-32 h-32"
  onClick?: () => void; // Make character clickable
};

export default function Character({
  name = "Tugon",
  className = "w-32 h-32 mx-auto",
  onClick,
}: CharacterProps) {
  const { RiveComponent } = useRive({
    src: "/tugon.riv",
    autoplay: true,
  });

  return (
    <div className="flex flex-col items-center">
      {/* Rive character */}
      <div
        className={`${className} ${onClick ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={onClick ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        } : undefined}
        aria-label={onClick ? `Click ${name} for help` : `${name} character`}
      >
        <RiveComponent />
      </div>
    </div>
  );
}