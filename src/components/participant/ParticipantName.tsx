interface ParticipantNameProps {
  name: string;
}

export function formatParticipantNameText(name: string): string {
  return name === "Eva" ? "Eva (Mario)" : name;
}

export function ParticipantName({ name }: ParticipantNameProps) {
  if (name !== "Eva") {
    return <>{name}</>;
  }

  return (
    <>
      <span className="line-through">Eva</span> Mario
    </>
  );
}