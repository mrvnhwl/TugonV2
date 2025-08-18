type CharacterProps = {
  name?: string;
};

export default function Character({ name = "Guide" }: CharacterProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 rounded-full bg-purple-400 flex items-center justify-center text-white font-bold shadow">
        {name.charAt(0)}
      </div>
      <div className="mt-2 w-16 h-4 bg-black/20 rounded-full" />
    </div>
  );
}
