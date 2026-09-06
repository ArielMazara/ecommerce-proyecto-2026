export function Divider() {
  return (
    <svg
      viewBox="0 0 200 20"
      className="w-40 h-5 mx-auto text-gold/70"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden
    >
      <path d="M0,10 C40,10 45,2 60,2 C75,2 78,10 100,10" />
      <path d="M200,10 C160,10 155,2 140,2 C125,2 122,10 100,10" />
      <circle cx="100" cy="10" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
