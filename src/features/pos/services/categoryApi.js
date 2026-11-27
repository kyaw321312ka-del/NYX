import { useCallback, useState } from "react";
import { apiFetch } from "../../../shared/services/apiClient";

export const useGetCategory = () => {
  const [Categories, setCategories] = useState([]);
  const [Tags, setTags] = useState([]);

  const GetCategories = useCallback(async () => {
    try {
      let reponse = await apiFetch("/api/showcat/showcategory", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (reponse.ok) {
        let data = await reponse.json();
        setCategories(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  const GetTags = useCallback(async () => {
    try {
      let reponse = await apiFetch("/api/showtag/showtags", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (reponse.ok) {
        let data = await reponse.json();
        setTags(data);
      }
    } catch (err) {
      console.log(err);
    }
  }, []);

  return {
    Categories,
    GetCategories,
    Tags,
    GetTags,
  };
};
