// import { useState, useEffect } from "react";
// import {
//     Box,
//     Grid,
//     Card,
//     CardContent,
//     Typography,
//     Divider,
//     CircularProgress,
//     Alert,
// } from "@mui/material";
// import { Visibility, AccessTime, ThumbUp, Comment } from "@mui/icons-material";
// import { displayCreatedAt, extractErrorMsg } from "../../utils";
// import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
// import { useParams } from "react-router-dom";
// import { isCancel } from "axios";

// type View = {
//     watchTime: number;
//     isCompleted: boolean;
// };

// type VideoAnalyticsData = {
//     title: string;
//     createdAt: string;
//     views?: View[];
//     likes?: any[];
//     comments?: any[];
// };

// const VideoAnalytics = () => {
//     const { videoId } = useParams<{ videoId: string }>();

//     const [loading, setLoading] = useState<boolean>(false);
//     const [errorMsg, setErrorMsg] = useState<string>("");
//     const [video, setVideo] = useState<VideoAnalyticsData | null>(null);

//     const axiosPrivate = useAxiosPrivate();

//     useEffect(() => {
//         if (!videoId) return;

//         setLoading(true);
//         setErrorMsg("");

//         (async () => {
//             try {
//                 const response = await axiosPrivate.get<{
//                     data: VideoAnalyticsData;
//                 }>(`/dashboard/videos/${videoId}`);

//                 setVideo(response.data.data);
//             } catch (error: any) {
//                 if (!isCancel(error)) {
//                     setErrorMsg(extractErrorMsg(error));
//                 }
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, [videoId, axiosPrivate]);

//     if (loading) {
//         return (
//             <Box p={4} textAlign="center">
//                 <CircularProgress />
//             </Box>
//         );
//     }

//     if (errorMsg) {
//         return (
//             <Box p={4}>
//                 <Alert severity="error">{errorMsg}</Alert>
//             </Box>
//         );
//     }

//     if (!video) return null;

//     const {
//         title,
//         createdAt,
//         views = [],
//         likes = [],
//         comments = [],
//     } = video;

//     let totalWatchTime = 0;
//     let completedViews = 0;

//     for (const v of views) {
//         totalWatchTime += v.watchTime || 0;
//         if (v.isCompleted) completedViews++;
//     }

//     const totalViews = views.length;
//     const totalLikes = likes.length;
//     const totalComments = comments.length;

//     return (
//         <Box p={4}>
//             {/* Header */}
//             <Box mb={3}>
//                 <Typography variant="h5" fontWeight="bold">
//                     Video Analytics
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                     {title} • Published {displayCreatedAt(createdAt)}
//                 </Typography>
//             </Box>

//             {/* Overview Cards */}
//             <Grid container spacing={3}>
//                 <Grid item xs={12} sm={6} md={3}>
//                     <Card>
//                         <CardContent>
//                             <Box display="flex" alignItems="center" gap={2}>
//                                 <Visibility color="primary" />
//                                 <Box>
//                                     <Typography variant="h6">{totalViews}</Typography>
//                                     <Typography variant="body2" color="text.secondary">
//                                         Views
//                                     </Typography>
//                                 </Box>
//                             </Box>
//                         </CardContent>
//                     </Card>
//                 </Grid>

//                 <Grid item xs={12} sm={6} md={3}>
//                     <Card>
//                         <CardContent>
//                             <Box display="flex" alignItems="center" gap={2}>
//                                 <AccessTime sx={{ color: "green" }} />
//                                 <Box>
//                                     <Typography variant="h6">{totalWatchTime}s</Typography>
//                                     <Typography variant="body2" color="text.secondary">
//                                         Watch Time
//                                     </Typography>
//                                 </Box>
//                             </Box>
//                         </CardContent>
//                     </Card>
//                 </Grid>

//                 <Grid item xs={12} sm={6} md={3}>
//                     <Card>
//                         <CardContent>
//                             <Box display="flex" alignItems="center" gap={2}>
//                                 <ThumbUp sx={{ color: "red" }} />
//                                 <Box>
//                                     <Typography variant="h6">{totalLikes}</Typography>
//                                     <Typography variant="body2" color="text.secondary">
//                                         Likes
//                                     </Typography>
//                                 </Box>
//                             </Box>
//                         </CardContent>
//                     </Card>
//                 </Grid>

//                 <Grid item xs={12} sm={6} md={3}>
//                     <Card>
//                         <CardContent>
//                             <Box display="flex" alignItems="center" gap={2}>
//                                 <Comment sx={{ color: "orange" }} />
//                                 <Box>
//                                     <Typography variant="h6">{totalComments}</Typography>
//                                     <Typography variant="body2" color="text.secondary">
//                                         Comments
//                                     </Typography>
//                                 </Box>
//                             </Box>
//                         </CardContent>
//                     </Card>
//                 </Grid>
//             </Grid>

//             {/* Engagement */}
//             <Box mt={5}>
//                 <Typography variant="h6">Engagement</Typography>
//                 <Divider sx={{ my: 2 }} />
//                 <Typography variant="body2" color="text.secondary">
//                     Completed Views: {completedViews} / {totalViews}
//                 </Typography>
//             </Box>
//         </Box>
//     );
// };

// export default VideoAnalytics;
