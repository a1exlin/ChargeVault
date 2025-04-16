
import { useNavigate } from 'react-router-dom';
import '../../css/Logout.css'
export async function checkToken() {
    const token = localStorage.getItem("token") || "";
    const username = localStorage.getItem("username") || "";

    console.log("Hello");

    // Deletes the local storage items if they come back as nothing
    if (username === "" || token === "") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      return false;
    }

    const res = await fetch("http://localhost:3001/api/tokenValidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, username }),
    });

    const data = await res.json();

    if (res.ok && data.message === "Success") {
      return true;
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      return false;
    }
  }


export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login"); // change if your login route is named differently
  };

  return (
    <div className='container'>
 <button onClick={handleLogout}>
      Logout
    </button>
    </div>

  );
}