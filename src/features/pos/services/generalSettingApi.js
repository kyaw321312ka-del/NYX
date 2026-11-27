import { useCallback, useState } from "react";
import { apiFetch } from "../../../shared/services/apiClient";

export const useGetGeneralSetting = () => {
  const [General, setGeneral] = useState([]);

  const GetGenerals = useCallback(async () => {
    try {
      let response = await apiFetch("/api/generalsetting/showgeneral", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        let data = await response.json();
        setGeneral(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  return {
    General,
    GetGenerals,
  };
};
