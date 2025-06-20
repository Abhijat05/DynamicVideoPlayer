// filepath: d:\Code PlayGround\DynamicVideoPlayer\src\components\ui\theme-toggle.jsx
import { Moon, Sun, Laptop } from "lucide-react";
import { useTheme } from "@/components/ui/theme-provider";
  import { motion } from "framer-motion";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-md rounded-full p-1 border border-muted/20">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setTheme("light")}
        className={`p-2 rounded-full ${
          theme === "light" ? "bg-gradient-to-r from-primary to-chart-1 text-white" : 
          "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Light mode"
        animate={{ rotate: theme === "light" ? 0 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Sun size={18} />
      </motion.button>
      
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-full ${
          theme === "dark" ? "bg-gradient-to-r from-primary to-chart-4 text-white" : 
          "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="Dark mode"
        animate={{ rotate: theme === "dark" ? 0 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Moon size={18} />
      </motion.button>
      
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setTheme("system")}
        className={`p-2 rounded-full ${
          theme === "system" ? "bg-gradient-to-r from-chart-2 to-chart-3 text-white" : 
          "text-muted-foreground hover:text-foreground"
        }`}
        aria-label="System theme"
        animate={{ rotate: theme === "system" ? 0 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Laptop size={18} />
      </motion.button>
    </div>
  );
}