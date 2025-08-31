import { Box, Avatar, Typography, Button } from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

const ChannelCard = ({
  channelInfo
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: 2,
        p: 2,
        bgcolor: "background.default",
        borderRadius: 2,
        width: "100%",
      }}
    >
      {/* Profile Picture */}
      <Avatar
        src={channelInfo.channel.avatar}
        alt={channelInfo.channel.username}
        sx={{ width: 80, height: 80 }}
      />

      {/* Channel Info */}
      <Box sx={{ flexGrow: 1 }}>
        {/* Channel Name */}
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center" }}>
          {channelInfo.channel.username}
          {verified && (
            <CheckCircle sx={{ fontSize: 18, ml: 0.5, color: "gray" }} />
          )}
        </Typography>

        {/* Handle + Subscribers */}
        <Typography variant="body2" color="text.secondary">
          @{handle} • {subscribers} subscribers
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.primary"
          sx={{ mt: 1, maxWidth: "80%" }}
        >
          {description}
        </Typography>
      </Box>

      {/* Subscribe Button */}
      <Button
        variant={isSubscribed ? "contained" : "outlined"}
        color={isSubscribed ? "secondary" : "primary"}
        sx={{
          borderRadius: 10,
          px: 2,
          textTransform: "none",
          fontWeight: 600,
        }}
      >
        {isSubscribed ? "Subscribed" : "Subscribe"}
      </Button>
    </Box>
  );
};

export default ChannelCard;
