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
import { useNavigate, Link } from "react-router-dom";

export default function SaleOrders() {
  const navigate = useNavigate();
  const [view, setView] = useState("list");

  const token = localStorage.getItem("token");

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [orderName, setOrderName] = useState("");
  const [items, setItems] = useState([{ inventoryId: "", quantity: 1, saleUnitPrice: 0 }]);

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch danh sách đơn hàng
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const url = `http://localhost:8080/warehouse/sales-orders?status=${filterStatus}`;

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
  }, [filterStatus, view]);

  // Fetch customers + warehouses
  useEffect(() => {
    if (view !== "create") return;

    axios
      .get("http://localhost:8080/warehouse/customers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCustomers(res.data.result || []))
      .catch((err) => console.error("Lỗi tải customers:", err));

    axios
      .get("http://localhost:8080/warehouse/warehouses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setWarehouses(res.data.result || []))
      .catch((err) => console.error("Lỗi tải warehouses:", err));
  }, [view, token]);

  // Fetch sản phẩm theo warehouseId
  useEffect(() => {
    if (!selectedWarehouse) {
      setProducts([]);
      setItems([{ inventoryId: "", quantity: 1, saleUnitPrice: 0 }]);
      return;
    }

    setLoadingProducts(true);
    axios
      .get(`http://localhost:8080/warehouse/inventories/warehouse/${selectedWarehouse}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProducts(res.data.result || []);
        setItems([{ inventoryId: "", quantity: 1, saleUnitPrice: 0 }]);
      })
      .catch((err) => console.error("Lỗi tải inventories:", err))
      .finally(() => setLoadingProducts(false));
  }, [selectedWarehouse, token]);

  // Tạo đơn hàng
  const handleSubmit = async () => {
    if (!orderName || !selectedCustomer || !selectedWarehouse) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (
      items.some(
        (item) =>
          !item.inventoryId ||
          item.quantity <= 0 ||
          item.saleUnitPrice <= 0
      )
    ) {
      alert("Vui lòng chọn sản phẩm, số lượng và đơn giá hợp lệ");
      return;
    }

    const payload = {
      customerId: Number(selectedCustomer),
      warehouseId: Number(selectedWarehouse),
      saleName: orderName,
      items: items.map(({ inventoryId, quantity, saleUnitPrice }) => ({
        inventoryId,
        quantity,
        saleUnitPrice,
      })),
    };

    setLoadingCreate(true);
    try {
      const res = await axios.post("http://localhost:8080/warehouse/sales-orders", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Tạo đơn hàng bán thành công!");
      console.log("Kết quả:", res.data.result);
      setView("list");
      setOrderName("");
      setSelectedCustomer("");
      setSelectedWarehouse("");
      setItems([{ inventoryId: "", quantity: 1, saleUnitPrice: 0 }]);
      fetchOrders();
    } catch (error) {
      console.error("Lỗi tạo đơn hàng bán:", error);
      alert("Tạo đơn hàng bán thất bại");
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleAddItem = () =>
    setItems((prev) => [...prev, { inventoryId: "", quantity: 1, saleUnitPrice: 0 }]);

  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "quantity" || field === "saleUnitPrice"
                  ? Number(value)
                  : value,
            }
          : item
      )
    );
  };
// Đã cắt ngắn phần đầu để tập trung vào style
// Giữ nguyên toàn bộ logic

// === RENDER CREATE ===
if (view === "create") {
  return (
    <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh", maxWidth: 800, mx: "auto" }}>
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
        <InputLabel id="customer-label" sx={{ color: "#6D5F4B" }}>Khách hàng</InputLabel>
        <Select
          labelId="customer-label"
          value={selectedCustomer}
          label="Khách hàng"
          onChange={(e) => setSelectedCustomer(e.target.value)}
          disabled={loadingCreate}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
          }}
        >
          <MenuItem value=""><em>Chọn khách hàng</em></MenuItem>
          {customers.map((customer) => (
            <MenuItem key={customer.id} value={customer.id}>
              {customer.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="warehouse-label" sx={{ color: "#6D5F4B" }}>Kho hàng</InputLabel>
        <Select
          labelId="warehouse-label"
          value={selectedWarehouse}
          label="Kho hàng"
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          disabled={loadingCreate}
          sx={{
            '& .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
          }}
        >
          <MenuItem value=""><em>Chọn kho hàng</em></MenuItem>
          {warehouses.map((wh) => (
            <MenuItem key={wh.id} value={wh.id}>{wh.name}</MenuItem>
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
            <FormControl sx={{ flex: 2 }}>
              <InputLabel id={`inventory-label-${index}`} sx={{ color: "#6D5F4B" }}>Sản phẩm</InputLabel>
              <Select
                labelId={`inventory-label-${index}`}
                value={item.inventoryId}
                label="Sản phẩm"
                onChange={(e) => handleItemChange(index, "inventoryId", e.target.value)}
                disabled={loadingCreate}
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
                }}
              >
                <MenuItem value=""><em>Chọn sản phẩm</em></MenuItem>
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {`${p.productCode} - ${p.productName} (Còn: ${p.quantityAvailable}) - Giá mua: ${p.unitPrice.toLocaleString()}đ`}
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

            <TextField
              label="Đơn giá bán"
              type="number"
              inputProps={{ min: 0 }}
              value={item.saleUnitPrice}
              onChange={(e) => handleItemChange(index, "saleUnitPrice", e.target.value)}
              sx={{ width: 140 }}
              disabled={loadingCreate}
            />

            {items.length > 1 && (
              <IconButton
                color="error"
                onClick={() => handleRemoveItem(index)}
                disabled={loadingCreate}
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
        disabled={loadingCreate || loadingProducts || !selectedWarehouse}
        sx={{ mb: 3, color: "#6D5F4B" }}
      >
        Thêm sản phẩm
      </Button>

      <Box sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loadingCreate || loadingProducts}
          sx={{ mr: 2, bgcolor: "#6D5F4B", '&:hover': { bgcolor: "#5a4d3a" } }}
        >
          {loadingCreate ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Tạo đơn hàng"}
        </Button>

        <Button
          variant="outlined"
          onClick={() => setView("list")}
          disabled={loadingCreate || loadingProducts}
        >
          Hủy
        </Button>
      </Box>

    </Box>
  );
}

// === RENDER LIST ===
return (
  <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh" }}>
    <Typography variant="h5" sx={{ mb: 3, color: "#6D5F4B" }}>
      Danh sách đơn hàng bán
    </Typography>

    <Box sx={{ mb: 2 }}>
      <Button
        variant="contained"
        onClick={() => setView("create")}
        sx={{ mr: 2, bgcolor: "#6D5F4B", '&:hover': { bgcolor: "#5a4d3a" } }}
      >
        Tạo đơn hàng mới
      </Button>

      <FormControl size="small" sx={{
        minWidth: 160,
        '& .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
      }}>
        <InputLabel id="filter-label" sx={{ color: "#6D5F4B" }}>Lọc đơn hàng</InputLabel>
        <Select
          labelId="filter-label"
          value={filterStatus}
          label="Lọc đơn hàng"
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <MenuItem value="ALL">Tất cả đơn hàng</MenuItem>
          <MenuItem value="APPROVED">Đơn đã duyệt</MenuItem>
          <MenuItem value="CANCELLED">Đơn đã hủy</MenuItem>
          <MenuItem value="COMPLETED">Đơn đã hoàn thành</MenuItem>
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
            <TableRow sx={{ bgcolor: "#E9E4D4" }}>
              <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Mã đơn hàng</TableCell>
              <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Tên đơn hàng</TableCell>
              <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Khách hàng</TableCell>
              <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Trạng thái</TableCell>
              <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.code}</TableCell>
                <TableCell>{order.saleName}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.status}</TableCell>
                <TableCell>
                  <Link to={`/dashboard/sale-orders/${order.id}`} style={{ color: "#6D5F4B" }}>
                    Xem chi tiết
                  </Link>
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