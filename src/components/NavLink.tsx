import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
}

export const NavLink = ({ to, children }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "px-4 py-2 rounded-lg transition-all duration-300",
        isActive
          ? "bg-momo-pink text-white font-semibold"
          : "text-foreground hover:bg-momo-pink/20"
      )}
    >
      {children}
    </Link>
  );
};
