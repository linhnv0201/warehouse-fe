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
      const url = `https://warehouse-production-53d6.up.railway.app/warehouse/sales-orders?status=${filterStatus}`;

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
      .get("https://warehouse-production-53d6.up.railway.app/warehouse/customers", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setCustomers(res.data.result || []))
      .catch((err) => console.error("Lỗi tải customers:", err));

    axios
      .get("https://warehouse-production-53d6.up.railway.app/warehouse/warehouses", {
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
      .get(`https://warehouse-production-53d6.up.railway.app/warehouse/inventories/warehouse/${selectedWarehouse}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setProducts(res.data.result || []);
        setItems([{ inventoryId: "", quantity: 1, saleUnitPrice: 0 }]);
      })
      .catch((err) => console.error("Lỗi tải inventories:", err))
      .finally(() => setLoadingProducts(false));
  }, [selectedWarehouse, token]);

  const handleSubmit = async () => {
    if (!orderName || !selectedCustomer || !selectedWarehouse) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    for (let item of items) {
      if (!item.inventoryId || item.quantity <= 0 || item.saleUnitPrice <= 0) {
        alert("Vui lòng chọn sản phẩm, số lượng và đơn giá hợp lệ");
        return;
      }

      if (item.quantity > item.quantityAvailable) {
        alert(
          `Sản phẩm vượt quá tồn kho. Bạn đang đặt ${item.quantity} trong khi chỉ còn ${item.quantityAvailable} sản phẩm trong kho.`
        );
        return;
      }
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
      const res = await axios.post(
        "https://warehouse-production-53d6.up.railway.app/warehouse/sales-orders",
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
    setItems((prev) => [...prev, { inventoryId: "", quantity: 0, saleUnitPrice: 0 }]);

  const handleRemoveItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        if (field === "inventoryId") {
          const selectedProduct = products.find(p => p.id === value);
          return {
            ...item,
            inventoryId: value,
            quantityAvailable: selectedProduct?.quantityAvailable || 0,
            quantity: 1
          };
        }

        let newValue = value;

        if (field === "quantity") {
          let quantity = parseInt(value, 10);
          if (isNaN(quantity) || quantity < 1) quantity = 0;
          if (item.quantityAvailable && quantity > item.quantityAvailable)
            quantity = item.quantityAvailable;
          newValue = quantity;
        }

        if (field === "saleUnitPrice") {
          let price = parseFloat(value);
          if (isNaN(price) || price < 0) price = 0;
          newValue = price;
        }

        return {
          ...item,
          [field]: newValue,
        };
      })
    );
  };


  // Giữ nguyên toàn bộ logic
  if (view === "create") {
    const calculateLineTotal = (item) => {
      const qty = Number(item.quantity);
      const price = Number(item.saleUnitPrice);
      const product = products.find(p => p.id === item.inventoryId);
      const taxRate = product?.taxRate || 0;

      if (!isNaN(qty) && !isNaN(price)) {
        return qty * price * (1 + taxRate / 100);
      }
      return 0;
    };

    const totalAmount = items.reduce((sum, item) => sum + calculateLineTotal(item), 0);

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
            <Stack key={index} direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <FormControl sx={{ flex: 2 }}>
                <InputLabel
                  id={`inventory-label-${index}`}
                  sx={{ color: "#6D5F4B" }}
                >
                  Sản phẩm
                </InputLabel>
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
                  {products.map((p) => {
                    const isSelectedElsewhere = items.some(
                      (it, idx) => idx !== index && it.inventoryId === p.id
                    );
                    const isDisabled = p.quantityAvailable <= 0 || isSelectedElsewhere;
                    return (
                      <MenuItem
                        key={p.id}
                        value={p.id}
                        disabled={isDisabled}
                        sx={isDisabled ? { color: "gray" } : {}}
                      >
                        {`${p.productCode} - ${p.productName} (Còn: ${p.quantityAvailable}) - Giá trong kho: ${p.unitPrice.toLocaleString()}₫`}

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
                  if (raw === '' || /^\d+$/.test(raw)) {
                    const cleaned = raw.replace(/^0+/, '') || '0';
                    if (cleaned === '' || parseInt(cleaned, 10) <= 9999999) {
                      handleItemChange(index, 'quantity', cleaned);
                    }
                  }
                }}
                sx={{ width: 120 }}
                disabled={loadingCreate}
              />

              <TextField
                label="Đơn giá bán"
                type="text"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                value={item.saleUnitPrice}
                onChange={(e) => {
                  const raw = e.target.value;
                  if (raw === '' || /^\d+$/.test(raw)) {
                    const cleaned = raw.replace(/^0+/, '') || '0';
                    if (cleaned === '' || parseInt(cleaned, 10) <= 999999999) {
                      handleItemChange(index, 'saleUnitPrice', cleaned);
                    }
                  }
                }}
                sx={{ width: 140 }}
                disabled={loadingCreate}
              />

              <Typography sx={{ minWidth: 150, color: "#5D4037" }}>
                Tổng: {calculateLineTotal(item).toLocaleString('vi-VN')} ₫
              </Typography>

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

        <Typography variant="h6" sx={{ color: '#5D4037', mb: 2 }}>
          <strong>Tổng tiền:</strong> {totalAmount.toLocaleString('vi-VN')} ₫
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loadingCreate || loadingProducts}
            sx={{ bgcolor: "#6D5F4B", '&:hover': { bgcolor: "#5a4d3a" } }}
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

  // === RENDER CREATE ===
  // if (view === "create") {
  //   return (
  //     <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh", maxWidth: 800, mx: "auto" }}>
  //       <Typography variant="h5" sx={{ mb: 3, color: "#6D5F4B" }}>
  //         Tạo đơn hàng bán mới
  //       </Typography>

  //       <FormControl fullWidth sx={{ mb: 2 }}>
  //         <TextField
  //           label="Tên đơn hàng"
  //           value={orderName}
  //           onChange={(e) => setOrderName(e.target.value)}
  //           disabled={loadingCreate}
  //         />
  //       </FormControl>

  //       <FormControl fullWidth sx={{ mb: 2 }}>
  //         <InputLabel id="customer-label" sx={{ color: "#6D5F4B" }}>Khách hàng</InputLabel>
  //         <Select
  //           labelId="customer-label"
  //           value={selectedCustomer}
  //           label="Khách hàng"
  //           onChange={(e) => setSelectedCustomer(e.target.value)}
  //           disabled={loadingCreate}
  //           sx={{
  //             '& .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
  //             '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
  //             '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
  //           }}
  //         >
  //           <MenuItem value=""><em>Chọn khách hàng</em></MenuItem>
  //           {customers.map((customer) => (
  //             <MenuItem key={customer.id} value={customer.id}>
  //               {customer.name}
  //             </MenuItem>
  //           ))}
  //         </Select>
  //       </FormControl>

  //       <FormControl fullWidth sx={{ mb: 2 }}>
  //         <InputLabel id="warehouse-label" sx={{ color: "#6D5F4B" }}>Kho hàng</InputLabel>
  //         <Select
  //           labelId="warehouse-label"
  //           value={selectedWarehouse}
  //           label="Kho hàng"
  //           onChange={(e) => setSelectedWarehouse(e.target.value)}
  //           disabled={loadingCreate}
  //           sx={{
  //             '& .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
  //             '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
  //             '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
  //           }}
  //         >
  //           <MenuItem value=""><em>Chọn kho hàng</em></MenuItem>
  //           {warehouses.map((wh) => (
  //             <MenuItem key={wh.id} value={wh.id}>{wh.name}</MenuItem>
  //           ))}
  //         </Select>
  //       </FormControl>

  //       <Typography variant="h6" sx={{ mt: 3, mb: 1, color: "#6D5F4B" }}>
  //         Danh sách sản phẩm
  //       </Typography>

  //       {loadingProducts ? (
  //         <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
  //           <CircularProgress sx={{ color: "#6D5F4B" }} />
  //         </Box>
  //       ) : (
  //         items.map((item, index) => (
  //           <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }} key={index}>
  //             <FormControl sx={{ flex: 2 }}>
  //               <InputLabel id={`inventory-label-${index}`} sx={{ color: "#6D5F4B" }}>Sản phẩm</InputLabel>
  //               <Select
  //                 labelId={`inventory-label-${index}`}
  //                 value={item.inventoryId}
  //                 label="Sản phẩm"
  //                 onChange={(e) => handleItemChange(index, "inventoryId", e.target.value)}
  //                 disabled={loadingCreate}
  //                 sx={{
  //                   '& .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
  //                   '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
  //                   '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: "#6D5F4B" },
  //                 }}
  //               >
  //                 <MenuItem value=""><em>Chọn sản phẩm</em></MenuItem>
  //                 {products.map((p) => {
  //                   const isSelectedElsewhere = items.some((it, idx) => idx !== index && it.inventoryId === p.id);
  //                   const isDisabled = p.quantityAvailable <= 0 || isSelectedElsewhere;

  //                   return (
  //                     <MenuItem
  //                       key={p.id}
  //                       value={p.id}
  //                       disabled={isDisabled}
  //                       sx={isDisabled ? { color: "gray" } : {}}
  //                     >
  //                       {`${p.productCode} - ${p.productName} (Còn: ${p.quantityAvailable}) - Giá mua: ${p.unitPrice.toLocaleString()}đ`}
  //                     </MenuItem>
  //                   );
  //                 })}

  //               </Select>
  //             </FormControl>

  //             <TextField
  //               label="Số lượng"
  //               type="text"
  //               inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
  //               value={item.quantity}
  //               onChange={(e) => {
  //                 const raw = e.target.value;

  //                 if (raw === '') {
  //                   handleItemChange(index, 'quantity', '');
  //                 } else if (/^\d+$/.test(raw)) {
  //                   const cleaned = raw.replace(/^0+/, '') || '0';
  //                   if (parseInt(cleaned, 10) <= 9999999) {
  //                     handleItemChange(index, 'quantity', cleaned);
  //                   }
  //                 }
  //               }}
  //               sx={{ width: 100 }}
  //               disabled={loadingCreate}
  //             />



  //             <TextField
  //               label="Đơn giá bán"
  //               type="text"
  //               inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
  //               value={item.saleUnitPrice}
  //               onChange={(e) => {
  //                 const raw = e.target.value;

  //                 if (raw === '' || /^\d+$/.test(raw)) {
  //                   const cleaned = raw.replace(/^0+/, '') || '0';
  //                   if (cleaned === '' || parseInt(cleaned, 10) <= 999999999) {
  //                     handleItemChange(index, 'saleUnitPrice', raw); // 👈 dùng raw
  //                   }
  //                 }
  //               }}
  //               sx={{ width: 140 }}
  //               disabled={loadingCreate}
  //             />



  //             {items.length > 1 && (
  //               <IconButton
  //                 color="error"
  //                 onClick={() => handleRemoveItem(index)}
  //                 disabled={loadingCreate}
  //               >
  //                 <RemoveCircleOutlineIcon />
  //               </IconButton>
  //             )}
  //           </Stack>
  //         ))
  //       )}

  //       <Button
  //         startIcon={<AddCircleOutlineIcon />}
  //         onClick={handleAddItem}
  //         disabled={loadingCreate || loadingProducts || !selectedWarehouse}
  //         sx={{ mb: 3, color: "#6D5F4B" }}
  //       >
  //         Thêm sản phẩm
  //       </Button>

  //       <Box sx={{ mt: 3 }}>
  //         <Button
  //           variant="contained"
  //           onClick={handleSubmit}
  //           disabled={loadingCreate || loadingProducts}
  //           sx={{ mr: 2, bgcolor: "#6D5F4B", '&:hover': { bgcolor: "#5a4d3a" } }}
  //         >
  //           {loadingCreate ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Tạo đơn hàng"}
  //         </Button>

  //         <Button
  //           variant="outlined"
  //           onClick={() => setView("list")}
  //           disabled={loadingCreate || loadingProducts}
  //         >
  //           Hủy
  //         </Button>
  //       </Box>

  //     </Box>
  //   );
  // }

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
            <MenuItem value="PENDING">Đơn đang chờ</MenuItem>
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
                <TableCell sx={{ color: "#6D5F4B", fontWeight: "bold" }}>Ngày tạo</TableCell>
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
                    {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
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