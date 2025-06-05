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
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";

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

export default function Warehouses() {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentDelete, setCurrentDelete] = useState(null);
  const [form, setForm] = useState({ name: "", address: "" });
  const [openInventoryDialog, setOpenInventoryDialog] = useState(false);
  const [inventoryList, setInventoryList] = useState([]);

  const token = localStorage.getItem("token");

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8080/warehouse/warehouses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWarehouses(res.data.result);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const fetchInventoryByWarehouse = async (id) => {
    try {
      const res = await axios.get(`http://localhost:8080/warehouse/inventories/warehouse/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventoryList(res.data);
      setOpenInventoryDialog(true);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu kho hàng:", error);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleOpenAdd = () => {
    setForm({ name: "", address: "" });
    setOpenAdd(true);
  };
  const handleCloseAdd = () => setOpenAdd(false);

  const handleAddWarehouse = async () => {
    try {
      await axios.post("http://localhost:8080/warehouse/warehouses", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWarehouses();
      handleCloseAdd();
    } catch (error) {
      console.error("Thêm kho lỗi:", error);
    }
  };

  const handleOpenEdit = (warehouse) => {
    setCurrentEdit(warehouse);
    setForm({
      name: warehouse.name || "",
      address: warehouse.address || "",
    });
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setCurrentEdit(null);
  };

  const handleEditWarehouse = async () => {
    try {
      await axios.put(
        `http://localhost:8080/warehouse/warehouses/${currentEdit.id}`,
        { name: form.name, address: form.address },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      fetchWarehouses();
      handleCloseEdit();
    } catch (error) {
      console.error("Sửa kho lỗi:", error);
      if (error.response) console.error("Chi tiết lỗi:", error.response.data);
    }
  };

  const handleOpenDelete = (warehouse) => {
    setCurrentDelete(warehouse);
    setOpenDelete(true);
  };
  const handleCloseDelete = () => {
    setOpenDelete(false);
    setCurrentDelete(null);
  };

  const handleDeleteWarehouse = async () => {
    try {
      await axios.delete(`http://localhost:8080/warehouse/warehouses/${currentDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWarehouses();
      handleCloseDelete();
    } catch (error) {
      console.error("Xóa kho lỗi:", error);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh", color: "#333333" }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#6D5F4B" }}>Quản lý kho</Typography>

      <Button variant="contained" onClick={handleOpenAdd} sx={{ mb: 2, bgcolor: "#6D5F4B", color: "#E0D7C6", "&:hover": { bgcolor: "#4A473D" }, textTransform: "none" }}>Thêm kho</Button>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress sx={{ color: "#6D5F4B" }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: "none", bgcolor: "#FFFFFF" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#E9E4D4" }}>
                <TableCell sx={{ color: "#333333", fontWeight: "bold" }}>Tên kho</TableCell>
                <TableCell sx={{ color: "#333333", fontWeight: "bold" }}>Địa chỉ</TableCell>
                <TableCell sx={{ color: "#333333", fontWeight: "bold" }}>Chi tiết kho hàng</TableCell>
                <TableCell sx={{ color: "#333333", fontWeight: "bold", textAlign: "center" }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {warehouses.map((wh) => (
                <TableRow key={wh.id}>
                  <TableCell>{wh.name}</TableCell>
                  <TableCell>{wh.address}</TableCell>
                  <TableCell>
                    <Button
                      variant="text"
                      onClick={() => fetchInventoryByWarehouse(wh.id)}
                      sx={{ color: '#4A473D' }}
                    >
                      Xem chi tiết
                    </Button>
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    <IconButton onClick={() => handleOpenEdit(wh)} sx={{ color: "#6D5F4B" }} title="Sửa">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDelete(wh)} sx={{ color: "#6D5F4B" }} title="Xóa">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Thêm */}
      <Modal open={openAdd} onClose={handleCloseAdd}>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" color="#6D5F4B">Thêm kho mới</Typography>
            <IconButton onClick={handleCloseAdd} size="small" sx={{ color: "#6D5F4B" }}><CloseIcon /></IconButton>
          </Box>
          <TextField label="Tên kho" name="name" fullWidth size="small" sx={{ mb: 2 }} value={form.name} onChange={handleChange} />
          <TextField label="Địa chỉ" name="address" fullWidth size="small" sx={{ mb: 2 }} value={form.address} onChange={handleChange} />
          <Button variant="contained" onClick={handleAddWarehouse} fullWidth sx={{ bgcolor: "#6D5F4B", color: "#E0D7C6" }}>Thêm</Button>
        </Box>
      </Modal>

      {/* Modal Sửa */}
      <Modal open={openEdit} onClose={handleCloseEdit}>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" color="#6D5F4B">Sửa kho</Typography>
            <IconButton onClick={handleCloseEdit} size="small" sx={{ color: "#6D5F4B" }}><CloseIcon /></IconButton>
          </Box>
          <TextField label="Tên kho" name="name" fullWidth size="small" sx={{ mb: 2 }} value={form.name} onChange={handleChange} />
          <TextField label="Địa chỉ" name="address" fullWidth size="small" sx={{ mb: 2 }} value={form.address} onChange={handleChange} />
          <Button variant="contained" onClick={handleEditWarehouse} fullWidth sx={{ bgcolor: "#6D5F4B", color: "#E0D7C6" }}>Lưu thay đổi</Button>
        </Box>
      </Modal>

      {/* Dialog Xóa */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>Bạn có chắc chắn muốn xóa kho <b>{currentDelete?.name}</b> không?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Hủy</Button>
          <Button onClick={handleDeleteWarehouse} color="error">Xóa</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xem kho hàng */}
      <Dialog open={openInventoryDialog} onClose={() => setOpenInventoryDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Chi tiết hàng trong kho</DialogTitle>
        <DialogContent>
          {inventoryList.length === 0 ? (
            <Typography>Không có dữ liệu hàng hóa.</Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Mã SP</TableCell>
                  <TableCell>Tên SP</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Sẵn hàng</TableCell>
                  <TableCell>Đã nhận cọc </TableCell>
                  <TableCell>Đơn vị</TableCell>
                  <TableCell>Giá</TableCell>
                  <TableCell>Thuế (%)</TableCell>
                  <TableCell>Cập nhật</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventoryList.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.productCode}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.quantityAvailable}</TableCell>
                    <TableCell>{item.quantityReserved}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.unitPrice.toLocaleString()} đ</TableCell>
                    <TableCell>{item.taxRate}</TableCell>
                    <TableCell>{new Date(item.lastUpdated).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenInventoryDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}