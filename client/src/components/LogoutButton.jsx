import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react"; // npm i lucide-react or omit icon

export default function LogoutButton({ extraClasses = "", afterLogout }) {
  const { logout } = useContext(AuthContext);
  const navigate   = useNavigate();

  const handle = () => {
    logout();            // clears auth
    afterLogout?.();     // e.g., closeSidebar()
    navigate("/login");  // redirect to login page
  };

  return (
    <button
      onClick={handle}
      className={`flex items-center gap-2 text-red-500 hover:text-red-600 ${extraClasses}`}
    >
      <LogOut size={20} />
      Logout
    </button>
  );
}
