import Lottie from "lottie-react";
import tugonAnim from "../assets/animations/tugoncharacterv1.json";

type CharacterProps = {
  name?: string;
  className?: string;   // e.g., "w-32 h-32"
  loop?: boolean;
  autoplay?: boolean;
};

export default function Character({
  name = "Guide",
  className = "w-32 h-32 mx-auto",
  loop = true,
  autoplay = true,
}: CharacterProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Lottie character */}
      <Lottie
        animationData={tugonAnim}
        loop={loop}
        autoplay={autoplay}
        className={className}
        aria-label={`${name} animation`}
      />
    </div>
  );
}