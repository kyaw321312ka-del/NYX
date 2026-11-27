import { useCallback, useState } from "react";

export const useGetClassBookingSchedule = () => {
  const [remainbooking, setremainbooking] = useState([]);

  const GetRemainBooking = useCallback(async (id, date) => {
    if (!(id && date)) return console.log("data ma par lo return lite p");
    console.log("api calling from classbooing shcedule");
    try {
      let response = await fetch(
        `${(import.meta.env.VITE_BASE_URL + "/api/venue/remainbookingslot")}/${id}/${date}`,
        {
          method: "GET",
        },
      );
      if (response.ok) {
        let data = await response.json();
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
