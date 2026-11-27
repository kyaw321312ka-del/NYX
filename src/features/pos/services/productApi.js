import { useCallback, useState } from "react";
import { apiFetch } from "../../../shared/services/apiClient";

export const useGetProducts = () => {
  const [Products, setProducts] = useState([]);

  const GetProducts = useCallback(async () => {
    try {
      let reponse = await apiFetch("/api/showpro/showproduct", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (reponse.ok) {
        let data = await reponse.json();
        setProducts(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);
  return {
    Products,
    GetProducts,
  };
};
