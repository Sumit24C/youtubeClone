import { Outlet } from "react-router-dom";
import { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header";

function App() {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <div className="flex min-h-screen bg-[#0f0f0f] text-gray-200 overflow-x-hidden">
            {/* Sidebar */}
            <Sidebar open={open} />

            {/* Main */}
            <main
                className={`
          flex flex-col flex-1 w-full
          transition-[margin] duration-150 ease-linear
          ${open ? "ml-[240px]" : "ml-[64px]"}
        `}
            >
                <Header open={open} setOpen={setOpen} />

                <div className="flex flex-col flex-1 min-h-0">
                    <div className="h-16 shrink-0" />

                    <div className="flex flex-col flex-1 overflow-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default App;