"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/authService";
import Link from "next/link";
import axios from "axios";
import { Transition } from "@headlessui/react";
import { useDispatch } from "react-redux";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/redux/slices/authSlice";

const Login = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(username, password);
      if (data.error) {
        setError(data.error);
        setLoading(false);
        alert(data.error); // Display alert with error message
      } else {
        console.log("user login", data);
        dispatch(loginUser(data));
        alert("Login Successful..");
        if (data.is_staff) {
          router.push("/DashBoard");
        } else {
          router.push("/");
        }
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        const errorMessage = err.response.data.error;
        setError(errorMessage);
        setLoading(false);
        alert(errorMessage); // Display alert with error message
      } else {
        setError("Failed to login. Please try again.");
        alert("Failed to login. Please try again."); // Display generic error message
      }
      setLoading(false);
    }
  };

  return (
    <div
  className="flex items-center justify-center min-h-screen bg-gradient-to-r from-black via-gray-200 to-white 
  shadow-md"
>
      <Transition
        show={loading}
        enter="transition-opacity duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <div className="w-16 h-16 border-t-4 border-b-4 border-white rounded-full animate-spin"></div>
        </div>
      </Transition>
      <div className="bg-white p-10 rounded-3xl shadow-lg w-full max-w-md">
        <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
          Welcome Back
        </h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Enter your username or email"
            />
          </div>
          <div className="mb-4 relative">
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-gray-500"
            >
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded w-full transition duration-200"
          >
            Login
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link href="/SignUp">
            <span className="text-blue-500 hover:underline cursor-pointer">
              Don&apos;t have an account? Sign up
            </span>
          </Link>
        </div>
        <div className="mt-4 text-center">
          <Link href="/ResetPassword">
            <span className="text-blue-500 hover:underline cursor-pointer">
              Forgot Password?
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;