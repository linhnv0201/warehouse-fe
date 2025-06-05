import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import axios from "axios";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function SaleOrders() {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // 'list' | 'create'

  // COMMON
  const token = localStorage.getItem("token");

  // --- STATE CHUNG CHO LIST ---
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [filterApproved, setFilterApproved] = useState(false);

  // --- STATE CHUNG CHO CREATE ---
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]); // Dữ liệu kho hàng


  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState(""); 
  const [orderName, setOrderName] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch đơn hàng bán (list)
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const url = filterApproved
        ? "http://localhost:8080/warehouse/sales-orders/approved"
        : "http://localhost:8080/warehouse/sales-orders";

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.result || []);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    }
    setLoadingOrders(false);
  };

  useEffect(() => {
    if (view === "list") fetchOrders();
  }, [filterApproved, view]);

  // Lấy khách hàng (create)
  useEffect(() => {
    if (view !== "create") return;
    // fetch customers
    axios
      .get("http://localhost:8080/warehouse/customers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCustomers(res.data.result || []))
      .catch((err) => console.error("Lỗi tải customers:", err));
  }, [view, token]);

  // Lấy sản phẩm khi chọn khách hàng (create)
  useEffect(() => {
    if (!selectedCustomer) {
      setProducts([]);
      setItems([{ productId: "", quantity: 1 }]);
      return;
    }
    setLoadingProducts(true);
    axios
      .get(`http://localhost:8080/warehouse/products/customer/${selectedCustomer}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProducts(res.data.result || []);
        setItems([{ productId: "", quantity: 1 }]);
      })
      .catch((err) => console.error("Lỗi tải products:", err))
      .finally(() => setLoadingProducts(false));
  }, [selectedCustomer, token]);

  // Xử lý tạo đơn hàng bán (create)
  const handleSubmit = async () => {
    if (!orderName || !selectedCustomer) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (items.some((item) => !item.productId || item.quantity <= 0)) {
      alert("Vui lòng chọn sản phẩm và số lượng hợp lệ");
      return;
    }

    const payload = {
      customerId: Number(selectedCustomer),
      orderName,
      items: items.map(({ productId, quantity }) => ({
        productId: Number(productId),
        quantity,
      })),
    };

    setLoadingCreate(true);
    try {
      await axios.post("htt/sale-orders", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Tạo đơn hàng bán thành công!");
      // Quay về list
      setView("list");
      // Reset form
      setOrderName("");
      setSelectedCustomer("");
      setItems([{ productId: "", quantity: 1 }]);
      fetchOrders();
    } catch (error) {
      console.error("Lỗi tạo đơn hàng bán:", error);
      alert("Tạo đơn hàng bán thất bại");
    } finally {
      setLoadingCreate(false);
    }
  };

  // Thêm bớt sản phẩm (create)
  const handleAddItem = () => setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));
  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: field === "quantity" ? Number(value) : value } : item
      )
    );
  };

  // === RENDER ===
  if (view === "create") {
    // Màn tạo đơn hàng bán mới
    return (
      <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh", maxWidth: 700, mx: "auto" }}>
        <Typography variant="h5" sx={{ mb: 3, color: "#6D5F4B" }}>
          Tạo đơn hàng bán mới
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <TextField
            label="Tên đơn hàng"
            value={orderName}
            onChange={(e) => setOrderName(e.target.value)}
            disabled={loadingCreate}
          />
        </FormControl>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="customer-label">Khách hàng</InputLabel>
          <Select
            labelId="customer-label"
            value={selectedCustomer}
            label="Khách hàng"
            onChange={(e) => setSelectedCustomer(e.target.value)}
            disabled={loadingCreate}
          >
            <MenuItem value="">
              <em>Chọn khách hàng</em>
            </MenuItem>
            {customers.map((customer) => (
              <MenuItem key={customer.id} value={customer.id}>
                {customer.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="warehouse-label">Kho hàng</InputLabel>
          <Select
            labelId="warehouse-label"
            value={selectedWarehouse}
            label="Kho hàng"
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            disabled={loadingCreate}
          >
            <MenuItem value="">
              <em>Chọn kho hàng</em>
            </MenuItem>
            {warehouses.map((wh) => (
              <MenuItem key={wh.id} value={wh.id}>
                {wh.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Typography variant="h6" sx={{ mt: 3, mb: 1, color: "#6D5F4B" }}>
          Danh sách sản phẩm
        </Typography>

        {loadingProducts ? (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <CircularProgress sx={{ color: "#6D5F4B" }} />
          </Box>
        ) : (
          items.map((item, index) => (
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }} key={index}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel id={`product-label-${index}`}>Sản phẩm</InputLabel>
                <Select
                  labelId={`product-label-${index}`}
                  value={item.productId}
                  label="Sản phẩm"
                  onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                  disabled={loadingCreate}
                >
                  <MenuItem value=""><em>Chọn sản phẩm</em></MenuItem>
                  {products.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Số lượng"
                type="number"
                inputProps={{ min: 1 }}
                value={item.quantity}
                onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                sx={{ width: 100 }}
                disabled={loadingCreate}
              />

              {items.length > 1 && (
                <IconButton
                  color="error"
                  onClick={() => handleRemoveItem(index)}
                  disabled={loadingCreate}
                  aria-label="Xóa sản phẩm"
                >
                  <RemoveCircleOutlineIcon />
                </IconButton>
              )}
            </Stack>
          ))
        )}

        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddItem}
          disabled={loadingCreate || loadingProducts || !selectedCustomer}
          sx={{ mb: 3 }}
        >
          Thêm sản phẩm
        </Button>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ width: "100%", bgcolor: "#6D5F4B" }}
            disabled={loadingCreate || loadingProducts}
          >
            {loadingCreate ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Tạo đơn hàng"}
          </Button>
        </Box>
      </Box>
    );
  }

  // Màn hình danh sách đơn hàng
  return (
    <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh" }}>
      <Typography variant="h5" sx={{ mb: 3, color: "#6D5F4B" }}>
        Danh sách đơn hàng bán
      </Typography>
 <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          onClick={() => setView("create")}
          sx={{ mr: 2, bgcolor: "#6D5F4B" }}
        >
          Tạo đơn hàng mới
        </Button>

<FormControl
  size="small"
  sx={{
    minWidth: 160,
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#6D5F4B", // viền bình thường
      },
      "&:hover fieldset": {
        borderColor: "#6D5F4B", // viền khi hover
      },
      "&.Mui-focused fieldset": {
        borderColor: "#6D5F4B", // viền khi focus
      },
    },
  }}
>
  <InputLabel id="filter-label">Lọc đơn hàng</InputLabel>
  <Select
    labelId="filter-label"
    value={filterApproved ? "approved" : "all"}
    label="Lọc đơn hàng"
    onChange={(e) => setFilterApproved(e.target.value === "approved")}
  >
    <MenuItem value="all">Tất cả đơn hàng</MenuItem>
    <MenuItem value="approved">Đơn đã duyệt</MenuItem>
  </Select>

</FormControl>
      </Box>
      {loadingOrders ? (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <CircularProgress sx={{ color: "#6D5F4B" }} />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn hàng</TableCell>
                <TableCell>Tên đơn hàng</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>{order.orderName}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>
                    <Button
                      component={Link}
                      to={`/sale-orders/${order.id}`}
                      variant="outlined"
                    >
                      Xem
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
