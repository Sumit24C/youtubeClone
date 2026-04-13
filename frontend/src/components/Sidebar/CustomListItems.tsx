import { NavLink, useLocation } from "react-router-dom";
import { Avatar } from "@mui/material";

function CustomListItems({
    item,
    open,
    type,
    channel,
}: {
    item?: any;
    open: boolean;
    type?: string;
    channel?: any;
}) {
    const location = useLocation();
    let path, label, icon;

    if (type === "channel" && channel) {
        path = `/c/${channel.username}`;
        label = channel.username;

        icon = (
            <Avatar
                src={channel.avatar || ""}
                alt={channel.username}
                sx={{ width: 24, height: 24, fontSize: 12 }}
            >
                {!channel.avatar && channel.username[0]?.toUpperCase()}
            </Avatar>
        );
    } else if (item) {
        path = item.path;
        label = item.name;
        icon = item.icon;
    }

    const isActive = location.pathname === path;

    return (
        <div className="block">
            <NavLink
                to={path}
                className={`
                flex items-center
                min-h-[48px]
                mx-2 my-1
                transition-colors duration-100
                ${open ? "justify-start px-3 rounded-xl" : "justify-center px-0 rounded-full"}
                ${isActive
                        ? "bg-[#272727] text-white"
                        : "text-gray-400 hover:bg-[#272727] hover:text-white"}
        `}
            >
                {/* Icon */}
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                    {icon}
                </div>

                {/* Text */}
                <span
                    className={`
            text-sm whitespace-nowrap
            ${open ? "ml-6 opacity-100" : "opacity-0 w-0 overflow-hidden"}
          `}
                >
                    {label}
                </span>
            </NavLink>
        </div>
    );
}

export default CustomListItems;