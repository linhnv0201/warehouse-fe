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
        const res = await axios.get("https://warehouse-production-53d6.up.railway.app/warehouse/users/myInfo", {
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
        <CircularProgress sx={{ color: "#A67C52" }} />
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
    <Paper sx={{ p: 4, maxWidth: 900, mx: "auto", mt: 4, backgroundColor: "#F3E6DC" }}>
      <Typography variant="h5" gutterBottom sx={{ color: "#6B4C3B" }}>
        Thông tin người dùng
      </Typography>
      <Divider sx={{ mb: 3, bgcolor: "#6B4C3B" }} />

      <Grid container spacing={4}>
        <Grid item xs={12} md={4} sx={{ textAlign: "center", backgroundColor: "#FDF6F0", borderRadius: 2, p: 2 }}>
          <Avatar
            src="/avatar.jpg"
            alt="User Avatar"
            sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
          />
          <Typography variant="h6" sx={{ color: "#6B4C3B" }}>
            {info.username || "John Smith"}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 1 }}>
            {info.role || "Frontend Developer"}
          </Typography>
          <Typography variant="body2">✉ {info.email || "test@gmail.com"}</Typography>
          <Typography variant="body2">📞 0987 654 3210</Typography>
        </Grid>

        <Grid item xs={12} md={8}>
          <Box>
            <Typography sx={{ color: "#6B4C3B" }}>Web Applications</Typography>
            <LinearProgress variant="determinate" value={85} sx={{ mb: 1, bgcolor: "#D7CCC8", "& .MuiLinearProgress-bar": { backgroundColor: "#A67C52" } }} />
            <Typography sx={{ color: "#6B4C3B" }}>Website Design</Typography>
            <LinearProgress variant="determinate" value={78} sx={{ mb: 1, bgcolor: "#D7CCC8", "& .MuiLinearProgress-bar": { backgroundColor: "#A67C52" } }} />
            <Typography sx={{ color: "#6B4C3B" }}>Automation & Testing</Typography>
            <LinearProgress variant="determinate" value={47} sx={{ mb: 1, bgcolor: "#D7CCC8", "& .MuiLinearProgress-bar": { backgroundColor: "#A67C52" } }} />
            <Typography sx={{ color: "#6B4C3B" }}>UI / UX</Typography>
            <LinearProgress variant="determinate" value={65} sx={{ mb: 1, bgcolor: "#D7CCC8", "& .MuiLinearProgress-bar": { backgroundColor: "#A67C52" } }} />
          </Box>
        </Grid>
      </Grid>

      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{
          mt: 4,
          "& .MuiTabs-indicator": { backgroundColor: "#6B4C3B" },
          "& .MuiTab-root": { color: "#6B4C3B" },
          "& .Mui-selected": { fontWeight: "bold", color: "#4E342E" }
        }}
      >
        <Tab label="Hoạt động gần đây" />
        <Tab label="Dự án đã tham gia" />
        <Tab label="Hồ sơ" />
      </Tabs>
    </Paper>
  );
}
