import axios from "axios";
import React, { useState } from "react";
import toast from "react-hot-toast";
import {
  FaBars,
  FaHome,
  FaSignOutAlt,
  FaUserCircle,
  FaTrophy,
  FaLaptopCode,
  FaChartLine,
  FaAngleDown,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { config, server } from "../../constants/config";
import { userNotExists } from "../../redux/reducers/auth";

function UserNavbar() {
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPracticeOpen, setIsPracticeOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await axios.post(`${server}/user/logout`, {}, config);
      if (data.success) {
        dispatch(userNotExists());
        toast.success(data.message);
      } else throw new Error(data.message);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const NavLink = ({ to, icon, label }) => (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-2 text-lg font-medium rounded-lg transition-all duration-300 hover:text-yellow-300 hover:bg-white/20"
    >
      {icon} {label}
    </Link>
  );

  return (
    <>
      <nav className="bg-[#0A1128] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/Logo.png"
              alt="CodeNest"
              className="h-12 w-auto drop-shadow-lg transition-transform hover:scale-105"
            />
            <span className="text-2xl font-bold hidden sm:block">CodeNest</span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden sm:flex items-center space-x-6">
            <NavLink to="/" icon={<FaHome />} label="Dashboard" />

            {/* Practice Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsPracticeOpen(!isPracticeOpen)}
                className="flex items-center gap-2 px-4 py-2 text-lg font-medium rounded-lg hover:text-yellow-300 hover:bg-white/20"
              >
                <FaLaptopCode /> Practice <FaAngleDown size={14} />
              </button>
              {isPracticeOpen && (
                <div className="absolute top-12 left-0 bg-white text-gray-800 w-56 rounded-lg shadow-lg z-50">
                  <Link
                    to="/practice/sde"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    SDE Sheet
                  </Link>
                  <Link
                    to="/practice/daily"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Problem of the Day
                  </Link>
                  <Link
                    to="/practice/topics"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Topic-wise DSA
                  </Link>
                </div>
              )}
            </div>

            <NavLink to="/contests" icon={<FaTrophy />} label="Contests" />
            <NavLink to="/leaderboard" icon={<FaChartLine />} label="Leaderboard" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-lg font-medium rounded-lg bg-red-600 hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <FaSignOutAlt /> Logout
                </>
              )}
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="sm:hidden flex items-center px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <FaBars size={24} />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="sm:hidden bg-[#172153] text-white py-2 space-y-2 px-4">
            <NavLink to="/" icon={<FaHome />} label="Dashboard" />
            <div className="space-y-1">
              <button
                onClick={() => setIsPracticeOpen(!isPracticeOpen)}
                className="flex items-center gap-2 w-full text-left py-2 text-lg font-medium rounded-lg hover:text-yellow-300 hover:bg-white/20"
              >
                <FaLaptopCode /> Practice <FaAngleDown size={14} />
              </button>
              {isPracticeOpen && (
                <div className="ml-6 space-y-1">
                  <Link to="/practice/sde" className="block hover:text-yellow-300">
                    SDE Sheet
                  </Link>
                  <Link to="/practice/daily" className="block hover:text-yellow-300">
                    Problem of the Day
                  </Link>
                  <Link to="/practice/topics" className="block hover:text-yellow-300">
                    Topic-wise DSA
                  </Link>
                </div>
              )}
            </div>

            <NavLink to="/contests" icon={<FaTrophy />} label="Contests" />
            <NavLink to="/leaderboard" icon={<FaChartLine />} label="Leaderboard" />

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 px-4 py-2 text-lg font-medium bg-red-600 hover:bg-red-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  <FaSignOutAlt /> Logout
                </>
              )}
            </button>

            {/* User Info */}
            {user && (
              <div className="border-t pt-4 flex items-center gap-4">
                {user?.picture ? (
                  <img
                    src={user.picture}
                    alt="User"
                    className="w-10 h-10 rounded-full border-2 border-gray-400"
                  />
                ) : (
                  <FaUserCircle className="text-gray-400 text-3xl" />
                )}
                <div>
                  <p className="text-sm font-semibold">{user.username}</p>
                  <p className="text-xs text-gray-300">{user.email}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </nav>
    </>
  );
}

export default UserNavbar;
