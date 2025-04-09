import React, { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../css/ChargerGrid.css';

const socket = io('http://localhost:3001'); 

function ChargerGrid() {
  const [slots, setSlots] = useState([]);
  //place with actual user ID if you have auth
  const UFID = '{0x53, 0xF4, 0x47, 0xDA}';

  useEffect(() => {
    // Receive full slot list on first connection
    socket.on('init', (data) => {
      console.log('INIT slots:', data);
      setSlots(data);
    });

    // Real-time updates when any slot is reserved/unreserved
    socket.on('slotUpdate', ({ id, status }) => {
      console.log(`Slot ${id} updated to ${status}`);
      setSlots((prev) =>
        prev.map((slot) =>
          slot.id === id ? { ...slot, status } : slot
        )
      );
    });

    return () => {
      socket.off('init');
      socket.off('slotUpdate');
      socket.disconnect();
    };
  }, []);

  const toggleReserve = async (slot) => {
    const isReserved = slot.status === 'reserved';

    try {
      await axios.post('http://localhost:3001/api/reserve', {
        ufid: UFID,
        rcfid: slot.id,
        status: isReserved ? 0 : 1
      });
    } catch (err) {
      console.error('Failed to update slot:', err);
    }
  };

  console.log('slot state', slots);

  return (
    <div className="grid-container">
      {slots.length === 0 ? (
        <p>No slots loaded</p>
      ) : (
        slots.map((slot) => (
          <button
            key={slot.id}
            className={`slot ${slot.status}`}
            onClick={() => toggleReserve(slot)}
          >
            {slot.status === 'reserved' ? '🔒' : `Slot ${slot.id}`}
          </button>
        ))
      )}
    </div>
  );
  
  



}

export default ChargerGrid;
