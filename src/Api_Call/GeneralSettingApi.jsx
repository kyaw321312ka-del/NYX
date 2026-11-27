import { useCallback, useState } from "react";

export const useGetGeneralSetting = () => {
  const [General, setGeneral] = useState([]);

  const GetGenerals = useCallback(async () => {
    try {
      let response = await fetch((import.meta.env.VITE_BASE_URL + "/api/generalsetting/showgeneral"), {
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
