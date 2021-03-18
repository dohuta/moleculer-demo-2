import React, { useState, useEffect } from "react";

function useDataFetching(dataSource: Promise<any>) {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const { data, status, statusText } = await dataSource;

        if (status === 200) {
          setLoading(false);
          setResults(data);
        } else {
          throw new Error(`${status} :: ${statusText}`);
        }
      } catch (error) {
        setLoading(false);
        setError(error.message);
      }

      setLoading(false);
    }

    fetchData();
  }, [dataSource]);

  return {
    error,
    loading,
    results,
  };
}

export default useDataFetching;
