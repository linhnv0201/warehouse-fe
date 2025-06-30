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
  FormControlLabel,
  Checkbox,
  FormGroup,
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

const roles = ["MANAGER", "PURCHASER", "ACCOUNTANT", "WAREHOUSE"];

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

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [currentDelete, setCurrentDelete] = useState(null);

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullname: "",
    phone: "",
    address: "",
    role: [],
  });

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://warehouse-vkz2.onrender.com/warehouse/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(res.data.result);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // --- Xử lý form thay đổi ---
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (event) => {
    const value = event.target.name;
    setForm((prev) => {
      const currentRoles = prev.role;
      if (currentRoles.includes(value)) {
        return {
          ...prev,
          role: currentRoles.filter((r) => r !== value),
        };
      } else {
        return {
          ...prev,
          role: [...currentRoles, value],
        };
      }
    });
  };

  // --- Thêm mới ---
  const handleOpenAdd = () => {
    setForm({
      email: "",
      password: "",
      fullname: "",
      phone: "",
      address: "",
      role: [],
    });
    setOpenAdd(true);
  };
  const handleCloseAdd = () => setOpenAdd(false);

  const handleAddEmployee = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://warehouse-vkz2.onrender.com/warehouse/users", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
      handleCloseAdd();
    } catch (error) {
      console.error("Thêm nhân viên lỗi:", error);
    }
  };

  // --- Sửa ---
  const handleOpenEdit = (employee) => {
    setCurrentEdit(employee);
    setForm({
      email: employee.email,
      password: "", // Để trống khi edit, không bắt buộc đổi pass
      fullname: employee.fullname || "",
      phone: employee.phone || "",
      address: employee.address || "",
      role: employee.role || [],
    });
    setOpenEdit(true);
  };
  const handleCloseEdit = () => {
    setOpenEdit(false);
    setCurrentEdit(null);
  };

  const handleEditEmployee = async () => {
    try {
      const token = localStorage.getItem("token");

      const updateData = {
        fullname: form.fullname,
        phone: form.phone,
        address: form.address,
        role: form.role,
      };

      // Chỉ thêm password nếu người dùng nhập
      if (form.password?.trim()) {
        updateData.password = form.password;
      }

      await axios.put(`https://warehouse-vkz2.onrender.com/warehouse/users/${currentEdit.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });


      fetchEmployees();
      handleCloseEdit();
    } catch (error) {
      console.error("Sửa nhân viên lỗi:", error);
    }
  };

  // --- Xóa ---
  const handleOpenDelete = (employee) => {
    setCurrentDelete(employee);
    setOpenDelete(true);
  };
  const handleCloseDelete = () => {
    setOpenDelete(false);
    setCurrentDelete(null);
  };

  const handleDeleteEmployee = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://warehouse-vkz2.onrender.com/warehouse/users/${currentDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchEmployees();
      handleCloseDelete();
    } catch (error) {
      console.error("Xóa nhân viên lỗi:", error);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh", color: "#333333" }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#6D5F4B" }}>
        Quản lý nhân viên
      </Typography>

      <Button
        variant="contained"
        onClick={handleOpenAdd}
        sx={{
          mb: 2,
          bgcolor: "#6D5F4B",
          color: "#E0D7C6",
          "&:hover": { bgcolor: "#4A473D" },
          textTransform: "none",
        }}
      >
        Thêm nhân viên
      </Button>

      <TableContainer component={Paper} sx={{ boxShadow: "none", bgcolor: "#FFFFFF" }}>
        <Table sx={{ minWidth: 650 }} aria-label="employee table">
          <TableHead>
            <TableRow sx={{ bgcolor: "#E9E4D4" }}>
              <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Email</TableCell>
              <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Tên</TableCell>
              <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>SDT</TableCell>
              <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Địa chỉ</TableCell>
              <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Vai trò</TableCell>
              <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold", textAlign: "center" }}>
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((emp) => (
              <TableRow key={emp.id} sx={{ bgcolor: "#FFFFFF" }}>
                <TableCell
                  sx={{
                    color: "#333333",
                    maxWidth: 180,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={emp.email}
                >
                  {emp.email}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#333333",
                    maxWidth: 150,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={emp.fullname || "(Chưa có)"}
                >
                  {emp.fullname || "(Chưa có)"}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#333333",
                    maxWidth: 130,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={emp.phone || "(Chưa có)"}
                >
                  {emp.phone || "(Chưa có)"}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#333333",
                    maxWidth: 200,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={emp.address || "(Chưa có)"}
                >
                  {emp.address || "(Chưa có)"}
                </TableCell>
                <TableCell
                  sx={{
                    color: "#333333",
                    maxWidth: 180,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={emp.role?.join(", ")}
                >
                  {emp.role?.join(", ")}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <IconButton
                    onClick={() => handleOpenEdit(emp)}
                    sx={{ color: "#6D5F4B" }}
                    title="Sửa"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => handleOpenDelete(emp)}
                    sx={{ color: "#6D5F4B" }}
                    title="Xóa"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

      {/* Modal Thêm */}
      <Modal open={openAdd} onClose={handleCloseAdd} aria-labelledby="modal-add-employee" closeAfterTransition>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" color="#6D5F4B">
              Thêm nhân viên mới
            </Typography>
            <IconButton onClick={handleCloseAdd} size="small" sx={{ color: "#6D5F4B" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            label="Email"
            name="email"
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            value={form.email}
            onChange={handleChange}
            InputLabelProps={{ style: { color: "#6D5F4B" } }}
            inputProps={{ style: { color: "#333333" } }}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            value={form.password}
            onChange={handleChange}
            InputLabelProps={{ style: { color: "#6D5F4B" } }}
            inputProps={{ style: { color: "#333333" } }}
          />
          <TextField
            label="Fullname"
            name="fullname"
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            value={form.fullname}
            onChange={handleChange}
            InputLabelProps={{ style: { color: "#6D5F4B" } }}
            inputProps={{ style: { color: "#333333" } }}
          />
          <TextField
            label="Phone"
            name="phone"
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            value={form.phone}
            onChange={handleChange}
            InputLabelProps={{ style: { color: "#6D5F4B" } }}
            inputProps={{ style: { color: "#333333" } }}
          />
          <TextField
            label="Address"
            name="address"
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            value={form.address}
            onChange={handleChange}
            InputLabelProps={{ style: { color: "#6D5F4B" } }}
            inputProps={{ style: { color: "#333333" } }}
          />

          <Typography variant="subtitle1" sx={{ mb: 1, color: "#6D5F4B" }}>
            Vai trò
          </Typography>
          <FormGroup row sx={{ mb: 2 }}>
            {roles.map((r) => (
              <FormControlLabel
                key={r}
                control={
                  <Checkbox
                    checked={form.role.includes(r)}
                    onChange={handleRoleChange}
                    name={r}
                    sx={{ color: "#6D5F4B", "&.Mui-checked": { color: "#4A473D" } }}
                  />
                }
                label={r}
                sx={{ color: "#6D5F4B" }}
              />
            ))}
          </FormGroup>

          <Button
            variant="contained"
            onClick={handleAddEmployee}
            fullWidth
            sx={{ bgcolor: "#6D5F4B", color: "#E0D7C6", textTransform: "none" }}
          >
            Thêm
          </Button>
        </Box>
      </Modal>

      {/* Modal Sửa */}
      <Modal open={openEdit} onClose={handleCloseEdit} aria-labelledby="modal-edit-employee" closeAfterTransition>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" color="#6D5F4B">
              Sửa nhân viên
            </Typography>
            <IconButton onClick={handleCloseEdit} size="small" sx={{ color: "#6D5F4B" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            label="Email"
            name="email"
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            value={form.email}
            onChange={handleChange}
            disabled
            InputLabelProps={{ style: { color: "#6D5F4B" } }}
            inputProps={{ style: { color: "#333333" } }}
          />
          <TextField
            label="Password (Để trống nếu không đổi)"
            name="password"
            type="password"
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            value={form.password}
            onChange={handleChange}
            InputLabelProps={{ style: { color: "#6D5F4B" } }}
            inputProps={{ style: { color: "#333333" } }}
          />
          <TextField
            label="Fullname"
            name="fullname"
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            value={form.fullname}
            onChange={handleChange}
            InputLabelProps={{ style: { color: "#6D5F4B" } }}
            inputProps={{ style: { color: "#333333" } }}
          />
          <TextField
            label="Phone"
            name="phone"
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            value={form.phone}
            onChange={handleChange}
            InputLabelProps={{ style: { color: "#6D5F4B" } }}
            inputProps={{ style: { color: "#333333" } }}
          />
          <TextField
            label="Address"
            name="address"
            fullWidth
            variant="outlined"
            size="small"
            sx={{ mb: 2 }}
            value={form.address}
            onChange={handleChange}
            InputLabelProps={{ style: { color: "#6D5F4B" } }}
            inputProps={{ style: { color: "#333333" } }}
          />

          <Typography variant="subtitle1" sx={{ mb: 1, color: "#6D5F4B" }}>
            Vai trò
          </Typography>
          <FormGroup row sx={{ mb: 2 }}>
            {roles.map((r) => (
              <FormControlLabel
                key={r}
                control={
                  <Checkbox
                    checked={form.role.includes(r)}
                    onChange={handleRoleChange}
                    name={r}
                    sx={{ color: "#6D5F4B", "&.Mui-checked": { color: "#4A473D" } }}
                  />
                }
                label={r}
                sx={{ color: "#6D5F4B" }}
              />
            ))}
          </FormGroup>

          <Button
            variant="contained"
            onClick={handleEditEmployee}
            fullWidth
            sx={{ bgcolor: "#6D5F4B", color: "#E0D7C6", textTransform: "none" }}
          >
            Lưu thay đổi
          </Button>
        </Box>
      </Modal>

      {/* Dialog Xóa */}
      <Dialog
        open={openDelete}
        onClose={handleCloseDelete}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title" sx={{ color: "#6D5F4B" }}>
          Xác nhận xóa nhân viên
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ color: "#333333" }}>
            Bạn có chắc chắn muốn xóa nhân viên{" "}
            <strong>{currentDelete?.fullname || currentDelete?.email}</strong> không? Hành động này không thể
            hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} sx={{ color: "#6D5F4B" }}>
            Hủy
          </Button>
          <Button onClick={handleDeleteEmployee} sx={{ color: "#B00020" }} autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
