import React, { useEffect, useState } from "react";
import {
  Box, Tabs, Tab, Typography, Paper, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import axios from "axios";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#6D5F4B", "#C2B49A", "#A3D5D3"];
const FILTERS = [
  { label: "1 ngày", value: 1 },
  { label: "7 ngày", value: 7 },
  { label: "30 ngày", value: 30 },
  { label: "Tất cả", value: 0 }
];

export default function Statistics() {
  const [tab, setTab] = useState(0); // 0: purchase, 1: sales, 2: profit, 3: best-sellers
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [total, setTotal] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDays, setFilterDays] = useState(0);
  const [bestSellers, setBestSellers] = useState([]);
  const token = localStorage.getItem("token");

  const fetchData = async () => {
    setLoading(true);
    const base = "https://warehouse-vkz2.onrender.com/warehouse/statistics/";
    let type;
    if (tab === 0) type = "purchase-orders";
    else if (tab === 1) type = "sales-orders";
    else type = "sales-orders"; // Profit dùng sales-orders

    try {
      const [ordersRes, totalRes] = await Promise.all([
        axios.get(`${base}${type}/approved-completed`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${base}${type}/total-approved-completed`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      let ord = ordersRes.data;
      if (tab === 2) {
        ord = ord.map(o => ({
          ...o,
          profit: Number(o.estimatedProfit) || 0
        }));
      }
      setOrders(ord);
      setTotal(totalRes.data);
    } catch (err) {
      console.error("Lỗi khi fetch dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBestSellers = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://warehouse-vkz2.onrender.com/warehouse/inventories/best-sellers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data?.result || [];
      const mapped = data.map(item => ({
        productCode: item.productCode,
        productName: item.productName,
        sold: item.sold,
        unitPrice: item.unitPrice,
        warehouseName: item.warehouseName
      }));
      setBestSellers(mapped);
    } catch (err) {
      console.error("Lỗi khi fetch best-sellers:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filterDays === 0) {
      setFiltered(orders);
      computeChartAndTotal(orders);
      return;
    }
    const cutoff = Date.now() - filterDays * 24 * 60 * 60 * 1000;
    const filteredData = orders.filter(o => {
      const approvedTime = o.approvedAt && new Date(o.approvedAt).getTime();
      return approvedTime && approvedTime >= cutoff;
    });
    setFiltered(filteredData);
    computeChartAndTotal(filteredData);
  };

  const computeChartAndTotal = (data) => {
    const totalSum = data.reduce((sum, o) => {
      const v = tab === 2 ? o.profit : o.totalPrice;
      return sum + (v || 0);
    }, 0);
    setTotal(totalSum);

    const key = tab === 2 ? "profit" : "totalPrice";
    const statusMap = {};
    data.forEach(o => {
      const status = o.status;
      statusMap[status] = (statusMap[status] || 0) + (o[key] || 0);
    });
    const formatted = Object.entries(statusMap).map(([status, value]) => ({
      name: status === "APPROVED" ? "Đã duyệt" :
        status === "COMPLETED" ? "Hoàn thành" : status,
      value
    }));
    setChartData(formatted);
  };

  useEffect(() => {
    if (tab === 3) fetchBestSellers();
    else fetchData();
  }, [tab]);

  useEffect(() => {
    if (tab !== 3) applyFilter();
  }, [orders, filterDays]);

  const title = tab === 0 ? "Thống kê đơn mua"
    : tab === 1 ? "Thống kê đơn bán"
      : tab === 2 ? "Thống kê lợi nhuận"
        : "Sản phẩm bán chạy";

  return (
    <Box sx={{ p: 3, bgcolor: "#F5F1E9", minHeight: "100vh" }}>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="Đơn mua" />
        <Tab label="Đơn bán" />
        <Tab label="Lợi nhuận" />
        <Tab label="Bán chạy" />
      </Tabs>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" sx={{ color: "#6D5F4B" }}>{title}</Typography>
        {tab !== 3 && (
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Khoảng thời gian</InputLabel>
            <Select
              value={filterDays}
              label="Khoảng thời gian"
              onChange={e => setFilterDays(e.target.value)}
            >
              {FILTERS.map(f => (
                <MenuItem key={f.value} value={f.value}>{f.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      {tab === 3 ? (
        loading ? <CircularProgress sx={{ color: "#6D5F4B" }} /> : (
          <TableContainer component={Paper} sx={{ bgcolor: "#FFF" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#E9E4D4" }}>
                  <TableCell>Mã SP</TableCell>
                  <TableCell>Tên SP</TableCell>
                  <TableCell>Đã bán</TableCell>
                  <TableCell>Đơn giá</TableCell>
                  <TableCell>Kho</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bestSellers.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.productCode}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{item.sold}</TableCell>
                    <TableCell>{item.unitPrice?.toLocaleString("vi-VN")} VND</TableCell>
                    <TableCell>{item.warehouseName || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )
      ) : loading ? (
        <CircularProgress sx={{ color: "#6D5F4B" }} />
      ) : (
        <>
          <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
            <Paper sx={{ p: 2, minWidth: 220, bgcolor: "#FDFBF7" }}>
              <Typography sx={{ color: "#6D5F4B", mb: .5 }}>
                {tab === 2 ? "💰 Tổng lợi nhuận" : "💰 Tổng tiền"}
              </Typography>
              <Typography sx={{ fontSize: "1.25rem", fontWeight: 600 }}>
                {Number(total).toLocaleString("vi-VN")} VND
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, flex: 1, bgcolor: "#FFF" }}>
              <Typography sx={{ color: "#6D5F4B", mb: 2 }}>
                Biểu đồ theo trạng thái
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={100}
                    label={({ name, value }) => `${name}: ${value.toLocaleString("vi-VN")} VND`}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={v => `${Number(v).toLocaleString("vi-VN")} VND`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          <TableContainer component={Paper} sx={{ bgcolor: "#FFF" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#E9E4D4" }}>
                  <TableCell>Mã đơn</TableCell>
                  <TableCell>Tên đơn</TableCell>
                  <TableCell>{tab === 0 ? "Nhà cung cấp" : "Khách hàng"}</TableCell>
                  <TableCell>Kho</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ngày duyệt</TableCell>
                  <TableCell align="right">
                    {tab === 2 ? "Lợi nhuận" : "Tổng tiền"}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(o => (
                  <TableRow key={o.id}>
                    <TableCell>{o.code}</TableCell>
                    <TableCell>{o.orderName}</TableCell>
                    <TableCell>
                      {tab === 0 ? o.supplier?.name : o.customer?.name}
                    </TableCell>
                    <TableCell>{o.warehouse?.name}</TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell>
                      {o.approvedAt
                        ? new Date(o.approvedAt).toLocaleString("vi-VN")
                        : "-"}
                    </TableCell>
                    <TableCell align="right">
                      {tab === 2
                        ? Number(o.profit || 0).toLocaleString("vi-VN")
                        : Number(o.totalPrice || 0).toLocaleString("vi-VN")
                      } VND
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
}