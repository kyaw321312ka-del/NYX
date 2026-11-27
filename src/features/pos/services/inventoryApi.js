import { useCallback, useState } from "react";
import { apiFetch } from "../../../shared/services/apiClient";

export const useGetInventroy = () => {
  const [Inventory, setInventory] = useState([]);

  const GetInventory = useCallback(async () => {
    try {
      let reponse = await apiFetch("/api/inventory/showinventory", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (reponse.ok) {
        let data = await reponse.json();
        setInventory(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);
  return {
    Inventory,
    GetInventory,
  };
};
