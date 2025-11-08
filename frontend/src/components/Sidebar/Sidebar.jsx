import {
  Drawer as MuiDrawer,
  List,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  AccountCircle as AccountIcon,
  Subscriptions as SubscriptionsIcon,
  History as HistoryIcon,
  PlaylistPlay as PlaylistIcon,
  ThumbUp as LikedIcon,
  WatchLater as WatchLaterIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import CustomListItems from './CustomListItems';
import { StyledDrawer, SectionTitle } from '../../styles/MuiStyles';
import { useEffect, useState } from 'react';
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate"
import { extractErrorMsg } from "../../utils"
import { isCancel } from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setChannels } from '../../store/channelSlice';
export default function Sidebar({ open }) {
  const primaryMenuItems = [
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Subscriptions', path: '/subscriptions', icon: <SubscriptionsIcon /> },
  ];

  const secondaryMenuItems = [
    { name: 'History', path: '/history', icon: <HistoryIcon /> },
    { name: 'Playlists', path: '/playlist', icon: <PlaylistIcon /> },
    { name: 'Liked Videos', path: '/liked-videos', icon: <LikedIcon /> },
  ];

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const dispatch = useDispatch();
  const { channelData } = useSelector((state) => state.channel)
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    setLoading(true);
    setErrorMsg("");

    ; (async function () {
      try {
        const response = await axiosPrivate.get(`/subscriptions/u`)
        const subscription = response.data.data
        const channels = subscription.map((s) => s.channel)
        dispatch(setChannels(channels));

      } catch (error) {
        if (!isCancel(error)) {
          setErrorMsg(extractErrorMsg(error));
        }
      } finally {
        setLoading(false);
      }
    })()
  }, [])

  return (
    <StyledDrawer variant="permanent" open={open}>
      <List sx={{ pt: 8, pb: 0 }}>
        {primaryMenuItems.map((item) => (
          <CustomListItems key={item.name} item={item} open={open} />
        ))}
        {!open && (
          <CustomListItems
            key="you-collapsed"
            item={{ name: 'You', path: '/you', icon: <AccountIcon /> }}
            open={open}
          />
        )}
      </List>

      {open && (
        <>
          <Divider sx={{ mx: 1, my: 1 }} />
          <SectionTitle variant="subtitle2" component={Link} to="/you">
            You
          </SectionTitle>
          <List sx={{ pt: 0 }}>
            {secondaryMenuItems.map((item) => (
              <CustomListItems key={item.name} item={item} open={open} />
            ))}
          </List>
          <Divider sx={{ mx: 1, my: 1 }} />
          {channelData && channelData.length > 0 && <List sx={{ pt: 0 }}>
            <SectionTitle variant="subtitle2" component={Link} to="/feed/channel">
              Subscriptions
            </SectionTitle>
            {channelData.map((item) => (
              <CustomListItems key={item._id} channel={item} open={open} type={"channel"} />
            ))}
          </List>
          }
        </>
      )}
    </StyledDrawer>
  );
}