import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function demoAuthDevPlugin() {
  return {
    name: "demo-auth-dev-plugin",
    apply: "serve", // Actif exclusivement avec le serveur de développement Vite
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method === "POST" && req.url === "/__demo_admin_login") {
          try {
            // Lecture locale des identifiants dans backend/.env (jamais exposés dans le bundle client)
            let email = "admin@example.com";
            let password = "Admin123!";

            try {
              const envPath = path.resolve(__dirname, "../backend/.env");
              if (fs.existsSync(envPath)) {
                const content = fs.readFileSync(envPath, "utf-8");
                const emailMatch = content.match(/^ADMIN_EMAIL=(.*)$/m);
                const passMatch = content.match(/^ADMIN_PASSWORD=(.*)$/m);
                if (emailMatch && emailMatch[1]) email = emailMatch[1].trim();
                if (passMatch && passMatch[1]) password = passMatch[1].trim();
              }
            } catch {
              // Valeurs de repli par défaut en cas d'absence de lecture
            }

            const apiUrl = process.env.VITE_API_URL || "http://localhost:5000";
            const response = await fetch(`${apiUrl}/api/auth/login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            res.statusCode = response.status;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
            return;
          } catch {
            res.statusCode = 502;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                message:
                  "Backend injoignable. Assurez-vous que le serveur backend tourne sur http://localhost:5000.",
              })
            );
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), demoAuthDevPlugin()],
});
