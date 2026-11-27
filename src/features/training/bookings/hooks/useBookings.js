import { useCallback, useState } from "react";
import { getLocalBookings, getMobileBookings } from "../services/bookingApi";

export const useGetClassBooking = () => {
  const [ClassMobileBookings, setClassMobileBookings] = useState([]);
  const [ClassLocalBookings, setClassLocalBookings] = useState([]);

  const GetMobileBooking = useCallback(async () => {
    try {
      const response = await getMobileBookings();
      if (response.ok) {
        const data = await response.json();
        setClassMobileBookings(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const GetLocalBooking = useCallback(async () => {
    try {
      const response = await getLocalBookings();
      if (response.ok) {
        const data = await response.json();
        setClassLocalBookings(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  return {
    GetMobileBooking,
    ClassMobileBookings,
    GetLocalBooking,
    ClassLocalBookings,
  };
};
