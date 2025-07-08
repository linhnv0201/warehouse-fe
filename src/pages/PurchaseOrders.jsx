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



export default function PurchaseOrders() {
  const navigate = useNavigate();
  const [view, setView] = useState("list"); // 'list' | 'create'



  // COMMON
  const token = localStorage.getItem("token");

  // --- STATE CHUNG CHO LIST ---
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingOrderIds, setLoadingOrderIds] = useState([]);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // --- STATE CHUNG CHO CREATE ---
  const [warehouses, setWarehouses] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [orderName, setOrderName] = useState("");
  const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

  const [loadingCreate, setLoadingCreate] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Fetch đơn hàng (list)
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/warehouse/purchase-orders?status=${filterStatus}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data.result || []);
    } catch (error) {
      console.error("Lỗi tải đơn hàng:", error);
    }
    setLoadingOrders(false);
  };

  // Trong useEffect khi lọc thay đổi
  useEffect(() => {
    if (view === "list") fetchOrders();
  }, [filterStatus, view]);


  // Lấy kho & nhà cung cấp (create)
  useEffect(() => {
    if (view !== "create") return;
    // fetch warehouses
    axios
      .get("http://localhost:8080/warehouse/warehouses", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setWarehouses(res.data.result || []))
      .catch((err) => console.error("Lỗi tải warehouses:", err));
    // fetch suppliers
    axios
      .get("http://localhost:8080/warehouse/suppliers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSuppliers(res.data.result || []))
      .catch((err) => console.error("Lỗi tải suppliers:", err));
  }, [view, token]);

  // Khi chọn supplier thì load products theo supplierId (create)
  useEffect(() => {
    if (!selectedSupplier) {
      setProducts([]);
      setItems([{ productId: "", quantity: 1 }]);
      return;
    }
    setLoadingProducts(true);
    axios
      .get(`http://localhost:8080/warehouse/products/supplier/${selectedSupplier}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProducts(res.data.result || []);
        setItems([{ productId: "", quantity: 1 }]);
      })
      .catch((err) => console.error("Lỗi tải products:", err))
      .finally(() => setLoadingProducts(false));
  }, [selectedSupplier, token]);

  // Xử lý tạo đơn hàng (create)
  const handleSubmit = async () => {
    if (!orderName || !selectedSupplier || !selectedWarehouse) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (items.some((item) => !item.productId || item.quantity <= 0)) {
      alert("Vui lòng chọn sản phẩm và số lượng hợp lệ");
      return;
    }

    const payload = {
      supplierId: Number(selectedSupplier),
      warehouseId: Number(selectedWarehouse),
      orderName,
      items: items.map(({ productId, quantity }) => ({
        productId: Number(productId),
        quantity,
      })),
    };

    setLoadingCreate(true);
    try {
      await axios.post("http://localhost:8080/warehouse/purchase-orders", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Tạo đơn hàng thành công!");
      // Quay về list
      setView("list");
      // Reset form
      setOrderName("");
      setSelectedSupplier("");
      setSelectedWarehouse("");
      setItems([{ productId: "", quantity: 1 }]);
      fetchOrders();
    } catch (error) {
      console.error("Lỗi tạo đơn hàng:", error);
      alert("Tạo đơn hàng thất bại");
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

  // Cập nhật trạng thái đơn hàng (list)
  const handleChangeOrderStatus = async (orderId, status) => {
    setLoadingOrderIds((prev) => [...prev, orderId]);
    try {
      await axios.patch(
        `http://localhost:8080/warehouse/purchase-orders/${orderId}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error?.response?.data || error.message);
    } finally {
      setLoadingOrderIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  // === RENDER ===
  if (view === "create") {
    const calculateLineTotal = (item) => {
      const product = products.find((p) => p.id === item.productId);
      const qty = Number(item.quantity);
      if (product && !isNaN(qty)) {
        return product.unitPrice * qty * (1 + (product.taxRate || 0) / 100);
      }
      return 0;
    };

    const totalAmount = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);

    return (
      <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh", maxWidth: 700, mx: "auto" }}>
        <Typography variant="h5" sx={{ mb: 3, color: "#6D5F4B" }}>
          Tạo đơn hàng mua mới
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
          <InputLabel id="supplier-label">Nhà cung cấp</InputLabel>
          <Select
            labelId="supplier-label"
            value={selectedSupplier}
            label="Nhà cung cấp"
            onChange={(e) => setSelectedSupplier(e.target.value)}
            disabled={loadingCreate}
          >
            <MenuItem value=""><em>Chọn nhà cung cấp</em></MenuItem>
            {suppliers.map((sup) => (
              <MenuItem key={sup.id} value={sup.id}>{sup.name}</MenuItem>
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
          items.map((item, index) => {
            const product = products.find(p => p.id === item.productId);
            const qty = Number(item.quantity);
            const total = calculateLineTotal(item);

            return (
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }} key={index}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel id={`product-label-${index}`}>Sản phẩm</InputLabel>
                  <Select
                    labelId={`product-label-${index}`}
                    value={item.productId}
                    label="Sản phẩm"
                    onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                    disabled={loadingCreate}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 300, // 👈 giới hạn chiều cao menu dropdown
                          overflowY: "auto",
                        },
                      },
                    }}
                  >

                    <MenuItem value=""><em>Chọn sản phẩm</em></MenuItem>
                    {products.map((p) => {
                      const isSelectedElsewhere = items.some((it, idx) => idx !== index && it.productId === p.id);
                      return (
                        <MenuItem
                          key={p.id}
                          value={p.id}
                          disabled={isSelectedElsewhere}
                          sx={isSelectedElsewhere ? { color: 'gray' } : {}}
                        >
                          {`${p.code} - ${p.name} - Giá mua ${p.unitPrice.toLocaleString()}₫`}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>

                <TextField
                  label="Số lượng"
                  type="text"
                  inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                  value={item.quantity}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      handleItemChange(index, 'quantity', '');
                    } else if (/^\d+$/.test(raw)) {
                      const cleaned = raw.replace(/^0+/, '') || '0';
                      if (parseInt(cleaned, 10) <= 9999999) {
                        handleItemChange(index, 'quantity', cleaned);
                      }
                    }
                  }}
                  sx={{ width: 100 }}
                  disabled={loadingCreate}
                />

                <Typography sx={{ color: '#5D4037', minWidth: 150, textAlign: 'right' }}>
                  Tổng: {product && !isNaN(qty) ? total.toLocaleString('vi-VN') + ' ₫' : '---'}
                </Typography>

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
            );
          })
        )}

        <Button
          startIcon={<AddCircleOutlineIcon />}
          onClick={handleAddItem}
          disabled={loadingCreate || loadingProducts || !selectedSupplier}
          sx={{ mb: 3 }}
        >
          Thêm sản phẩm
        </Button>

        {/* Hiển thị tổng tiền ở đây */}
        <Typography variant="h6" align="left" sx={{ color: '#5D4037', mb: 2 }}>
          <strong>Tổng tiền (sau VAT):</strong> {totalAmount.toLocaleString('vi-VN')} ₫
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loadingCreate}
            sx={{ bgcolor: "#6D5F4B" }}
          >
            {loadingCreate
              ? <CircularProgress size={24} sx={{ color: "white" }} />
              : "Tạo đơn hàng"}
          </Button>

          <Button variant="outlined" onClick={() => setView("list")} disabled={loadingCreate}>
            Hủy
          </Button>
        </Box>

      </Box>
    );
  }


  // === Màn danh sách đơn hàng (list) ===
  return (
    <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh" }}>
      <Typography variant="h5" sx={{ mb: 3, color: "#6D5F4B" }}>
        Danh sách đơn hàng
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
          <InputLabel id="filter-status-label">Lọc theo trạng thái</InputLabel>
          <Select
            labelId="filter-status-label"
            value={filterStatus}
            label="Lọc theo trạng thái"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="ALL">Tất cả đơn</MenuItem>
            <MenuItem value="PENDING">Đang chờ</MenuItem>
            <MenuItem value="APPROVED">Đã duyệt</MenuItem>
            <MenuItem value="CANCELLED">Đã hủy</MenuItem>
            <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
          </Select>


        </FormControl>
      </Box>

      {loadingOrders ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
          <CircularProgress sx={{ color: "#6D5F4B" }} />
        </Box>
      ) : (
        // <TableContainer component={Paper}>
        //   <Table sx={{ minWidth: 650 }} aria-label="Danh sách đơn hàng">
        //     <TableHead sx={{ bgcolor: "#E9E4D4" }}>
        //       <TableRow>
        //         <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Mã đơn</TableCell>
        //         <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Tên đơn</TableCell>
        //         <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Nhà cung cấp</TableCell>
        //         <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Kho hàng</TableCell>
        //         <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Trạng thái</TableCell>
        //         <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Ngày tạo</TableCell>
        //         <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Hành động</TableCell>
        //       </TableRow>
        //     </TableHead>
        //     <TableBody>
        //       {orders.length === 0 && (
        //         <TableRow>
        //           <TableCell colSpan={7} align="center">
        //             Không có đơn hàng nào
        //           </TableCell>
        //         </TableRow>
        //       )}
        //       {orders.map((order) => (
        //         <TableRow key={order.id}>
        //           <TableCell>{order.code || order.id}</TableCell>
        //           <TableCell>{order.orderName}</TableCell>
        //           <TableCell>{order.supplierName}</TableCell>
        //           <TableCell>{order.warehouseName}</TableCell>
        //           <TableCell>{order.status}</TableCell>
        //           <TableCell>
        //             {new Date(order.createdAt).toLocaleDateString("vi-VN")}
        //           </TableCell>
        //           <TableCell>
        //             {

        //               <Link to={`/dashboard/purchase-orders/${order.id}`}>Xem chi tiết</Link>

        //             }
        //           </TableCell>
        //         </TableRow>
        //       ))}
        //     </TableBody>
        //   </Table>
        // </TableContainer>
        <TableContainer component={Paper} sx={{ maxHeight: 500, overflowY: "auto" }}>
          <Table stickyHeader sx={{ minWidth: 650 }} aria-label="Danh sách đơn hàng">
            <TableHead>
              <TableRow sx={{ bgcolor: "#E9E4D4" }}>
                {[
                  "Mã đơn",
                  "Tên đơn",
                  "Nhà cung cấp",
                  "Kho hàng",
                  "Trạng thái",
                  "Ngày tạo",
                  "Hành động",
                ].map((label, index) => (
                  <TableCell
                    key={index}
                    sx={{
                      color: "#6D5F4B",
                      fontWeight: "bold",
                      bgcolor: "#E9E4D4",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                    }}
                  >
                    {label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Không có đơn hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.code || order.id}</TableCell>
                    <TableCell>{order.orderName}</TableCell>
                    <TableCell>{order.supplierName}</TableCell>
                    <TableCell>{order.warehouseName}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </TableCell>
                    <TableCell>
                      <Link to={`/dashboard/purchase-orders/${order.id}`}>
                        Xem chi tiết
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>


      )}
    </Box>
  );
}
