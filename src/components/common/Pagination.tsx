type PaginationToken = number | "ellipsis";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startItem: number;
  endItem: number;
  onPageChange: (page: number) => void;
  labelPrefix?: string;
};

const buildPageTokens = (currentPage: number, totalPages: number): PaginationToken[] => {
  if (totalPages <= 1) {
    return [1];
  }

  const tokens: PaginationToken[] = [1];
  const maxMiddlePages = 3;
  let start = Math.max(2, currentPage - 1);
  let end = Math.min(totalPages - 1, currentPage + 1);

  while (end - start + 1 < maxMiddlePages && (start > 2 || end < totalPages - 1)) {
    if (start > 2) {
      start -= 1;
    } else if (end < totalPages - 1) {
      end += 1;
    }
  }

  if (start > 2) {
    tokens.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    tokens.push(page);
  }

  if (end < totalPages - 1) {
    tokens.push("ellipsis");
  }

  tokens.push(totalPages);
  return tokens;
};

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  startItem,
  endItem,
  onPageChange,
  labelPrefix = "Hiển thị",
}: PaginationProps) {
  const safeStart = totalItems === 0 ? 0 : Math.min(startItem, totalItems);
  const safeEnd = totalItems === 0 ? 0 : Math.min(endItem, totalItems);
  const pageTokens = buildPageTokens(currentPage, Math.max(totalPages, 1));

  return (
    <div className="px-5 py-4 lg:px-6 border-t border-gray-200 dark:border-gray-800 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {labelPrefix}{" "}
        <span className="font-semibold text-gray-900 dark:text-white">{safeStart}</span>
        {" - "}
        <span className="font-semibold text-gray-900 dark:text-white">{safeEnd}</span>
        {" trên "}
        <span className="font-semibold text-gray-900 dark:text-white">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-45 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-500/60 dark:hover:text-blue-300"
          aria-label="Trang truoc"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex items-center gap-1.5">
          {pageTokens.map((token, index) => {
            if (token === "ellipsis") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="inline-flex h-9 min-w-7 items-center justify-center text-sm font-medium tracking-wider text-gray-400 dark:text-gray-500"
                >
                  ...
                </span>
              );
            }

            const active = token === currentPage;
            return (
              <button
                key={`page-${token}`}
                onClick={() => onPageChange(token)}
                className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_8px_20px_-10px_rgba(6,182,212,0.85)]"
                    : "border border-transparent text-gray-700 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:text-gray-300 dark:hover:border-blue-500/50 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                }`}
                aria-current={active ? "page" : undefined}
                aria-label={`Trang ${token}`}
              >
                {token}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-45 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-500/60 dark:hover:text-blue-300"
          aria-label="Trang sau"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
