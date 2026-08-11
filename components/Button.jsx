import Link from "next/link";

export default function Button({
  children,
  href,
  variant = "primary",
  className = "",
}) {
  const styles = {
    primary:
      "bg-amber-500 text-black hover:bg-amber-400",
    secondary:
      "border border-white/15 bg-white/5 text-white hover:bg-white/10",
  };

  const classes = `
    inline-flex items-center justify-center
    rounded-xl px-6 py-3
    text-sm font-semibold
    transition duration-200
    ${styles[variant]}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes}>
      {children}
    </button>
  );
}