import { useState, useMemo, useRef, useEffect } from "react";
import { Search } from "lucide-react";
import TokenIcon from "../ui/TokenIcon";

interface TokenSelectProps {
  tokens: any[];
  selectedToken: any;
  onChange: (token: any) => void;
}

export const TokenSelect = ({
  tokens,
  selectedToken,
  onChange,
}: TokenSelectProps) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null); // Wrapper ref

  const filteredTokens = useMemo(() => {
    const normalizedQuery = query.toLowerCase().trim();
    const result = tokens.filter(
      (token) =>
        token.name.toLowerCase().includes(normalizedQuery) ||
        token.symbol.toLowerCase().includes(normalizedQuery)
    );
    return result.slice(0, 10);
  }, [query, tokens]);

  const handleSelect = async (token: any) => {
    setIsOpen(false);
    onChange(token);
    setQuery("");
  };

  const handleSearchClick = () => {
    setIsOpen(true);
    inputRef.current?.focus();
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full mb-2">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="input w-full pr-20 bg-[rgb(var(--background-light))] text-[rgb(var(--text))] placeholder-gray-400 border border-slate-600 focus:ring-1 focus:ring-slate-500"
          placeholder={
            selectedToken
              ? `${selectedToken.name} (${selectedToken.symbol})`
              : "Search token..."
          }
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div
          className="absolute right-10 top-3 text-gray-400 hover:text-white cursor-pointer"
          onClick={handleSearchClick}
        >
          <Search strokeWidth={1.5} size={20} />
        </div>
        <div className="absolute right-3 top-2.5">
          <TokenIcon
            symbol={selectedToken.symbol}
            logo={selectedToken.logoURI}
            size="sm"
          />
        </div>
      </div>

      {isOpen && (
        <ul className="absolute z-10 mt-1 w-full max-h-60 overflow-auto rounded-md bg-[rgb(var(--background-light))] shadow-lg border border-slate-600">
          {filteredTokens.map((token, idx) => (
            <li
              key={idx}
              onClick={() => handleSelect(token)}
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-[rgb(var(--background))]"
            >
              <TokenIcon logo={token.logoURI} symbol={token.symbol} size="sm" />
              <span className="ml-2 text-sm text-[rgb(var(--text))]">
                {token.name} ({token.symbol})
              </span>
            </li>
          ))}
          {filteredTokens.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-400">No tokens found</li>
          )}
        </ul>
      )}
    </div>
  );
};
