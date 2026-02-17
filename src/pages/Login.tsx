import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import LoginImage from "../storage/Login.png";
const IconLogo = "https://firebasestorage.googleapis.com/v0/b/alkasser-d7701.firebasestorage.app/o/images%2FIconLogo.jpeg?alt=media&token=24ff1d49-2541-48f2-9902-86f5deafe345";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("demo@admin.com");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left - Login Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src={LoginImage} 
          alt="Login" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-900">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <img 
              src={IconLogo} 
              alt="Logo" 
              className="w-16 h-16 mx-auto mb-6"
            />
            <h2 className="text-3xl font-bold text-white mb-2">Login to your account</h2>
            <p className="text-gray-400">
              Welcome back! Please enter your details to sign in again.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
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
                  Remember me?
                </Label>
              </div>
              <button type="button" className="text-sm text-purple-400 hover:text-purple-300">
                Forgot Password?
              </button>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              Log In
            </Button>

            <Button
              type="button"
              className="w-full bg-red-500 hover:bg-red-600 text-white"
              onClick={() => navigate("/dashboard")}
            >
              Demo Log In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
