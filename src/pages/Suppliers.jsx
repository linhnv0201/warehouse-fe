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

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentDelete, setCurrentDelete] = useState(null);
  const [form, setForm] = useState({ name: "", companyEmail: "", phone: "", address: "" });

  const token = localStorage.getItem("token");

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/warehouse/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(res.data.result);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOpenAdd = () => {
    setForm({ name: "", companyEmail: "", phone: "", address: "" });
    setOpenAdd(true);
  };
  const handleCloseAdd = () => setOpenAdd(false);

  const handleAddSupplier = async () => {
    try {
      await axios.post("http://localhost:8080/warehouse/suppliers", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSuppliers();
      handleCloseAdd();
    } catch (error) {
      console.error("Thêm nhà cung cấp lỗi:", error);
    }
  };

  const handleOpenEdit = (supplier) => {
    setCurrentEdit(supplier);
    setForm({
      name: supplier.name || "",
      companyEmail: supplier.companyEmail || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setCurrentEdit(null);
  };

  const handleEditSupplier = async () => {
    try {
      await axios.put(`http://localhost:8080/warehouse/suppliers/${currentEdit.id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSuppliers();
      handleCloseEdit();
    } catch (error) {
      console.error("Sửa nhà cung cấp lỗi:", error);
    }
  };

  const handleOpenDelete = (supplier) => {
    setCurrentDelete(supplier);
    setOpenDelete(true);
  };
  const handleCloseDelete = () => {
    setOpenDelete(false);
    setCurrentDelete(null);
  };

  const handleDeleteSupplier = async () => {
    try {
      await axios.delete(`http://localhost:8080/warehouse/suppliers/${currentDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSuppliers();
      handleCloseDelete();
    } catch (error) {
      console.error("Xóa nhà cung cấp lỗi:", error);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh", color: "#333333" }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#6D5F4B" }}>
        Quản lý nhà cung cấp
      </Typography>

      <Button variant="contained" onClick={handleOpenAdd} sx={{ mb: 2, bgcolor: "#6D5F4B", color: "#E0D7C6", "&:hover": { bgcolor: "#4A473D" }, textTransform: "none" }}>Thêm nhà cung cấp</Button>

      <TableContainer component={Paper} sx={{ boxShadow: "none", bgcolor: "#FFFFFF" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#E9E4D4" }}>
              <TableCell sx={{ color: "#333333", fontWeight: "bold" }}>Tên nhà cung cấp</TableCell>
              <TableCell sx={{ color: "#333333", fontWeight: "bold" }}>Email công ty</TableCell>
              <TableCell sx={{ color: "#333333", fontWeight: "bold" }}>Số điện thoại</TableCell>
              <TableCell sx={{ color: "#333333", fontWeight: "bold" }}>Địa chỉ</TableCell>
              <TableCell sx={{ color: "#333333", fontWeight: "bold", textAlign: "center" }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map((sup) => (
              <TableRow key={sup.id}>
                <TableCell>{sup.name}</TableCell>
                <TableCell>{sup.companyEmail}</TableCell>
                <TableCell>{sup.phone}</TableCell>
                <TableCell>{sup.address}</TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <IconButton onClick={() => handleOpenEdit(sup)} sx={{ color: "#6D5F4B" }} title="Sửa">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpenDelete(sup)} sx={{ color: "#6D5F4B" }} title="Xóa">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Thêm */}
      <Modal open={openAdd} onClose={handleCloseAdd}>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" color="#6D5F4B">Thêm nhà cung cấp mới</Typography>
            <IconButton onClick={handleCloseAdd} size="small" sx={{ color: "#6D5F4B" }}><CloseIcon /></IconButton>
          </Box>
          <TextField label="Tên nhà cung cấp" name="name" fullWidth size="small" sx={{ mb: 2 }} value={form.name} onChange={handleChange} />
          <TextField label="Email công ty" name="companyEmail" fullWidth size="small" sx={{ mb: 2 }} value={form.companyEmail} onChange={handleChange} />
          <TextField label="Số điện thoại" name="phone" fullWidth size="small" sx={{ mb: 2 }} value={form.phone} onChange={handleChange} />
          <TextField label="Địa chỉ" name="address" fullWidth size="small" sx={{ mb: 2 }} value={form.address} onChange={handleChange} />
          <Button variant="contained" onClick={handleAddSupplier} fullWidth sx={{ bgcolor: "#6D5F4B", color: "#E0D7C6" }}>Thêm</Button>
        </Box>
      </Modal>

      {/* Modal Sửa */}
      <Modal open={openEdit} onClose={handleCloseEdit}>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" color="#6D5F4B">Sửa nhà cung cấp</Typography>
            <IconButton onClick={handleCloseEdit} size="small" sx={{ color: "#6D5F4B" }}><CloseIcon /></IconButton>
          </Box>
          <TextField label="Tên nhà cung cấp" name="name" fullWidth size="small" sx={{ mb: 2 }} value={form.name} onChange={handleChange} />
          <TextField label="Email công ty" name="companyEmail" fullWidth size="small" sx={{ mb: 2 }} value={form.companyEmail} onChange={handleChange} />
          <TextField label="Số điện thoại" name="phone" fullWidth size="small" sx={{ mb: 2 }} value={form.phone} onChange={handleChange} />
          <TextField label="Địa chỉ" name="address" fullWidth size="small" sx={{ mb: 2 }} value={form.address} onChange={handleChange} />
          <Button variant="contained" onClick={handleEditSupplier} fullWidth sx={{ bgcolor: "#6D5F4B", color: "#E0D7C6" }}>Lưu thay đổi</Button>
        </Box>
      </Modal>

      {/* Dialog Xóa */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>Bạn có chắc chắn muốn xóa nhà cung cấp <b>{currentDelete?.name}</b> không?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Hủy</Button>
          <Button onClick={handleDeleteSupplier} color="error">Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
