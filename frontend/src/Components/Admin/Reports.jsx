import { useEffect, useState } from 'react'
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { fetchCustomerSales, fetchBrandSales } from '../../actions/dashboardActions'
import { errMsg, formatPeso, getErrorMessage } from '../../Utils/helpers'
import { palette, chartColors } from '../../theme'
import MetaData from '../Layout/MetaData'

const pesoTick = (value) => `\u20B1${Number(value).toLocaleString('en-PH')}`

// Sales reports: top customers and revenue per brand
const Reports = () => {
    const [customers, setCustomers] = useState(null)
    const [brands, setBrands] = useState(null)

    useEffect(() => {
        fetchCustomerSales().then(setCustomers).catch(e => { errMsg(getErrorMessage(e)); setCustomers([]) })
        fetchBrandSales().then(setBrands).catch(e => { errMsg(getErrorMessage(e)); setBrands([]) })
    }, [])

    return (
        <div>
            <MetaData title="Reports" />
            <h2 className="mb-4">Reports</h2>

            <div className="row g-4">
                <div className="col-xl-7">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="mb-3">Top customers by sales</h5>
                            {customers === null ? <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
                                : customers.length === 0 ? <p className="text-muted">No sales yet.</p>
                                : (
                                    <ResponsiveContainer width="100%" height={360}>
                                        <BarChart data={customers} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={palette.beige300} />
                                            <XAxis type="number" tickFormatter={pesoTick} stroke={palette.textMuted} />
                                            <YAxis type="category" dataKey="name" width={110} stroke={palette.textMuted} />
                                            <Tooltip formatter={(value) => [formatPeso(value), 'Sales']} />
                                            <Bar dataKey="total" name="Sales" fill={palette.green300} radius={[0, 6, 6, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                        </div>
                    </div>
                </div>

                <div className="col-xl-5">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="mb-3">Revenue by brand</h5>
                            {brands === null ? <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
                                : brands.length === 0 ? <p className="text-muted">No sales yet.</p>
                                : (
                                    <ResponsiveContainer width="100%" height={360}>
                                        <PieChart>
                                            <Pie data={brands} dataKey="total" nameKey="brand" outerRadius={110} label={(entry) => entry.brand}>
                                                {brands.map((entry, index) => <Cell key={entry.brand} fill={chartColors[index % chartColors.length]} />)}
                                            </Pie>
                                            <Tooltip formatter={(value) => formatPeso(value)} />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Reports
