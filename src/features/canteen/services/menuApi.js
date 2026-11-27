import { useCallback, useState } from "react";
import { apiFetch } from "../../../shared/services/apiClient";

export const useGetClassMenu = () => {
  const [ClassMenu, setClassMenu] = useState([]);

  const GetClassmenu = useCallback(async () => {
    try {
      let response = await apiFetch("/api/menus/showmenu", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        let data = await response.json();
        setClassMenu(data);
        console.log(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  return {
    GetClassmenu,
    ClassMenu,
  };
};
