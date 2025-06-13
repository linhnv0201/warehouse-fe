import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box, Typography, CircularProgress, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Grid, Tabs, Tab, Divider, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl,
  InputLabel, MenuItem, Select,
} from "@mui/material";
import axios from "axios";

export default function SaleOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(0);

  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loadingDO, setLoadingDO] = useState(false);
  const [openDODialog, setOpenDODialog] = useState(false);
  const [selectedDO, setSelectedDO] = useState(null);

  const [payments, setPayments] = useState([]);
  const [openPaymentDialog, setOpenPaymentDialog] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [paymentNote, setPaymentNote] = useState("");
  const [loadingPayments, setLoadingPayments] = useState(false);

  const paymentMethods = [
    { value: "CASH", label: "Tiền mặt" },
    { value: "BANK_TRANSFER", label: "Chuyển khoản" },
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/warehouse/sales-orders/${orderId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrder(res.data.result);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [orderId, token]);

  useEffect(() => {
    if (tab === 1) fetchDO();
  }, [tab]);

  const fetchDO = async () => {
    setLoadingDO(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/warehouse/delivery-orders/by-sales-order/${orderId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDeliveryOrders(res.data.result || []);
    } catch {
      setDeliveryOrders([]);
    } finally {
      setLoadingDO(false);
    }
  };

  const handleApprove = async () => {
    try {
      await axios.patch(
        `http://localhost:8080/warehouse/sales-orders/${orderId}/status?status=APPROVED`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder({ ...order, status: "APPROVED" });
      alert("Đơn bán đã được duyệt!");
    } catch {
      alert("Duyệt đơn thất bại");
    }
  };

  const handleCancel = async () => {
    try {
      await axios.patch(
        `http://localhost:8080/warehouse/sales-orders/${orderId}/status?status=CANCELLED`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrder({ ...order, status: "CANCELLED" });
      alert("Đơn bán đã bị hủy!");
    } catch {
      alert("Hủy đơn thất bại");
    }
  };

  const fetchPayments = async (doId) => {
    setLoadingPayments(true);
    try {
      const res = await axios.get(
        `http://localhost:8080/warehouse/payments/by-delivery-order/${doId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPayments(res.data.result || []);
    } catch {
      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  const openPaymentModal = (doObj) => {
    setSelectedDO(doObj);
    fetchPayments(doObj.id);
    setOpenPaymentDialog(true);
  };

  const handleCreatePayment = async () => {
    const payload = {
      amount: Number(paymentAmount),
      paymentMethod,
      note: paymentNote,
    };
    try {
      await axios.post(
        `http://localhost:8080/warehouse/payments/delivery/${selectedDO.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPayments(selectedDO.id);
      alert("Thanh toán thành công");
    } catch {
      alert("Thanh toán thất bại");
    }
  };

  const handleUpdateDO = async () => {
    try {
      const payload = {
        items: selectedDO.items.map(i => ({
          saleOrderItemId: i.saleOrderItemId,
          quantity: i.quantity
        }))
      };
      await axios.patch(
        `http://localhost:8080/warehouse/delivery-orders/${selectedDO.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Cập nhật phiếu xuất thành công!");
      fetchDO();
      setOpenDODialog(false);
    } catch {
      alert("Cập nhật phiếu xuất thất bại");
    }
  };

  if (loading) return <Box sx={{ mt:5, display:"flex",justifyContent:"center" }}><CircularProgress sx={{ color:"#5D4037" }} /></Box>;
  if (!order) return <Typography align="center" mt={5} sx={{ color:"#5D4037" }}>Không tìm thấy đơn bán.</Typography>;

  return (
    <Paper sx={{ p:4, mt:4, bgcolor:"#EFEBE9" }}>
      <Button variant="outlined" sx={{ mb:2, color:"#5D4037", borderColor:"#5D4037" }}
        onClick={() => navigate(-1)}>← Quay lại</Button>
      <Typography variant="h6" sx={{ color:"#5D4037" }}>
        Chi tiết đơn bán: <strong>{order.code}</strong>
      </Typography>

      <Tabs 
        value={tab} onChange={(_,v)=>setTab(v)}
        sx={{ mb:2, "& .MuiTab-root":{color:"#5D4037"}, "& .Mui-selected":{color:"#4E342E"} }}
      >
        <Tab label="Tổng quan"/>
        <Tab label="Phiếu xuất"/>
      </Tabs>

      {tab === 0 && (
        <>
          <Grid container spacing={2} sx={{ mb:2, color:"#5D4037" }}>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Mã đơn:</strong> {order.code}</Typography>
              <Typography><strong>Trạng thái:</strong> {order.status}</Typography>
              <Typography><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleString()}</Typography>
              <Typography><strong>Kho:</strong> {order.warehouseName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Khách hàng:</strong> {order.customerName}</Typography>
              <Typography><strong>Người tạo:</strong> {order.createdBy}</Typography>
              <Typography><strong>Tên đơn:</strong> {order.saleName}</Typography>
            </Grid>
            {order.status === "PENDING" && (
              <Grid item xs={12} sx={{ textAlign: "right" }}>
                <Button variant="contained" color="success" onClick={handleApprove} sx={{ mr: 2 }}>
                  Duyệt
                </Button>
                <Button variant="contained" color="error" onClick={handleCancel}>
                  Hủy
                </Button>
              </Grid>
            )}
          </Grid>
          <Divider sx={{ mb:2 }} />
          <TableContainer component={Paper} sx={{ bgcolor:"#D7CCC8" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#A1887F" }}>
                <TableCell sx={{ color: "#fff" }}>STT</TableCell>
                <TableCell sx={{ color: "#fff" }}>Mã sản phẩm</TableCell>
                <TableCell sx={{ color: "#fff" }}>Tên sản phẩm</TableCell>
                <TableCell sx={{ color: "#fff" }}>ĐVT</TableCell>
                <TableCell align="right" sx={{ color: "#fff" }}>SL</TableCell>
                <TableCell align="right" sx={{ color: "#fff" }}>Đơn giá bán</TableCell>
                <TableCell align="right" sx={{ color: "#fff" }}>Thuế VAT (%)</TableCell>
                <TableCell align="right" sx={{ color: "#fff" }}>Thành tiền</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.items.map((it, i) => {
                const unit = it.unit || "Cái";
                const vat = it.taxRate || 0;
                const price = it.saleUnitPrice || 0;
                const qty = it.quantity || 0;
                const total = qty * price * (1 + vat / 100);

                return (
                  <TableRow key={i} sx={{ bgcolor: "#efebe9" }}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{it.productCode}</TableCell>
                    <TableCell>{it.productName}</TableCell>
                    <TableCell>{unit}</TableCell>
                    <TableCell align="right">{qty}</TableCell>
                    <TableCell align="right">{price.toLocaleString()} ₫</TableCell>
                    <TableCell align="right">{vat} %</TableCell>
                    <TableCell align="right">{total.toLocaleString()} ₫</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </TableContainer>
        </>
      )}

      {tab === 1 && (
        <Box>
          {loadingDO ? <CircularProgress /> : (
            <TableContainer component={Paper} sx={{ bgcolor:"#D7CCC8" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor:"#A1887F" }}>
                    <TableCell sx={{ color:"#fff" }}>Mã DO</TableCell>
                    <TableCell sx={{ color:"#fff" }}>Kho</TableCell>
                    <TableCell sx={{ color:"#fff" }}>Người tạo</TableCell>
                    <TableCell sx={{ color:"#fff" }}>Chi tiết</TableCell>
                    <TableCell sx={{ color:"#fff" }}>Thanh toán</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {deliveryOrders.map(doObj => (
                    <TableRow key={doObj.id} sx={{ bgcolor: '#efebe9' }}>
                      <TableCell>{doObj.code}</TableCell>
                      <TableCell>{doObj.warehouseName}</TableCell>
                      <TableCell>{doObj.createdBy}</TableCell>
                      <TableCell>
                        <Button onClick={() => {
                          setSelectedDO(doObj);
                          setOpenDODialog(true);
                        }}>Xem</Button>
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => openPaymentModal(doObj)}>Thanh toán</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Dialog DO */}
      <Dialog open={openDODialog} onClose={() => setOpenDODialog(false)} fullWidth>
        <DialogTitle>Chi tiết phiếu xuất - {selectedDO?.code}</DialogTitle>
        <DialogContent>
          <Table>
            <TableBody>
              {selectedDO?.items.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell align="right">
                    <TextField
                      value={item.quantity}
                      type="number"
                      inputProps={{ min: 1 }}
                      onChange={(e) => {
                        const q = Number(e.target.value);
                        setSelectedDO(prev => ({
                          ...prev,
                          items: prev.items.map((it, i) => i === idx ? { ...it, quantity: q } : it)
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDODialog(false)}>Đóng</Button>
          <Button onClick={handleUpdateDO} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Payment */}
      <Dialog open={openPaymentDialog} onClose={() => setOpenPaymentDialog(false)} fullWidth>
        <DialogTitle>Thanh toán cho {selectedDO?.code}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth label="Số tiền" type="number"
            value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Phương thức</InputLabel>
            <Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              {paymentMethods.map(p => (
                <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth label="Ghi chú" value={paymentNote}
            onChange={e => setPaymentNote(e.target.value)}
            multiline rows={2} margin="normal"
          />
          {loadingPayments ? <CircularProgress size={20} /> : payments.map(p => (
            <Typography key={p.id}>{p.code} - {p.amount.toLocaleString()} ₫</Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPaymentDialog(false)}>Đóng</Button>
          <Button variant="contained" onClick={handleCreatePayment}>Thanh toán</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
