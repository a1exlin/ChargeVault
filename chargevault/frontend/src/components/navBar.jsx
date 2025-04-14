function navBar() {
  return (
    <div className="icon-bar">
      <button style={{ fontSize: "32px" }} onClick={() => navigate("/home")}>
        🏠
      </button>
      <button style={{ fontSize: "32px" }} onClick={() => navigate("/slots")}>
        🔋
      </button>
      <button style={{ fontSize: "32px" }}>🔒</button>
    </div>
  );
}


export default navBar;