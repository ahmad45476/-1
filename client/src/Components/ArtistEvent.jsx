import React, { useEffect, useState } from "react";
import axios from "axios";

const ArtistEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);

  const fetchArtistEvents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/events/artist"); 
      // backend يجب أن يرجع الفعاليات الخاصة بالفنان الحالي
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch artist events:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      setApproving(eventId);
      await axios.post(`http://localhost:5000/api/events/${eventId}/approve`);
      alert("تمت الموافقة على الفعالية");
      fetchArtistEvents();
    } catch (err) {
      console.error("Approval failed:", err);
      alert("فشل الموافقة: " + err.response?.data?.message || err.message);
    } finally {
      setApproving(null);
    }
  };

  useEffect(() => {
    fetchArtistEvents();
  }, []);

  if (loading) return <p>جارٍ تحميل الفعاليات...</p>;

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">فعالياتي</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((evt) => (
          <div key={evt.eventId} className="border p-4 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold">{evt.title}</h3>
            <p className="text-sm opacity-75">{evt.description}</p>
            <p className="mt-2">
              المقاعد: {evt.totalSeats - (evt.ticketsSold || 0)} / {evt.totalSeats}
            </p>
            <p>السعر لكل مقعد: ${evt.pricePerSeat}</p>
            <p>الحالة: {evt.approved ? "موافق عليها" : "في انتظار الموافقة"}</p>

            {!evt.approved && (
              <button
                onClick={() => handleApprove(evt.eventId)}
                disabled={approving === evt.eventId}
                className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {approving === evt.eventId ? "جارٍ الموافقة..." : "اعتماد الفعالية"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArtistEvents;