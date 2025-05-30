import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  LinearProgress,
} from "@mui/material";
import axios from "axios";

export default function UserProfile() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:8080/warehouse/users/myInfo", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInfo(res.data);
      } catch (err) {
        setInfo({ error: "Không thể tải thông tin." });
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, []);

  if (loading) {
    return (
      <Box sx={{ mt: 5, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (info?.error) {
    return (
      <Box sx={{ mt: 5, textAlign: "center" }}>
        <Typography color="error">{info.error}</Typography>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        User profile
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={4}>
        <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
          <Avatar
            src="/avatar.jpg"
            alt="User Avatar"
            sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
          />
          <Typography variant="h6">{info.username || "John Smith"}</Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {info.role || "Frontend Developer"}
          </Typography>
          <Typography variant="body2">✉ {info.email || "test@gmail.com"}</Typography>
          <Typography variant="body2">📞 0987 654 3210</Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box>
            <Typography>Web Applications</Typography>
            <LinearProgress variant="determinate" value={85} sx={{ mb: 1 }} />
            <Typography>Website Design</Typography>
            <LinearProgress variant="determinate" value={78} sx={{ mb: 1 }} />
            <Typography>Automation & Testing</Typography>
            <LinearProgress variant="determinate" value={47} sx={{ mb: 1 }} />
            <Typography>UI / UX</Typography>
            <LinearProgress variant="determinate" value={65} sx={{ mb: 1 }} />
          </Box>
        </Grid>
      </Grid>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mt: 4 }}>
        <Tab label="Recent Activity" />
        <Tab label="Projects Worked on" />
        <Tab label="Profile" />
      </Tabs>
    </Paper>
  );
}
