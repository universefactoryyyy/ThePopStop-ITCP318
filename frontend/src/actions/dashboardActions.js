import axios from 'axios'

const API = import.meta.env.VITE_API

// Admin analytics. They only feed local chart state, so these are plain async helpers (no redux store needed).

export const fetchStats = async () => {
    const { data } = await axios.get(`${API}/admin/stats`)
    return data.stats
}

// all 12 months of one year (zero filled) + the years that have sales
export const fetchSalesPerMonth = async (year) => {
    const { data } = await axios.get(`${API}/admin/sales-per-month`, { params: { year } })
    return data
}

// one point per day between start and end (YYYY-MM-DD)
export const fetchSalesByRange = async (start, end) => {
    const { data } = await axios.get(`${API}/admin/sales`, { params: { start, end } })
    return data
}

export const fetchCustomerSales = async () => {
    const { data } = await axios.get(`${API}/admin/customer-sales`)
    return data.customerSales
}

export const fetchBrandSales = async () => {
    const { data } = await axios.get(`${API}/admin/brand-sales`)
    return data.brandSales
}
