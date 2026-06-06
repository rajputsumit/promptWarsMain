/** Soft, slowly-breathing terracotta + peach glows behind all content. */
export function AmbientBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      aria-hidden
    >
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-primary-fixed/20 blur-[120px] animate-subtle-breathe" />
      <div
        className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-secondary-fixed/20 blur-[100px] animate-subtle-breathe"
        style={{ animationDelay: "-7s" }}
      />
    </div>
  );
}
