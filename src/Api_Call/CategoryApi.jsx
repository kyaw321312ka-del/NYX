import { useCallback, useState } from "react";

export const useGetCategory = () => {
  const [Categories, setCategories] = useState([]);
  const [Tags, setTags] = useState([]);

  const GetCategories = useCallback(async () => {
    const url = (import.meta.env.VITE_BASE_URL + "/api/showcat/showcategory");
    try {
      let reponse = await fetch(url, {
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
      let reponse = await fetch((import.meta.env.VITE_BASE_URL + "/api/showtag/showtags"), {
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
