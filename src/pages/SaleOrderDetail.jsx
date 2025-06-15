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

  // State & Effect để lấy danh sách delivery orders
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [loadingDO, setLoadingDO] = useState(false);
  const [selectedDO, setSelectedDO] = useState(null);
  
  //Của tạo phiếu xuất
  const [orderDetails, setOrderDetails] = useState(null);
  const [openCreateDeliveryOrderDialog, setOpenCreateDeliveryOrderDialog] = useState(false);
  const [deliveryQuantities, setDeliveryQuantities] = useState([]);

  //Chi tiết phiếu xuất
  const [selectedDeliveryOrder, setSelectedDeliveryOrder] = useState(null);
  const [openDetailDODialog, setOpenDetailDODialog] = useState(false);

  //Hóa đơn
  const [openInvoiceDialog, setOpenInvoiceDialog] = useState(false);
  const [saleInvoice, setSaleInvoice] = useState([]);
  const [loadingSaleInvoice, setLoadingSaleInvoice] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null); 

  //Của payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [openCreatePaymentDialog, setOpenCreatePaymentDialog] = useState(false);
  const paymentMethods = [
        { value: 'CASH', label: 'Tiền mặt' },
        { value: 'BANK_TRANSFER', label: 'Chuyển khoản' },
    ];
  const [payments, setPayments] = useState([]);
  const [openPaymentsDialog, setOpenPaymentsDialog] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);




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

  // Xử lý tạo phiếu xuất
