import { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
  Avatar,
  Badge,
  Menu,
  MenuItem,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LogoutIcon from "@mui/icons-material/Logout";
import axios from "axios";

const menuItems = [
  { label: "Quản lý đơn mua", path: "purchase-orders" },
  { label: "Quản lý đơn bán", path: "sale-orders" },
  { label: "Quản lý nhân viên", path: "employees" },
  { label: "Quản lý kho hàng", path: "warehouses" },
  { label: "Quản lý nhà cung cấp", path: "suppliers" },
  { label: "Quản lý khách hàng", path: "customers" },
  { label: "Quản lý sản phẩm thị trường", path: "products" },
  { label: "Thống kê", path: "statistics" },

];

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoData, setInfoData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const toggleDrawer = (open) => () => {
    setDrawerOpen(open);
    if (open) fetchInfo();
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token
    handleMenuClose();
    navigate("/login");
  };

  const fetchInfo = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:8080/warehouse/users/myInfo", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInfoData(res.data.result);
    } catch {
      setInfoData({ error: "Không tải được thông tin" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <Drawer variant="permanent" anchor="left" sx={{ width: 240, flexShrink: 0 }}>
        <Box
          sx={{
            width: 240,
            bgcolor: "#2C2F33",
            height: "100%",
            color: "#E0D7C6",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
            }}
          >
            <Typography variant="h6">Admin</Typography>
            <IconButton onClick={toggleDrawer(true)} sx={{ color: "#E0D7C6" }}>
              <InfoIcon />
            </IconButton>
          </Box>
          <Divider sx={{ borderColor: "#6D5F4B" }} />
          <List>
            {menuItems.map(({ label, path }) => {
              const isActive = location.pathname.endsWith(path);
              return (
                <ListItem key={path} disablePadding>
                  <ListItemButton
                    component={Link}
                    to={path}
                    sx={{
                      bgcolor: isActive ? "#6D5F4B" : "transparent",
                      color: isActive ? "#E0D7C6" : "#E0D7C6",
                      "&:hover": { bgcolor: "#4A473D" },
                    }}
                  >
                    <ListItemText primary={label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <Box sx={{ flexGrow: 1 }}>
        {/* AppBar */}
        <AppBar
          position="static"
          sx={{ bgcolor: "#3A3F47", color: "#E0D7C6" }}
          elevation={1}
        >
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Typography variant="h6" noWrap>
              Dashboard
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {/* Thông báo */}
              <Badge badgeContent={0} color="error">
                <NotificationsIcon />
              </Badge>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
                onClick={handleMenuClick}
              >
                <Avatar alt={infoData?.fullname || "Avatar"} src="/avatar.jpg" />
                <Typography sx={{ ml: 1, fontWeight: 500 }}>
                  {infoData?.fullname || "Người dùng"}
                </Typography>
                <ArrowDropDownIcon />
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleProfileClick}>My Profile</MenuItem>
                <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                <MenuItem onClick={handleMenuClose}>Help</MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  Log Out{" "}
                  <LogoutIcon fontSize="small" style={{ marginLeft: 8 }} />
                </MenuItem>
              </Menu>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Main content */}
        <Box
          sx={{
            p: 3,
            overflowY: "auto",
            bgcolor: "#F5F1E9",
            minHeight: "100vh",
            color: "#333333",
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Info Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 280, p: 2, bgcolor: "#E9E4D4", color: "#333333" }}>
          <Typography variant="h6" gutterBottom>
            Thông tin người dùng
          </Typography>
          <Divider />
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <CircularProgress />
            </Box>
          ) : infoData ? (
            infoData.error ? (
              <Typography color="error" sx={{ mt: 2 }}>
                {infoData.error}
              </Typography>
            ) : (
              <Box sx={{ mt: 2 }}>
                <Typography>Email: {infoData.email}</Typography>
                <Typography>Fullname: {infoData.fullname || "(Chưa có)"}</Typography>
                <Typography>Phone: {infoData.phone || "(Chưa có)"}</Typography>
                <Typography>Address: {infoData.address || "(Chưa có)"}</Typography>
                <Typography>Role: {infoData.role?.join(", ")}</Typography>
              </Box>
            )
          ) : (
            <Typography sx={{ mt: 2 }}>Không có dữ liệu</Typography>
          )}
        </Box>
      </Drawer>
    </Box>
  );
}
