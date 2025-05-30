// import React, { useEffect, useState } from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
//   CircularProgress,
//   IconButton,
//   Stack,
// } from "@mui/material";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
// import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

// export default function CreatePurchaseOrder() {
//   const [warehouses, setWarehouses] = useState([]);
//   const [suppliers, setSuppliers] = useState([]);
//   const [products, setProducts] = useState([]);
  
//   const [selectedWarehouse, setSelectedWarehouse] = useState("");
//   const [selectedSupplier, setSelectedSupplier] = useState("");
//   const [orderName, setOrderName] = useState("");
//   const [items, setItems] = useState([{ productId: "", quantity: 1 }]);

//   const [loading, setLoading] = useState(false);
//   const [loadingProducts, setLoadingProducts] = useState(false);

//   const token = localStorage.getItem("token");
//   const navigate = useNavigate();

//   // Lấy danh sách kho
//   useEffect(() => {
//     axios
//       .get("http://localhost:8080/warehouse/warehouses", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setWarehouses(res.data.result || []))
//       .catch((err) => console.error("Lỗi tải warehouses:", err));
//   }, []);

//   // Lấy danh sách nhà cung cấp
//   useEffect(() => {
//     axios
//       .get("http://localhost:8080/warehouse/suppliers", {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => setSuppliers(res.data.result || []))
//       .catch((err) => console.error("Lỗi tải suppliers:", err));
//   }, []);

//   // Khi chọn supplier thì load products theo supplierId
//   useEffect(() => {
//     if (!selectedSupplier) {
//       setProducts([]);
//       setItems([{ productId: "", quantity: 1 }]);
//       return;
//     }
//     setLoadingProducts(true);
//     axios
//       .get(`http://localhost:8080/warehouse/products/supplier/${selectedSupplier}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then((res) => {
//         setProducts(res.data.result || []);
//         // Reset items mỗi lần đổi nhà cung cấp
//         setItems([{ productId: "", quantity: 1 }]);
//       })
//       .catch((err) => console.error("Lỗi tải products:", err))
//       .finally(() => setLoadingProducts(false));
//   }, [selectedSupplier]);

//   const handleAddItem = () => {
//     setItems((prev) => [...prev, { productId: "", quantity: 1 }]);
//   };

//   const handleRemoveItem = (index) => {
//     setItems((prev) => prev.filter((_, i) => i !== index));
//   };

//   const handleItemChange = (index, field, value) => {
//     setItems((prev) =>
//       prev.map((item, i) =>
//         i === index ? { ...item, [field]: field === "quantity" ? Number(value) : value } : item
//       )
//     );
//   };

//   const handleSubmit = async () => {
//     if (!orderName || !selectedSupplier || !selectedWarehouse) {
//       alert("Vui lòng điền đầy đủ thông tin");
//       return;
//     }
//     if (items.some((item) => !item.productId || item.quantity <= 0)) {
//       alert("Vui lòng chọn sản phẩm và số lượng hợp lệ");
//       return;
//     }

//     const payload = {
//       supplierId: Number(selectedSupplier),
//       warehouseId: Number(selectedWarehouse),
//       orderName,
//       items: items.map(({ productId, quantity }) => ({
//         productId: Number(productId),
//         quantity,
//       })),
//     };

//     setLoading(true);
//     try {
//       await axios.post("http://localhost:8080/warehouse/purchase-orders", payload, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       alert("Tạo đơn hàng thành công!");
//       navigate("/purchase-orders");
//     } catch (error) {
//       console.error("Lỗi tạo đơn hàng:", error);
//       alert("Tạo đơn hàng thất bại");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh", maxWidth: 700, mx: "auto" }}>
//       <Typography variant="h5" sx={{ mb: 3, color: "#6D5F4B" }}>
//         Tạo đơn hàng mới
//       </Typography>

//       <FormControl fullWidth sx={{ mb: 2 }}>
//         <TextField
//           label="Tên đơn hàng"
//           value={orderName}
//           onChange={(e) => setOrderName(e.target.value)}
//           disabled={loading}
//         />
//       </FormControl>

//       <FormControl fullWidth sx={{ mb: 2 }}>
//         <InputLabel id="supplier-label">Nhà cung cấp</InputLabel>
//         <Select
//           labelId="supplier-label"
//           value={selectedSupplier}
//           label="Nhà cung cấp"
//           onChange={(e) => setSelectedSupplier(e.target.value)}
//           disabled={loading}
//         >
//           <MenuItem value="">
//             <em>Chọn nhà cung cấp</em>
//           </MenuItem>
//           {suppliers.map((sup) => (
//             <MenuItem key={sup.id} value={sup.id}>
//               {sup.name}
//             </MenuItem>
//           ))}
//         </Select>
//       </FormControl>

//       <FormControl fullWidth sx={{ mb: 2 }}>
//         <InputLabel id="warehouse-label">Kho hàng</InputLabel>
//         <Select
//           labelId="warehouse-label"
//           value={selectedWarehouse}
//           label="Kho hàng"
//           onChange={(e) => setSelectedWarehouse(e.target.value)}
//           disabled={loading}
//         >
//           <MenuItem value="">
//             <em>Chọn kho hàng</em>
//           </MenuItem>
//           {warehouses.map((wh) => (
//             <MenuItem key={wh.id} value={wh.id}>
//               {wh.name}
//             </MenuItem>
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
//           <Stack
//             direction="row"
//             spacing={2}
//             alignItems="center"
//             sx={{ mb: 2 }}
//             key={index}
//           >
//             <FormControl sx={{ flex: 1 }}>
//               <InputLabel id={`product-label-${index}`}>Sản phẩm</InputLabel>
//               <Select
//                 labelId={`product-label-${index}`}
//                 value={item.productId}
//                 label="Sản phẩm"
//                 onChange={(e) => handleItemChange(index, "productId", e.target.value)}
//                 disabled={loading}
//               >
//                 <MenuItem value="">
//                   <em>Chọn sản phẩm</em>
//                 </MenuItem>
//                 {products.map((p) => (
//                   <MenuItem key={p.id} value={p.id}>
//                     {p.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>

//             <TextField
//               label="Số lượng"
//               type="number"
//               inputProps={{ min: 1 }}
//               value={item.quantity}
//               onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
//               sx={{ width: 100 }}
//               disabled={loading}
//             />

//             {items.length > 1 && (
//               <IconButton
//                 color="error"
//                 onClick={() => handleRemoveItem(index)}
//                 disabled={loading}
//                 aria-label="Xóa sản phẩm"
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
//         disabled={loading || loadingProducts || !selectedSupplier}
//         sx={{ mb: 3 }}
//       >
//         Thêm sản phẩm
//       </Button>

//       <Box sx={{ display: "flex", gap: 2 }}>
//         <Button
//           variant="contained"
//           sx={{ bgcolor: "#6D5F4B", textTransform: "none" }}
//           onClick={handleSubmit}
//           disabled={loading}
//         >
//           {loading ? "Đang tạo..." : "Tạo đơn"}
//         </Button>

//         <Button
//           variant="outlined"
//           sx={{ textTransform: "none" }}
//           onClick={() => navigate("/purchase-orders")}
//           disabled={loading}
//         >
//           Hủy
//         </Button>
//       </Box>
//     </Box>
//   );
// }
