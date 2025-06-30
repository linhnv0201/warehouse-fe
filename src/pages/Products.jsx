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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
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
  width: 450,
  bgcolor: "#E9E4D4",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
  outline: "none",
  color: "#333333",
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [currentDelete, setCurrentDelete] = useState(null);

  const [selectedSupplierId, setSelectedSupplierId] = useState("");

  const [searchQuery, setSearchQuery] = useState('');


  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    unit: "",
    unitPrice: "",
    taxRate: "",
    supplierId: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const token = localStorage.getItem("token");

  //Search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim() === '') {
        fetchProducts();
        return;
      }
      axios
        .get(`https://warehouse-production-53d6.up.railway.app/warehouse/fuzzy-search?query=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => setProducts(res.data))
        .catch((err) => console.error("Fuzzy search error:", err));
    }, 300); // debounce 300ms

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);


  // Load danh sách sản phẩm
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://warehouse-production-53d6.up.railway.app/warehouse/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.result);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  // Load danh sách nhà cung cấp
  const fetchSuppliers = async () => {
    try {
      const res = await axios.get("https://warehouse-production-53d6.up.railway.app/warehouse/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuppliers(res.data.result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleFilterBySupplier = async (supplierId) => {
    setSelectedSupplierId(supplierId);
    if (!supplierId) {
      fetchProducts(); // Nếu bỏ lọc
      return;
    }
    try {
      const res = await axios.get(`https://warehouse-production-53d6.up.railway.app/warehouse/products/supplier/${supplierId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.result);
    } catch (error) {
      console.error("Lỗi lọc sản phẩm theo nhà cung cấp:", error);
    }
  };


  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Validate form trước khi gửi
  const validateForm = () => {
    if (!form.code.trim()) {
      setErrorMessage("Mã sản phẩm không được để trống.");
      return false;
    }
    if (!form.name.trim()) {
      setErrorMessage("Tên sản phẩm không được để trống.");
      return false;
    }
    if (!form.unit.trim()) {
      setErrorMessage("Đơn vị không được để trống.");
      return false;
    }
    if (!form.unitPrice || isNaN(parseFloat(form.unitPrice))) {
      setErrorMessage("Giá sản phẩm phải là số hợp lệ.");
      return false;
    }
    if (!form.supplierId) {
      setErrorMessage("Vui lòng chọn nhà cung cấp.");
      return false;
    }
    setErrorMessage("");
    return true;
  };

  // Thêm sản phẩm
  const handleAddProduct = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        unit: form.unit.trim(),
        unitPrice: parseFloat(form.unitPrice),
        taxRate: form.taxRate ? parseFloat(form.taxRate) : null,
        supplierId: parseInt(form.supplierId),
      };
      await axios.post("https://warehouse-production-53d6.up.railway.app/warehouse/products", payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      fetchProducts();
      setOpenAdd(false);
      setForm({
        code: "",
        name: "",
        description: "",
        unit: "",
        unitPrice: "",
        taxRate: "",
        supplierId: "",
      });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Lỗi không xác định. Vui lòng thử lại.");
      }
    }
  };

  // Mở modal sửa
  const handleOpenEdit = (product) => {
    setCurrentEdit(product);
    setForm({
      code: product.code || "",
      name: product.name || "",
      description: product.description || "",
      unit: product.unit || "",
      unitPrice: product.unitPrice ? product.unitPrice.toString() : "",
      taxRate: product.taxRate ? product.taxRate.toString() : "",
      supplierId: product.supplierId ? product.supplierId.toString() : "",
    });
    setErrorMessage("");
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setCurrentEdit(null);
    setErrorMessage("");
  };

  // Sửa sản phẩm
  const handleEditProduct = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        unit: form.unit.trim(),
        unitPrice: parseFloat(form.unitPrice),
        taxRate: form.taxRate ? parseFloat(form.taxRate) : null,
        supplierId: parseInt(form.supplierId),
      };
      await axios.put(`https://warehouse-production-53d6.up.railway.app/warehouse/products/${currentEdit.id}`, payload, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      fetchProducts();
      handleCloseEdit();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Lỗi không xác định. Vui lòng thử lại.");
      }
    }
  };

  // Xóa sản phẩm
  const handleOpenDelete = (product) => {
    setCurrentDelete(product);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setCurrentDelete(null);
    setOpenDelete(false);
  };

  const handleDeleteProduct = async () => {
    try {
      await axios.delete(`https://warehouse-production-53d6.up.railway.app/warehouse/products/${currentDelete.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
      handleCloseDelete();
    } catch (error) {
      console.error("Xóa sản phẩm lỗi:", error);
    }
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh", color: "#333333" }}>
      <Typography variant="h5" sx={{ mb: 2, color: "#6D5F4B" }}>
        Quản lý sản phẩm
      </Typography>

      <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
        <Button
          variant="contained"
          onClick={() => {
            setForm({
              code: "",
              name: "",
              description: "",
              unit: "",
              unitPrice: "",
              taxRate: "",
              supplierId: "",
            });
            setErrorMessage("");
            setOpenAdd(true);
          }}
          sx={{
            bgcolor: "#6D5F4B",
            color: "#E0D7C6",
            "&:hover": { bgcolor: "#4A473D" },
            textTransform: "none",
          }}
        >
          Thêm sản phẩm
        </Button>

        <FormControl
          size="small"
          sx={{
            minWidth: 250,
            '& .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
          }}
        >
          <InputLabel id="filter-supplier-label" sx={{ color: "#6D5F4B" }}>
            Lọc theo nhà cung cấp
          </InputLabel>
          <Select
            labelId="filter-supplier-label"
            value={selectedSupplierId}
            label="Lọc theo nhà cung cấp"
            onChange={(e) => handleFilterBySupplier(e.target.value)}
          >
            <MenuItem value="">-- Tất cả nhà cung cấp --</MenuItem>
            {suppliers.map((sup) => (
              <MenuItem key={sup.id} value={sup.id}>
                {sup.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Tìm kiếm sản phẩm"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: 300,
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#6D5F4B' },
              '&:hover fieldset': { borderColor: '#6D5F4B' },
              '&.Mui-focused fieldset': { borderColor: '#6D5F4B' },
            },
            '& label': { color: '#6D5F4B' },
            '& input': { color: '#333' },
          }}
        />

      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress sx={{ color: "#6D5F4B" }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: "none", bgcolor: "#FFFFFF" }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ bgcolor: "#E9E4D4" }}>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Mã SP</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Tên SP</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Mô tả</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Đơn vị</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Giá</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Thuế (%)</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Nhà cung cấp</TableCell>
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold", textAlign: "center" }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell>{p.unitPrice?.toLocaleString("vi-VN")} VND</TableCell>
                  <TableCell>{p.taxRate !== null ? p.taxRate + "%" : ""}</TableCell>
                  {/* <TableCell>{p.supplierName}</TableCell> */}
                  <TableCell>
                    {p.supplierName || p.supplier?.name || "Không rõ"}
                  </TableCell>

                  <TableCell align="center">
                    <IconButton color="5D4037" onClick={() => handleOpenEdit(p)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="5D4037" onClick={() => handleOpenDelete(p)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    Không có sản phẩm nào
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Thêm sản phẩm */}
      <Modal open={openAdd} onClose={() => setOpenAdd(false)}>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" color="#6D5F4B">
              Thêm sản phẩm mới
            </Typography>
            <IconButton onClick={() => setOpenAdd(false)} size="small" sx={{ color: "#6D5F4B" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {errorMessage && (
            <Typography color="error" sx={{ mb: 2, fontWeight: "bold" }}>
              {errorMessage}
            </Typography>
          )}

          <TextField
            label="Mã sản phẩm"
            name="code"
            value={form.code}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Tên sản phẩm"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Mô tả"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            size="small"
            multiline
            rows={2}
            sx={{ mb: 1 }}
          />
          <TextField
            label="Đơn vị"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Giá sản phẩm (VND)"
            name="unitPrice"
            type="number"
            value={form.unitPrice}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Thuế mặc định (%)"
            name="taxRate"
            type="number"
            value={form.taxRate}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="supplier-label">Nhà cung cấp</InputLabel>
            <Select
              labelId="supplier-label"
              name="supplierId"
              value={form.supplierId}
              label="Nhà cung cấp"
              onChange={handleChange}
            >
              {suppliers.map((sup) => (
                <MenuItem key={sup.id} value={sup.id.toString()}>
                  {sup.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            onClick={handleAddProduct}
            sx={{ bgcolor: "#6D5F4B", "&:hover": { bgcolor: "#4A473D" }, textTransform: "none" }}
          >
            Thêm sản phẩm
          </Button>
        </Box>
      </Modal>

      {/* Modal Sửa sản phẩm */}
      <Modal open={openEdit} onClose={handleCloseEdit}>
        <Box sx={styleModal}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="h6" color="#6D5F4B">
              Sửa sản phẩm
            </Typography>
            <IconButton onClick={handleCloseEdit} size="small" sx={{ color: "#6D5F4B" }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {errorMessage && (
            <Typography color="error" sx={{ mb: 2, fontWeight: "bold" }}>
              {errorMessage}
            </Typography>
          )}

          <TextField
            label="Mã sản phẩm"
            name="code"
            value={form.code}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Tên sản phẩm"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Mô tả"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            size="small"
            multiline
            rows={2}
            sx={{ mb: 1 }}
          />
          <TextField
            label="Đơn vị"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Giá sản phẩm (VND)"
            name="unitPrice"
            type="number"
            value={form.unitPrice}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            label="Thuế mặc định (%)"
            name="taxRate"
            type="number"
            value={form.taxRate}
            onChange={handleChange}
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="supplier-edit-label">Nhà cung cấp</InputLabel>
            <Select
              labelId="supplier-edit-label"
              name="supplierId"
              value={form.supplierId}
              label="Nhà cung cấp"
              onChange={handleChange}
            >
              {suppliers.map((sup) => (
                <MenuItem key={sup.id} value={sup.id.toString()}>
                  {sup.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            fullWidth
            onClick={handleEditProduct}
            sx={{ bgcolor: "#6D5F4B", "&:hover": { bgcolor: "#4A473D" }, textTransform: "none" }}
          >
            Lưu thay đổi
          </Button>
        </Box>
      </Modal>

      {/* Modal Xóa sản phẩm */}
      <Modal open={openDelete} onClose={handleCloseDelete}>
        <Box sx={{ ...styleModal, width: 350, textAlign: "center" }}>
          <Typography variant="h6" sx={{ mb: 3, color: "#6D5F4B" }}>
            Xác nhận xóa sản phẩm
          </Typography>
          <Typography sx={{ mb: 3 }}>
            Bạn có chắc muốn xóa sản phẩm <strong>{currentDelete?.name}</strong> không?
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "space-around" }}>
            <Button variant="contained" color="error" onClick={handleDeleteProduct}>
              Xóa
            </Button>
            <Button variant="outlined" onClick={handleCloseDelete}>
              Hủy
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}
