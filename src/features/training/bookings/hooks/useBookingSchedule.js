import { useCallback, useState } from "react";
import { getRemainingBookings } from "../services/bookingScheduleApi";

export const useGetClassBookingSchedule = () => {
  const [remainbooking, setremainbooking] = useState([]);

  const GetRemainBooking = useCallback(async (id, date) => {
    if (!(id && date)) return console.log("data ma par lo return lite p");
    console.log("api calling from classbooing shcedule");
    try {
      const response = await getRemainingBookings(id, date);
      if (response.ok) {
        const data = await response.json();
        setremainbooking(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  return {
    GetRemainBooking,
    remainbooking,
  };
};
