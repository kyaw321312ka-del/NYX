import { useCallback, useState } from "react";

export const useGetInventroy = () => {
  const [Inventory, setInventory] = useState([]);

  const GetInventory = useCallback(async () => {
    try {
      let reponse = await fetch((import.meta.env.VITE_BASE_URL + "/api/inventory/showinventory"), {
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