const handleOpenCreateDeliveryOrder = async (salesOrderId) => {
  try {
    const res = await axios.get(
      `http://localhost:8080/warehouse/sales-orders/${salesOrderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (res.data.code === 0) {
      setOrderDetails(res.data.result);
      setDeliveryQuantities([]); // reset khi mở
      setOpenCreateDeliveryOrderDialog(true);
    } else alert('Không thể lấy thông tin đơn bán.');
  } catch (err) {
    console.error(err);
    alert('Lỗi khi lấy thông tin đơn bán.');
  }
};

const handleCreateDeliveryOrder = async (salesOrderId) => {
  const itemsToDeliver = deliveryQuantities.map(item => ({
    saleOrderItemId: item.id,
    quantity: parseInt(item.quantity, 10) || 0
  }));

  const deliveryOrderData = { items: itemsToDeliver };

  try {
    const res = await axios.post(
      `http://localhost:8080/warehouse/delivery-orders/${salesOrderId}`,
      deliveryOrderData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const doResp = res.data.result;

    // Thêm phiếu xuất mới vào danh sách
    setDeliveryOrders(prev => [...prev, doResp]);
    setOpenCreateDeliveryOrderDialog(false);
    alert("Tạo phiếu xuất thành công!");
  } catch (error) {
    console.error("Lỗi tạo phiếu xuất:", error);
    alert("Tạo phiếu xuất thất bại.");
  }
};

//Kết thúc xử lý tạo phiếu xuất

//Chi tiết phiếu xuất
    const handleOpenDetailDO = async (deliveryOrderId) => {
      try {
        const response = await axios.get(`http://localhost:8080/warehouse/delivery-orders/${deliveryOrderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.data.code === 0) {
          setSelectedDeliveryOrder(response.data.result);
          setOpenDetailDODialog(true);
        } else {
          alert('Lấy chi tiết phiếu xuất kho thất bại');
        }
      } catch (error) {
        console.error(error);
        alert('Lỗi khi gọi API lấy chi tiết phiếu xuất kho');
      }
    };

    const handleCloseDetailDO = () => {
      setOpenDetailDODialog(false);
      setSelectedDeliveryOrder(null);
    };

//kết thúc chi tiết phiếu xuất

//Xử lý xem hóa đơn
const fetchSaleInvoice = async (deliveryOrderId) => {
  setLoadingSaleInvoice(true);
  try {
    const res = await axios.get(
      `http://localhost:8080/warehouse/sale-invoices/by-delivery-order/${deliveryOrderId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (res.data.code === 0 && res.data.result) {
      setSaleInvoice(res.data.result); // chỉ có 1 hóa đơn
    } else {
      setSaleInvoice(null);
      alert("Không có hóa đơn bán cho phiếu xuất này.");
    }
  } catch (error) {
    console.error(error);
    setSaleInvoice(null);
    alert("Lỗi khi lấy hóa đơn bán.");
  } finally {
    setLoadingSaleInvoice(false);
  }
};

const handleOpenInvoice = async (deliveryOrderId) => {
  await fetchSaleInvoice(deliveryOrderId);
  setOpenInvoiceDialog(true);
};

const handleCloseInvoice = () => {
  setOpenInvoiceDialog(false);
  setSaleInvoice(null);
};



//Kết thúc hóa đơn  


//Thanh toán
const handleOpenPayments = () => {
  setPaymentAmount('');
  setPaymentMethod('CASH');
  setPaymentNote('');
  setPaymentError('');
  setOpenCreatePaymentDialog(true);
};
const handleCreatePayment = async () => {
  if (!selectedInvoice) return;

  const remaining = selectedInvoice.remainingAmount;
  if (paymentAmount <= 0 || paymentAmount > remaining) {
    setPaymentError(`Nhập phải >0 và ≤ ${remaining.toLocaleString()}`);
    return;
  }

  try {
    const res = await axios.post(
      `http://localhost:8080/warehouse/sale-invoice-payments/${selectedInvoice.id}`,
      { amount: paymentAmount, paymentMethod, note: paymentNote },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // Nếu backend trả về code 0, coi là thành công
    if (res.data.code === 0) {
      alert('Thanh toán thành công!');
      setOpenCreatePaymentDialog(false);

      // Cập nhật lại saleInvoice (hiển thị số còn nợ)
      await fetchSaleInvoice(selectedInvoice.deliveryOrderId); 

      // (Tùy chọn) Cập nhật luôn list payments cho dialog
      await fetchPaymentsByInvoice(selectedInvoice.id);
    } else {
      alert(`Thanh toán thất bại: ${res.data.message || 'Không xác định'}`);
    }
  } catch (e) {
    console.error(e);
    const msg = e.response?.data?.message || e.message;
    alert(`Thanh toán thất bại: ${msg}`);
  }
};


//Kết thúc thanh toán

//Lấy list thanh toán
const fetchPaymentsByInvoice = async (invoiceId) => {
  setLoadingPayments(true);
  try {
    const res = await axios.get(
      `http://localhost:8080/warehouse/sale-invoice-payments/${invoiceId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setPayments(res.data || []);
  } catch (e) {
    console.error(e);
    alert('Lỗi khi lấy danh sách thanh toán');
    setPayments([]);
  } finally {
    setLoadingPayments(false);
  }
};
const handleOpenPaymentsDialogSO = async (deliveryOrderId) => {
  await fetchSaleInvoice(deliveryOrderId);
  if (!saleInvoice?.id) {
    alert('Chưa có hóa đơn bán cho phiếu xuất này.');
    return;
  }
  await fetchPaymentsByInvoice(saleInvoice.id);
  setOpenPaymentsDialog(true);
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
                <TableCell align="right" sx={{ color: "#fff" }}>SL chưa nhập</TableCell>
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
                const remaining = it.remainingQuantity ?? qty; // fallback nếu chưa có
                const total = qty * price * (1 + vat / 100);

                return (
                  <TableRow key={i} sx={{ bgcolor: "#efebe9" }}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{it.productCode}</TableCell>
                    <TableCell>{it.productName}</TableCell>
                    <TableCell>{unit}</TableCell>
                    <TableCell align="right">{qty}</TableCell>
                    <TableCell align="right">{remaining}</TableCell> {/* 👈 mới thêm */}            
                    <TableCell align="right">{price.toLocaleString()} ₫</TableCell>
                    <TableCell align="right">{vat} %</TableCell>
                    <TableCell align="right">{total.toLocaleString()} ₫</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </TableContainer>

          <Box sx={{ mt: 1, textAlign: 'right' }}>
            <Typography variant="subtitle1" sx={{ color: '#5D4037' }}>
              <strong>Tổng đơn (sau VAT):</strong>{' '}
              {order.totalPrice?.toLocaleString('vi-VN')} ₫
            </Typography>
          </Box>

        </>
      )}

      {tab === 1 && (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ color: '#5D4037' }}>Danh sách phiếu xuất</Typography>

          {order.status === 'APPROVED' ? (
            <Button
              variant="contained"
              onClick={() => handleOpenCreateDeliveryOrder(orderId)} // Hàm mở dialog tạo phiếu xuất
              sx={{ bgcolor: '#5D4037', ':hover': { bgcolor: '#4e342e' } }}
            >
              + Tạo phiếu xuất
            </Button>
          ) : (
            <Typography sx={{ color: '#5D4037', fontStyle: 'italic', mt: 1 }}>
              * Chỉ có thể tạo phiếu xuất khi đơn hàng ở trạng thái được duyệt (Approved).
            </Typography>
          )}
        </Box>

        {loadingDO ? (
          <CircularProgress sx={{ color: '#5D4037' }} />
        ) : deliveryOrders.length === 0 ? (
          <Typography>Chưa có phiếu xuất nào.</Typography>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: '#d7ccc8' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#a1887f' }}>
                  <TableCell sx={{ color: '#fff' }}>Mã phiếu xuất</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Ngày tạo</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Người tạo</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Chi tiết</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Hóa đơn bán</TableCell>
                  <TableCell sx={{ color: '#fff' }}>Thanh toán</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryOrders.map((doObj) => (
                  <TableRow key={doObj.id} sx={{ bgcolor: '#efebe9' }}>
                    <TableCell>{doObj.code}</TableCell>
                    <TableCell>{new Date(doObj.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{doObj.createdBy || '---'}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleOpenDetailDO(doObj.id)} sx={{ color: '#5D4037' }}>
                        Xem chi tiết
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenInvoice(doObj.id)}
                        sx={{ color: '#5D4037', borderColor: '#5D4037' }}
                      >
                        Xem hóa đơn
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenPaymentsDialogSO(doObj.id)}
                        sx={{ color: '#5D4037', borderColor: '#5D4037' }}
                      >
                        Danh sách thanh toán
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      )}

      {/* Dialog tạo phiếu xuất */}
<Dialog open={openCreateDeliveryOrderDialog} onClose={() => setOpenCreateDeliveryOrderDialog(false)} fullWidth maxWidth="md">
  <DialogTitle>Tạo phiếu xuất kho</DialogTitle>
  <DialogContent dividers>
    {orderDetails && (
      <Box mb={2}>
        <Typography><strong>Mã đơn:</strong> {orderDetails.code}</Typography>
        <Typography><strong>Khách hàng:</strong> {orderDetails.customerName}</Typography>
        <Typography><strong>Kho:</strong> {orderDetails.warehouseName}</Typography>
      </Box>
    )}
    {orderDetails?.items?.map(it => (
      <Box key={it.id} sx={{ my: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography><strong>{it.productName}</strong> (còn {it.remainingQuantity})</Typography>
        </Box>
        <TextField
          label="Số lượng xuất"
          type="number"
          value={deliveryQuantities.find(q => q.id === it.id)?.quantity || ''}
          onChange={e => {
            const val = e.target.value;
            const qty = parseInt(val, 10);
            if (val === '' || (/^\d+$/.test(val) && qty <= it.remainingQuantity)) {
              const updated = deliveryQuantities.filter(q => q.id !== it.id);
              if (val !== '' && qty > 0) updated.push({ id: it.id, quantity: val });
              setDeliveryQuantities(updated);
            }
          }}
          inputProps={{ min: 0, max: it.remainingQuantity }}
          size="small"
          sx={{ width: 120 }}
        />
      </Box>
    ))}
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenCreateDeliveryOrderDialog(false)} color="secondary">
      Hủy
    </Button>
    <Button variant="contained" onClick={() => handleCreateDeliveryOrder(orderDetails.id)}>
      Tạo phiếu xuất
    </Button>
  </DialogActions>
</Dialog>

 {/* Dialog chi tiết phiếu xuất */}
<Dialog open={openDetailDODialog} onClose={handleCloseDetailDO} fullWidth maxWidth="md">
  <DialogTitle>Chi tiết phiếu xuất: {selectedDeliveryOrder?.code}</DialogTitle>
  <DialogContent>
    <Typography><strong>Mã phiếu:</strong> {selectedDeliveryOrder?.code}</Typography>
    <Typography><strong>Ngày tạo:</strong> {new Date(selectedDeliveryOrder?.createdAt).toLocaleString()}</Typography>
    <Typography><strong>Người tạo:</strong> {selectedDeliveryOrder?.createdBy}</Typography>

    <Divider sx={{ my: 2 }} />

      <TableContainer component={Paper} sx={{ maxWidth: '80vw', mx: 'auto', mt: 2 }}>
        <Table size="small" aria-label="Danh sách sản phẩm phiếu xuất">
          <TableHead>
            <TableRow sx={{ bgcolor: '#f0f0f0' }}>
              <TableCell><strong>#</strong></TableCell>
              <TableCell><strong>Sản phẩm</strong></TableCell>
              <TableCell align="right"><strong>Số lượng</strong></TableCell>
              <TableCell align="right"><strong>Đơn giá</strong></TableCell>
              <TableCell align="right"><strong>Thuế VAT (%)</strong></TableCell>
              <TableCell align="right"><strong>Thành tiền</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {selectedDeliveryOrder?.items?.map((it, idx) => (
              <TableRow key={it.id} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>
                  <Typography variant="body1" fontWeight="bold">
                    {it.productName}
                  </Typography>
                </TableCell>
                <TableCell align="right">{it.quantity}</TableCell>
                <TableCell align="right">
                  {Number(it.unitPrice).toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                  })}
                </TableCell>
                <TableCell align="right">{it.taxRate}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  {Number(it.totalPrice).toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                    minimumFractionDigits: 0,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

  </DialogContent>
  <DialogActions sx={{ justifyContent: 'flex-end' }}>
    <Typography variant="subtitle1" sx={{ mr: 2 }}>
      <strong>Tổng tiền:</strong>{' '}
      {selectedDeliveryOrder?.totalAmount?.toLocaleString('vi-VN')} ₫
    </Typography>
    <Button onClick={handleCloseDetailDO}>Đóng</Button>
  </DialogActions>
</Dialog>

{/* Dialog xem hóa đơn */}
<Dialog
  open={openInvoiceDialog}
  onClose={handleCloseInvoice}
  fullWidth
  maxWidth="md"
>
  <DialogTitle sx={{ backgroundColor: '#6B4C3B', color: '#fff' }}>
    Hóa đơn bán
  </DialogTitle>

  <DialogContent sx={{ backgroundColor: '#E6D4C3', paddingBottom: 2 }}>
    {loadingSaleInvoice ? (
      <CircularProgress sx={{ color: '#A67C52' }} />
    ) : !saleInvoice ? (
      <Typography sx={{ color: '#6B4C3B', fontStyle: 'italic' }}>
        Không có hóa đơn bán cho phiếu xuất này.
      </Typography>
    ) : (
      <TableContainer component={Paper} sx={{ bgcolor: '#F8EFE8' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#8C6744' }}>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Mã hóa đơn</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Ngày tạo</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Khách hàng</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Phiếu xuất</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Tổng tiền</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Còn thiếu</TableCell>              
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Trạng thái</TableCell>
              <TableCell sx={{ color: '#333', fontWeight: 'bold' }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ bgcolor: '#F1E4DA' }}>
              <TableCell>{saleInvoice.code}</TableCell>
              <TableCell>{new Date(saleInvoice.createdAt).toLocaleString()}</TableCell>
              <TableCell>{saleInvoice.customerName}</TableCell>
              <TableCell>{saleInvoice.deliveryOrderCode}</TableCell>
              <TableCell>
                {Number(saleInvoice.totalAmount).toLocaleString('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                })}
              </TableCell>
              <TableCell>
                  {Number(saleInvoice.remainingAmount).toLocaleString('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  })}
              </TableCell>              
              <TableCell>{saleInvoice.status}</TableCell>
              <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ backgroundColor: '#6B4C3B', color: '#fff' }}
                    onClick={() => { setSelectedInvoice(saleInvoice); handleOpenPayments(); }}
                    disabled={saleInvoice.status === 'PAID'}
                  >
                    Thanh toán
                  </Button>
              </TableCell>              
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DialogContent>

  <DialogActions sx={{ backgroundColor: '#F3E6DC', padding: 2 }}>
    <Button onClick={handleCloseInvoice} sx={{ color: '#6B4C3B' }}>
      Đóng
    </Button>
  </DialogActions>
</Dialog>

{/* tạo thanh toán */}
<Dialog open={openCreatePaymentDialog} onClose={() => setOpenCreatePaymentDialog(false)} fullWidth maxWidth="sm">
  <DialogTitle sx={{ bgcolor: '#6B4C3B', color: '#fff' }}>Thanh toán hóa đơn</DialogTitle>
  <DialogContent sx={{ bgcolor: '#F9F1EB' }}>
    {selectedInvoice && (
      <>
        <Typography><strong>Mã hóa đơn:</strong> {selectedInvoice.code}</Typography>
        <Typography><strong>Tổng tiền:</strong> {selectedInvoice.totalAmount.toLocaleString('vi-VN')} ₫</Typography>
        <Typography><strong>Còn nợ:</strong> {(selectedInvoice.remainingAmount).toLocaleString('vi-VN')} ₫</Typography>
      </>
    )}
    <TextField
      fullWidth
      label="Số tiền thanh toán"
      type="number"
      value={paymentAmount}
      onChange={e => {
        const val = Number(e.target.value);
        const max = selectedInvoice?.remainingAmount || 0;
        setPaymentError(val > max ? `Không vượt quá ${max.toLocaleString()}` : '');
        setPaymentAmount(val);
      }}
      error={!!paymentError}
      helperText={paymentError}
      margin="normal"
    />
    <FormControl fullWidth margin="normal">
      <InputLabel>Phương thức</InputLabel>
      <Select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
        <MenuItem value="CASH">Tiền mặt</MenuItem>
        <MenuItem value="BANK_TRANSFER">Chuyển khoản</MenuItem>
      </Select>
    </FormControl>
    <TextField
      fullWidth label="Ghi chú"
      value={paymentNote}
      onChange={e => setPaymentNote(e.target.value)}
      multiline rows={2}
      margin="normal"
    />
  </DialogContent>
  <DialogActions sx={{ bgcolor: '#F3E6DC', p: 2 }}>
    <Button onClick={() => setOpenCreatePaymentDialog(false)} sx={{ color: '#6B4C3B' }}>Hủy</Button>
    <Button onClick={handleCreatePayment} variant="contained" sx={{ bgcolor: '#6B4C3B', color: '#fff' }}>Thanh toán</Button>
  </DialogActions>
</Dialog>

{/* Danh sách thanh toán */}
<Dialog open={openPaymentsDialog} onClose={() => setOpenPaymentsDialog(false)} fullWidth maxWidth="md">
  <DialogTitle sx={{ bgcolor: '#6B4C3B', color: '#fff' }}>
    Danh sách thanh toán – Hóa đơn: {saleInvoice?.code || ''}
  </DialogTitle>
  <DialogContent sx={{ bgcolor: '#F8EFE8', paddingBottom: 2 }}>
    {loadingPayments ? (
      <CircularProgress sx={{ color: '#5D4037' }} />
    ) : payments.length === 0 ? (
      <Typography sx={{ color: '#5D4037', fontStyle: 'italic' }}>
        Chưa có thanh toán nào.
      </Typography>
    ) : (
      <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#8C6744' }}>
              <TableCell>Mã thanh toán</TableCell>
              <TableCell>Số tiền</TableCell>
              <TableCell>Phương thức</TableCell>
              <TableCell>Ghi chú</TableCell>
              <TableCell>Ngày thanh toán</TableCell>
              <TableCell>Người tạo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map(p => (
              <TableRow key={p.id} sx={{ bgcolor: '#F1E4DA' }}>
                <TableCell>{p.code}</TableCell>
                <TableCell>
                  {Number(p.amount).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </TableCell>
                <TableCell>{p.paymentMethod}</TableCell>
                <TableCell>{p.note}</TableCell>
                <TableCell>{new Date(p.paidAt).toLocaleString()}</TableCell>
                <TableCell>{p.createdBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DialogContent>
  <DialogActions sx={{ bgcolor: '#F3E6DC', p: 2 }}>
    <Button onClick={() => setOpenPaymentsDialog(false)} sx={{ color: '#5D4037' }}>
      Đóng
    </Button>
  </DialogActions>
</Dialog>

    </Paper>
  );
}
