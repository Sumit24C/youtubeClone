import { NavLink, useLocation } from 'react-router-dom';
import {
  StyledListItem,
  StyledListItemButton,
  StyledListItemIcon,
  StyledListItemText,
} from '../../styles/MuiStyles';

function CustomListItems({ item, open }) {
  const location = useLocation();
  const isActive = location.pathname === item.path;

  return (
    <StyledListItem>
      <StyledListItemButton
        component={NavLink}
        to={item.path}
        open={open}
        isActive={isActive}
        disableRipple
      >
        <StyledListItemIcon open={open} isActive={isActive}>
          {item.icon}
        </StyledListItemIcon>
        <StyledListItemText primary={item.name} open={open} />
      </StyledListItemButton>
    </StyledListItem>
  );
}

export default CustomListItems;