import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import CloseIcon from "@mui/icons-material/Close";
import { useForm } from "react-hook-form";
import { useRef, useState } from "react";
import { useAxiosPrivate } from "../../hooks/useAxiosPrivate";
import { isCancel } from "axios";
import { extractErrorMsg } from "../../utils";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
export default function UploadVideoDialog({ open, handleClose }) {

  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("")
  const { register, handleSubmit, formState: { errors } } = useForm();
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData)
  const upload = async (data) => {
    setLoading(true);
    setErrMsg("");
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("videoFile", data.video[0]);     
      formData.append("thumbnail", data.image[0]);     

      const res = await axiosPrivate.post("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate(`/c/${userData.username}`);

    } catch (error) {
      setLoading(false);
      if (isCancel(error)) {
        console.error("axiosUploadVideo :: canceled :: ", error);
      } else {
        const errorMessage = extractErrorMsg(error);
        setErrMsg(errorMessage);
      }
    } finally {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <Dialog component={'form'} onSubmit={handleSubmit(upload)} open={open} onClose={handleClose} maxWidth="sm" fullWidth disableRestoreFocus>
      <DialogTitle>
        Upload Video
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          margin="normal"
          label="Video Titles"
          variant="outlined"
          error={!!errors.title}
          helperText={errors?.title?.message}
          {...register("title", { required: true })}
        />
        <TextField
          fullWidth
          margin="normal"
          label="Description"
          variant="outlined"
          multiline
          error={!!errors.description}
          helperText={errors?.description?.message}
          {...register("description", { required: true })}
          rows={3}
        />
        <Button variant="outlined" component="label" sx={{ mt: 2 }}>
          Choose Video
          <input type="file" hidden accept="video/*" {...register("video", { required: true })} />
        </Button>
        <Button variant="outlined" component="label" sx={{ mt: 2 }}>
          Choose Thumbnail
          <input type="file" hidden accept="image/*" {...register("image", { required: true })} />
        </Button>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button disabled={loading} loading={loading} variant="contained" type="submit">
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
}
