import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/lib/i18n";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";
import LoginImage from "../storage/Login.png";
const IconLogo = "https://firebasestorage.googleapis.com/v0/b/alkasser-d7701.firebasestorage.app/o/images%2FIconLogo.jpeg?alt=media&token=24ff1d49-2541-48f2-9902-86f5deafe345";

const Login = () => {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [email, setEmail] = useState("demo@admin.com");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex ${isRTL ? "flex-row-reverse" : ""}`}>
      {/* Left - Login Image */}
      <div className={`hidden lg:flex lg:w-1/2 relative ${isRTL ? "order-2" : ""}`}>
        <img 
          src={LoginImage} 
          alt="Login" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right - Login Form */}
      <div className={`flex-1 flex items-center justify-center p-8 bg-gray-900 ${isRTL ? "order-1" : ""}`}>
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <img 
              src={IconLogo} 
              alt="Logo" 
              className="w-16 h-16 mx-auto mb-6"
            />
            <h2 className="text-3xl font-bold text-white mb-2">{t("login.title")}</h2>
            <p className="text-gray-400">
              {t("login.welcome")}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">{t("login.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">{t("login.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal text-gray-300">
                  {t("login.rememberMe")}
                </Label>
              </div>
              <button type="button" className={`text-sm text-primary hover:text-primary/80 ${isRTL ? "ml-auto" : ""}`}>
                {t("login.forgotPassword")}
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={loading}
            >
              {t("login.logIn")}
            </Button>

            <Button
              type="button"
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                // Demo login - bypass authentication
                console.log("Demo login - bypassing authentication");
                localStorage.setItem('demoMode', 'true');
                navigate("/dashboard");
              }}
              disabled={loading}
            >
              {t("login.demoLogIn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
