import { NavLink, useLocation } from 'react-router-dom';
import {
  StyledListItem,
  StyledListItemButton,
  StyledListItemIcon,
  StyledListItemText,
} from '../../styles/MuiStyles';
import { Avatar } from '@mui/material';

function CustomListItems({ item, open, type, channel }) {
  const location = useLocation();
  let path, label, icon;

  if (type === "channel" && channel) {
    path = `/c/${channel.username}`;
    label = channel.username;

    icon = (
      <Avatar
        src={channel.avatar || ""}
        alt={channel.username}
        sx={{
          width: 24,
          height: 24,
          fontSize: 12,
          bgcolor: channel.avatar ? "transparent" : "primary.main",
        }}
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
    <StyledListItem>
      <StyledListItemButton
        component={NavLink}
        to={path}
        open={open}
        isActive={isActive}
        disableRipple
      >
        <StyledListItemIcon open={open} isActive={isActive}>
          {icon}
        </StyledListItemIcon>
        <StyledListItemText primary={label} open={open} />
      </StyledListItemButton>
    </StyledListItem>
  );
}

export default CustomListItems;