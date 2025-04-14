import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkToken } from "./utils/auth";

function SlotList() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const runTokenCheck = async () => {
      const isValid = await checkToken();
      if (!isValid) {
        navigate("/login");
      }
    };

    runTokenCheck();
  }, [navigate]);

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
          status: "reserved",
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSlots((prev) =>
          prev.map((s) =>
            s.id === slot.id ? { ...s, status: "reserved", ufid: userId } : s
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
            let text;
            let color;

            if (slot.status === "empty") {
              text = "Available";
              color = "green";
            } else if (slot.status === "full") {
              text = "Not Available";
              color = "red";
            } else if (slot.status === "reserved") {
              text = "Pending";
              color = "yellow";
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
                  ) : (slot.status === "full" || slot.status === "reserved") &&
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
