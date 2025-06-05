// filepath: d:\Code PlayGround\DynamicVideoPlayer\src\components\ui\theme-toggle.jsx
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm rounded-full p-1">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full ${
          theme === "light" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Light mode"
      >
        <Sun size={18} />
      </button>
      
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full ${
          theme === "dark" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Dark mode"
      >
        <Moon size={18} />
      </button>
      
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-full ${
          theme === "system" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="System theme"
      >
        <Laptop size={18} />
      </button>
    </div>
  );
}