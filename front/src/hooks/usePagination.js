import { useState, useEffect } from "react";

export function usePagination(data, defaultPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Resetear página cuando cambian los datos filtrados
  useEffect(() => {
    setPage(1);
  }, [data]);

  const totalPages = Math.ceil(data.length / pageSize);

  const paginatedData = data.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setPage(1); // reset siempre
  };

  return {
    page,
    pageSize,
    setPage,
    setPageSize: changePageSize,
    totalPages,
    paginatedData
  };
}
