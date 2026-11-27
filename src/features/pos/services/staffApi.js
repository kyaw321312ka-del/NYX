import { useCallback, useState } from "react";
import { apiFetch } from "../../../shared/services/apiClient";

export const useGetStaff = () => {
  const [Staff, setStaff] = useState([]);

  const GetStaff = useCallback(async () => {
    try {
      let response = await apiFetch("/api/setting/showstaff", {
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
