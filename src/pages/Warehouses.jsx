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

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#F5F1E9",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  outline: "none",
  color: "#5D4037",
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
  const [inventoryWarehouseName, setInventoryWarehouseName] = useState("");
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [totalValue, setTotalValue] = useState(0);

  const token = localStorage.getItem("token");

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://warehouse-vkz2.onrender.com/warehouse/warehouses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWarehouses(res.data.result);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const fetchInventoryByWarehouse = async (id) => {
    setLoadingInventory(true);
    try {
      const warehouse = warehouses.find(w => w.id === id);
      setInventoryWarehouseName(warehouse?.name || "");

      const res = await axios.get(`https://warehouse-vkz2.onrender.com/warehouse/inventories/warehouse/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const inv = res.data.result || [];
      setInventoryList(inv);

      // Tính tổng giá trị hàng hóa
      const sum = inv.reduce((acc, item) =>
        acc + item.quantityAvailable * item.unitPrice * (1 + item.taxRate / 100), 0
      );
      setTotalValue(sum);
      setOpenInventoryDialog(true);
    } catch (err) {
      console.error("Lỗi khi lấy kho:", err);
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

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
      await axios.post("https://warehouse-vkz2.onrender.com/warehouse/warehouses", form, {
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
    setForm({ name: warehouse.name, address: warehouse.address });
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setCurrentEdit(null);
    setOpenEdit(false);
  };

  const handleEditWarehouse = async () => {
    try {
      await axios.put(
        `https://warehouse-vkz2.onrender.com/warehouse/warehouses/${currentEdit.id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchWarehouses();
      handleCloseEdit();
    } catch (error) {
      console.error("Sửa kho lỗi:", error);
    }
  };

  const handleOpenDelete = (warehouse) => {
    setCurrentDelete(warehouse);
    setOpenDelete(true);
  };
  const handleCloseDelete = () => {
    setCurrentDelete(null);
    setOpenDelete(false);
  };

  const handleDeleteWarehouse = async () => {
    try {
      await axios.delete(`https://warehouse-vkz2.onrender.com/warehouse/warehouses/${currentDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchWarehouses();
      handleCloseDelete();
    } catch (error) {
      console.error("Xóa kho lỗi:", error);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh", color: "#5D4037" }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#5D4037" }}>Quản lý kho</Typography>
      <Button
        variant="contained"
        onClick={handleOpenAdd}
        sx={{ mb: 2, bgcolor: "#6D5F4B", ":hover": { bgcolor: "#4E342E" } }}
      >
        Thêm kho
      </Button>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress sx={{ color: "#6D5F4B" }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ bgcolor: "#FFFFFF" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#E9E4D4" }}>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Tên kho</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Địa chỉ</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Chi tiết</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }} align="center" >Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {warehouses.map((wh) => (
                <TableRow key={wh.id}>
                  <TableCell>{wh.name}</TableCell>
                  <TableCell>{wh.address}</TableCell>
                  <TableCell>
                    <Button onClick={() => fetchInventoryByWarehouse(wh.id)} sx={{ color: "#5D4037" }}>
                      Xem kho hàng
                    </Button>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton onClick={() => handleOpenEdit(wh)} sx={{ color: "#5D4037" }}><EditIcon /></IconButton>
                    <IconButton onClick={() => handleOpenDelete(wh)} sx={{ color: "#5D4037" }}><DeleteIcon /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Dialog xem kho hàng */}
      <Dialog open={openInventoryDialog} onClose={() => setOpenInventoryDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ bgcolor: "#6D5F4B", color: "#FFF" }}>
          Danh sách hàng trong kho: <strong>{inventoryWarehouseName}</strong>
        </DialogTitle>

        <DialogContent sx={{ bgcolor: "#F5F1E9" }}>
          {loadingInventory ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <CircularProgress sx={{ color: "#6D5F4B" }} />
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "#E9E4D4" }}>
                    <TableCell><strong>Mã SP</strong></TableCell>
                    <TableCell><strong>Tên SP</strong></TableCell>
                    <TableCell><strong>Mô tả</strong></TableCell>
                    <TableCell align="right"><strong>Tổng SL</strong></TableCell>
                    <TableCell align="right"><strong>Còn hàng</strong></TableCell>
                    <TableCell align="right"><strong>Đã đặt</strong></TableCell>
                    <TableCell align="right"><strong>Đã bán</strong></TableCell>
                    <TableCell><strong>Đơn vị</strong></TableCell>
                    <TableCell align="right"><strong>Giá nhập</strong></TableCell>
                    <TableCell align="right"><strong>Thuế</strong></TableCell>
                    <TableCell><strong>Cập nhật</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventoryList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productCode}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell align="right">{item.quantityAvailable}</TableCell>
                      <TableCell align="right">{item.quantityReserved}</TableCell>
                      <TableCell align="right">{item.sold}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell align="right">{item.unitPrice.toLocaleString()} ₫</TableCell>
                      <TableCell align="right">{item.taxRate}%</TableCell>
                      <TableCell>{new Date(item.lastUpdated).toLocaleString("vi-VN")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>

        <DialogActions sx={{ bgcolor: "#EFEAE4", justifyContent: "flex-end", px: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Typography sx={{ fontWeight: "bold", color: "#5D4037" }}>
              Tổng giá trị: {totalValue.toLocaleString("vi-VN")} ₫
            </Typography>
            <Button onClick={() => setOpenInventoryDialog(false)} sx={{ color: "#5D4037" }}>
              Đóng
            </Button>
          </Box>
        </DialogActions>

      </Dialog>

      {/* Modal thêm kho */}
      <Modal open={openAdd} onClose={handleCloseAdd}>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">Thêm kho mới</Typography>
            <IconButton onClick={handleCloseAdd}><CloseIcon /></IconButton>
          </Box>
          <TextField label="Tên kho" name="name" fullWidth value={form.name} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField label="Địa chỉ" name="address" fullWidth value={form.address} onChange={handleChange} sx={{ mb: 2 }} />
          <Button fullWidth variant="contained" onClick={handleAddWarehouse} sx={{ bgcolor: "#6D5F4B", color: "#fff" }}>
            Thêm kho
          </Button>
        </Box>
      </Modal>

      {/* Modal sửa kho */}
      <Modal open={openEdit} onClose={handleCloseEdit}>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6">Sửa kho</Typography>
            <IconButton onClick={handleCloseEdit}><CloseIcon /></IconButton>
          </Box>
          <TextField label="Tên kho" name="name" fullWidth value={form.name} onChange={handleChange} sx={{ mb: 2 }} />
          <TextField label="Địa chỉ" name="address" fullWidth value={form.address} onChange={handleChange} sx={{ mb: 2 }} />
          <Button fullWidth variant="contained" onClick={handleEditWarehouse} sx={{ bgcolor: "#6D5F4B", color: "#fff" }}>
            Cập nhật
          </Button>
        </Box>
      </Modal>

      {/* Dialog xác nhận xóa */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa kho <b>{currentDelete?.name}</b> không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>Hủy</Button>
          <Button onClick={handleDeleteWarehouse} color="error">Xóa</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
