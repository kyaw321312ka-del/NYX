import { useCallback, useState } from "react";

export const useGetClassBooking = () => {
  const [ClassMobileBookings, setClassMobileBookings] = useState([]);
  const [ClassLocalBookings, setClassLocalBookings] = useState([]);

  const GetMobileBooking = useCallback(async () => {
    try {
      let response = await fetch(
        (import.meta.env.VITE_BASE_URL + "/api/mobilerental/showmobilebooking"),
        {
          method: "GET",
        },
      );
      if (response.ok) {
        let data = await response.json();
        setClassMobileBookings(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const GetLocalBooking = useCallback(async () => {
    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/localbooking/showlocalbooking"), {
        method: "GET",
      });
      if (response.ok) {
        let data = await response.json();
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
