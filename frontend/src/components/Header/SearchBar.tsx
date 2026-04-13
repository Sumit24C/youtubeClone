import { useEffect, useRef, useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { extractErrorMsg } from "../../utils";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [_errorMsg, setErrorMsg] = useState("");
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const [query, setQuery] = useState("");

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const controllerRef = useRef<AbortController | null>(null);

    const handleQuery = async (query: string) => {
        setLoading(true);
        if (controllerRef.current) controllerRef.current.abort();

        try {
            controllerRef.current = new AbortController();

            const res = await axiosPrivate.get(`/videos/q?query=${query}`, {
                signal: controllerRef.current.signal,
            });

            return res.data.data;
        } catch (error: any) {
            console.error("search :: error :: ", error);
            setErrorMsg(extractErrorMsg(error));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        return () => {
            if (controllerRef.current) controllerRef.current.abort();
        };
    }, []);

    const handleInputChange = async (value: string) => {
        if (!value.trim()) {
            setOptions([]);
            return;
        }

        setQuery(value);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            const queries = await handleQuery(value);
            if (!queries) return;

            const cleaned = queries
                .filter(Boolean)
                .map((q: string) =>
                    q.replace(/\n+/g, " ").trim().slice(0, 30)
                )
                .slice(0, 5);

            setOptions(cleaned);
        }, 500);
    };

    return (
        <div className="w-full max-w-[600px] relative flex items-center">

            {/* Input */}
            <div className="flex items-center w-full bg-[#121212] border border-gray-700 rounded-full overflow-hidden">
                <input
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 100)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            navigate(`/v/s?query=${query}`);
                        }
                    }}
                    placeholder="Search"
                    className="flex-1 px-4 py-2 bg-transparent outline-none text-sm text-gray-200"
                />

                {/* Loader */}
                {loading && (
                    <div className="px-2 text-xs text-gray-400">...</div>
                )}

                {/* Search Button */}
                <button
                    onClick={() => navigate(`/v/s?query=${query}`)}
                    className="px-4 py-2 bg-[#272727] hover:bg-[#3a3a3a]"
                >
                    <SearchIcon />
                </button>
            </div>

            {/* Dropdown */}
            {open && options.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-[#181818] border border-gray-800 rounded-lg shadow-lg z-50">
                    {options.map((option, index) => (
                        <div
                            key={index}
                            onMouseDown={() => navigate(`/v/s?query=${option}`)}
                            className="px-4 py-2 text-sm text-gray-300 hover:bg-[#272727] cursor-pointer"
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}