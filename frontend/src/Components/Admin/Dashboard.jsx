import { useEffect, useState } from 'react'
import {
    ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import {
    fetchStats, fetchSalesPerMonth, fetchSalesByRange,
} from '../../actions/dashboardActions'
import { errMsg, formatPeso, getErrorMessage } from '../../Utils/helpers'
import { palette } from '../../theme'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'

const pesoTick = (value) => `\u20B1${Number(value).toLocaleString('en-PH')}`

const toDateInput = (date) => date.toISOString().slice(0, 10)
const defaultRange = () => {
    const end = new Date()
    const start = new Date()
    start.setDate(end.getDate() - 29)
    return { start: toDateInput(start), end: toDateInput(end) }
}

const StatCard = ({ label, value, tone }) => (
    <div className="col-6 col-xl-3 d-flex">
        <div className={`card pop-stat h-100 w-100 ${tone || ''}`}>
            <div className="card-body">
                <div className="pop-stat-label">{label}</div>
                <div className="pop-stat-value">{value}</div>
            </div>
        </div>
    </div>
)

const Dashboard = () => {
    const [stats, setStats] = useState(null)

    // monthly sales (line chart, all 12 months)
    const [year, setYear] = useState(new Date().getFullYear())
    const [years, setYears] = useState([new Date().getFullYear()])
    const [monthly, setMonthly] = useState([])

    // sales between two dates (line or bar)
    const [range, setRange] = useState(defaultRange)
    const [applied, setApplied] = useState(range)
    const [rangeData, setRangeData] = useState(null)
    const [chartType, setChartType] = useState('line')

    useEffect(() => {
        fetchStats().then(setStats).catch(e => errMsg(getErrorMessage(e)))
    }, [])

    useEffect(() => {
        let ignore = false
        fetchSalesPerMonth(year)
            .then(data => {
                if (ignore) return
                setMonthly(data.salesPerMonth)
                setYears(data.years)
            })
            .catch(e => errMsg(getErrorMessage(e)))
        return () => { ignore = true }
    }, [year])

    useEffect(() => {
        let ignore = false
        fetchSalesByRange(applied.start, applied.end)
            .then(data => { if (!ignore) setRangeData(data) })
            .catch(e => errMsg(getErrorMessage(e)))
        return () => { ignore = true }
    }, [applied])

    const applyRange = (e) => {
        e.preventDefault()
        if (!range.start || !range.end) return errMsg('Pick a start and an end date')
        if (range.start > range.end) return errMsg('The start date cannot be after the end date')
        setApplied(range)
    }

    if (!stats) return <Loader />

    const tooltipPeso = (value) => [formatPeso(value), 'Sales']
    const RangeChart = chartType === 'line' ? LineChart : BarChart

    return (
        <div>
            <MetaData title="Admin Dashboard" />
            <h2 className="mb-4">Dashboard</h2>

            <div className="row g-3 mb-4">
                <StatCard label="Total revenue" value={formatPeso(stats.totalRevenue)} tone="pop-stat-green" />
                <StatCard label="Orders" value={stats.totalOrders} tone="pop-stat-beige" />
                <StatCard label="Pending orders" value={stats.pendingOrders} tone="pop-stat-beige" />
                <StatCard label="Completed orders" value={stats.completedOrders} tone="pop-stat-green" />
                <StatCard label="Customers" value={stats.totalUsers} />
                <StatCard label="Products" value={stats.totalProducts} />
                <StatCard label="Low stock" value={stats.lowStock} />
                <StatCard label="Out of stock" value={stats.outOfStock} />
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <h5 className="mb-0">Monthly sales</h5>
                        <select
                            className="form-select form-select-sm"
                            style={{ width: 'auto' }}
                            value={year}
                            onChange={(e) => setYear(Number(e.target.value))}
                            aria-label="Year"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <ResponsiveContainer width="100%" height={320}>
                        <LineChart data={monthly} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={palette.beige300} />
                            {/* interval={0}: every one of the 12 month labels is shown */}
                            <XAxis dataKey="month" interval={0} stroke={palette.textMuted} />
                            <YAxis tickFormatter={pesoTick} stroke={palette.textMuted} width={80} />
                            <Tooltip formatter={tooltipPeso} />
                            <Line type="monotone" dataKey="total" name="Sales" stroke={palette.green500} strokeWidth={3} dot={{ r: 4, fill: palette.green500 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="mb-3">Sales by date range</h5>
                    <form className="row g-2 align-items-end mb-3" onSubmit={applyRange}>
                        <div className="col-sm-3">
                            <label htmlFor="range-start" className="form-label mb-1">From</label>
                            <input id="range-start" type="date" className="form-control" value={range.start} max={range.end || undefined}
                                onChange={(e) => setRange({ ...range, start: e.target.value })} />
                        </div>
                        <div className="col-sm-3">
                            <label htmlFor="range-end" className="form-label mb-1">To</label>
                            <input id="range-end" type="date" className="form-control" value={range.end} min={range.start || undefined}
                                onChange={(e) => setRange({ ...range, end: e.target.value })} />
                        </div>
                        <div className="col-sm-3">
                            <label htmlFor="range-type" className="form-label mb-1">Chart</label>
                            <select id="range-type" className="form-select" value={chartType} onChange={(e) => setChartType(e.target.value)}>
                                <option value="line">Line</option>
                                <option value="bar">Bar</option>
                            </select>
                        </div>
                        <div className="col-sm-3">
                            <button type="submit" className="btn btn-primary w-100">Apply</button>
                        </div>
                    </form>

                    {rangeData ? (
                        <>
                            <p className="text-muted">
                                {rangeData.start} to {rangeData.end}: <strong>{formatPeso(rangeData.totalSales)}</strong> from <strong>{rangeData.totalOrders}</strong> order{rangeData.totalOrders === 1 ? '' : 's'}
                            </p>
                            <ResponsiveContainer width="100%" height={320}>
                                <RangeChart data={rangeData.sales} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={palette.beige300} />
                                    <XAxis dataKey="date" stroke={palette.textMuted} minTickGap={24} tickFormatter={(d) => d.slice(5)} />
                                    <YAxis tickFormatter={pesoTick} stroke={palette.textMuted} width={80} />
                                    <Tooltip formatter={tooltipPeso} />
                                    {chartType === 'line'
                                        ? <Line type="monotone" dataKey="total" name="Sales" stroke={palette.green500} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                        : <Bar dataKey="total" name="Sales" fill={palette.green300} radius={[6, 6, 0, 0]} />}
                                </RangeChart>
                            </ResponsiveContainer>
                        </>
                    ) : <div className="text-center py-5"><div className="spinner-border" role="status" /></div>}
                </div>
            </div>
        </div>
    )
}

export default Dashboard
