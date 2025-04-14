export async function checkToken() {
    const token = localStorage.getItem("token") || "";
    const username = localStorage.getItem("username") || "";

    // Deletes the local storage items if they come back as nothing
    if (username === "" || token === "") {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      return;
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
      return;
    }
  }