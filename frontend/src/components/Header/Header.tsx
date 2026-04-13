import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchBar from "./SearchBar";
import CreateButton from "./CreateButton";
import AccountButton from "./AccountButton";

function Header({
  setOpen,
}: {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  open: boolean;
}) {
  const handleToggleDrawer = () => setOpen((prev) => !prev);

  return (
    <header
      className="
        fixed top-0 left-0 right-0
        h-16
        flex items-center
        bg-[#181818] text-gray-200
        border-b border-gray-800
        z-50
      "
    >
      <div className="flex items-center justify-between w-full px-4">

        {/* Left */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleDrawer}
            className="p-2 rounded-full hover:bg-[#272727]"
          >
            <MenuIcon />
          </button>

          <Link to="/" className="text-white no-underline">
            <span className="text-lg font-semibold">MyTube</span>
          </Link>
        </div>

        {/* Center */}
        <div className="flex-1 mx-6 flex justify-center items-center">
          <SearchBar />
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          <CreateButton />

          <button className="p-2 rounded-full hover:bg-[#272727] relative">
            <NotificationsIcon />
            {/* Badge */}
            <span className="absolute top-1 right-1 text-[10px] bg-red-500 text-white rounded-full px-1">
              0
            </span>
          </button>

          <AccountButton />
        </div>
      </div>
    </header>
  );
}

export default Header;