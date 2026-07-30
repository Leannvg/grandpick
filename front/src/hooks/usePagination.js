import { useState, useEffect } from "react";

export function usePagination(data, defaultPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  useEffect(() => {
    setPageSize(defaultPageSize);
    setPage(1);
  }, [defaultPageSize]);


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
    setPage(1);
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
