import { useCallback, useState } from "react";

export const useGetStaff = () => {
  const [Staff, setStaff] = useState([]);

  const GetStaff = useCallback(async () => {
    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/setting/showstaff"), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        let data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  return {
    Staff,
    GetStaff,
  };
};
