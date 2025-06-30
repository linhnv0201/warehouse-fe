import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Modal,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#E9E4D4",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  outline: "none",
  color: "#333333",
};

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentDelete, setCurrentDelete] = useState(null);
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const token = localStorage.getItem("token");

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://warehouse-production-53d6.up.railway.app/warehouse/customers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(res.data.result);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddCustomer = async () => {
    try {
      await axios.post("https://warehouse-production-53d6.up.railway.app/warehouse/customers", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ open: true, type: "success", message: "Thêm khách hàng thành công" });
      fetchCustomers();
      setOpenAdd(false);
    } catch (error) {
      const msg = error?.response?.data?.message || "Thêm khách hàng thất bại";
      setAlert({ open: true, type: "error", message: msg });
    }
  };

  const handleOpenEdit = (customer) => {
    setCurrentEdit(customer);
    setForm({ name: customer.name, phone: customer.phone, address: customer.address });
    setOpenEdit(true);
  };

  const handleEditCustomer = async () => {
    try {
      await axios.put(`https://warehouse-production-53d6.up.railway.app/warehouse/customers/${currentEdit.id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ open: true, type: "success", message: "Cập nhật khách hàng thành công" });
      fetchCustomers();
      setOpenEdit(false);
    } catch (error) {
      const msg = error?.response?.data?.message || "Cập nhật thất bại";
      setAlert({ open: true, type: "error", message: msg });
    }
  };

  const handleDeleteCustomer = async () => {
    try {
      await axios.delete(`https://warehouse-production-53d6.up.railway.app/warehouse/customers/${currentDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert({ open: true, type: "success", message: "Xóa khách hàng thành công" });
      fetchCustomers();
      setOpenDelete(false);
    } catch (error) {
      const msg = error?.response?.data?.message || "Xóa thất bại";
      setAlert({ open: true, type: "error", message: msg });
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh" }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#6D5F4B" }}>Quản lý khách hàng</Typography>

      <Button
        variant="contained"
        sx={{ bgcolor: "#6D5F4B", color: "#E0D7C6", mb: 2 }}
        onClick={() => {
          setForm({ name: "", phone: "", address: "" });
          setOpenAdd(true);
        }}
      >
        Thêm khách hàng
      </Button>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress sx={{ color: "#6D5F4B" }} />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#E9E4D4" }}>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Tên</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>SDT</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Địa chỉ</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }} align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.phone}</TableCell>
                  <TableCell>{c.address}</TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenEdit(c)} sx={{ color: "#6D5F4B" }}><EditIcon /></IconButton>
                    <IconButton onClick={() => { setCurrentDelete(c); setOpenDelete(true); }} sx={{ color: "#6D5F4B" }}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal thêm */}
      <Modal open={openAdd} onClose={() => setOpenAdd(false)}>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">Thêm khách hàng</Typography>
            <IconButton onClick={() => setOpenAdd(false)}><CloseIcon /></IconButton>
          </Box>
          <TextField name="name" label="Tên" fullWidth sx={{ mb: 2 }} value={form.name} onChange={handleChange} />
          <TextField name="phone" label="Số điện thoại" fullWidth sx={{ mb: 2 }} value={form.phone} onChange={handleChange} />
          <TextField name="address" label="Địa chỉ" fullWidth sx={{ mb: 2 }} value={form.address} onChange={handleChange} />
          <Button fullWidth variant="contained" sx={{ bgcolor: "#6D5F4B", color: "#E0D7C6" }} onClick={handleAddCustomer}>Thêm</Button>
        </Box>
      </Modal>

      {/* Modal sửa */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">Sửa khách hàng</Typography>
            <IconButton onClick={() => setOpenEdit(false)}><CloseIcon /></IconButton>
          </Box>
          <TextField name="name" label="Tên" fullWidth sx={{ mb: 2 }} value={form.name} onChange={handleChange} />
          <TextField name="phone" label="Số điện thoại" fullWidth sx={{ mb: 2 }} value={form.phone} onChange={handleChange} />
          <TextField name="address" label="Địa chỉ" fullWidth sx={{ mb: 2 }} value={form.address} onChange={handleChange} />
          <Button fullWidth variant="contained" sx={{ bgcolor: "#6D5F4B", color: "#E0D7C6" }} onClick={handleEditCustomer}>Lưu thay đổi</Button>
        </Box>
      </Modal>

      {/* Dialog xóa */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>Bạn có chắc chắn muốn xóa khách hàng <b>{currentDelete?.name}</b> không?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button color="error" onClick={handleDeleteCustomer}>Xóa</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={alert.open} autoHideDuration={4000} onClose={() => setAlert({ ...alert, open: false })}>
        <Alert severity={alert.type} variant="filled" onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
