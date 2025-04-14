import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkToken } from "./utils/auth";
import HomePage from "./home";
function SlotList() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  if (!checkToken()) {
    navigate("/login");
  }

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/getSlots", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();
        setSlots(data);
      } catch (error) {
        console.error("Failed to fetch slots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  if (loading) return <p>Loading slots...</p>;

  const userId = localStorage.getItem("username"); // add the current users ID here

  async function reserveSlot(slot) {
    try {
      const response = await fetch("http://localhost:3001/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ufid: userId,
          slotID: slot.id,
          status: "full",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSlots((prev) =>
          prev.map((s) =>
            s.id === slot.id ? { ...s, status: "full", ufid: userId } : s
          )
        );
      }
    } catch (err) {
      console.error("Failed to reserve slot:", err);
    }
  }

  async function releaseSlot(slot) {
    try {
      const response = await fetch("http://localhost:3001/api/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ufid: "None", // Replace this with actual user ID
          slotID: slot.id,
          status: "empty", // 1 = reserve, 0 = release
        }),
      });

      const result = await response.json();
      if (result.success) {
        // Optional: re-fetch or update state manually
        setSlots((prev) =>
          prev.map((s) =>
            s.id === slot.id ? { ...s, status: "empty", ufid: "None" } : s
          )
        );
      }
    } catch (err) {
      console.error("Failed to free slot:", err);
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "90vh", // full screen height
        flexDirection: "column", // keeps heading above the table
      }}
    >
      {" "}
      <HomePage/>
      <h2>Charger Slots</h2>
      <table
        style={{ borderCollapse: "collapse", minWidth: "45%", maxWidth: "75%" }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Slot ID
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Status</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              UFID / Reserver
            </th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Reserve
            </th>
          </tr>
        </thead>
        <tbody>
          {slots.map((slot) => {
            const color = slot.status === "empty" ? "green" : "red";
            let text;
            if (slot.status === "empty") {
              text = "Available";
            } else if (slot.status === "full") {
              text = "Not Available";
            } else {
              text = "Status Error";
            }

            return (
              <tr key={slot.id}>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {slot.id}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    color,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {text}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {slot.ufid || "None"}
                </td>
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  {slot.status === "empty" ? (
                    <>
                      <span style={{ cursor: "pointer"}} onClick={() => reserveSlot(slot)}>🔒</span>
                      <span style={{ cursor: "default", opacity: "0.3" }}>🔓</span>
                    </>
                  ) : slot.status === "full" &&
                    localStorage.getItem("username") === slot.ufid ? (
                    <>
                      <span style={{ cursor: "default", opacity: "0.3" }}>🔒</span>
                      <span style={{ cursor: "pointer" }} onClick={() => releaseSlot(slot)} >🔓</span>
                    </>
                  ) : (
                    <span style={{ cursor: "default", opacity: "0.3" }}>🔒🔓</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default SlotList;
