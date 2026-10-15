import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { DataGrid } from '@mui/x-data-grid'
import Swal from 'sweetalert2'
import SearchIcon from '@mui/icons-material/Search'
import { allUsers, updateUser, clearErrors } from '../../actions/userActions'
import { UPDATE_USER_RESET } from '../../constants/userConstants'
import { errMsg, successMsg, formatDate } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'
import UserAvatar from '../Layout/UserAvatar'

const UsersList = () => {
    const dispatch = useDispatch()
    const { loading, error, users } = useSelector(state => state.allUsers)
    const { error: actionError, isUpdated } = useSelector(state => state.user)
    const [search, setSearch] = useState('')
    const [notice, setNotice] = useState('')

    useEffect(() => {
        dispatch(allUsers())
    }, [dispatch])

    useEffect(() => {
        if (error) { errMsg(error); dispatch(clearErrors()) }
        if (actionError) { errMsg(actionError); dispatch(clearErrors()) }
    }, [error, actionError, dispatch])

    useEffect(() => {
        if (isUpdated) {
            successMsg(notice || 'User updated')
            dispatch({ type: UPDATE_USER_RESET })
            dispatch(allUsers())
        }
    }, [isUpdated, notice, dispatch])

    const confirmStatus = async (user) => {
        const turningOff = Boolean(user.isActive)
        const result = await Swal.fire({
            title: turningOff ? `Deactivate ${user.name}?` : `Activate ${user.name}?`,
            text: turningOff
                ? 'They will not be able to sign in. The account stays in this list.'
                : 'They will be able to sign in again.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: turningOff ? 'Deactivate' : 'Activate',
        })
        if (!result.isConfirmed) return
        setNotice(turningOff ? 'User deactivated' : 'User activated')
        dispatch(updateUser(user._id, { isActive: !turningOff }))
    }

    const rows = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return users
        return users.filter(u => [u.name, u.email, u.username].some(v => String(v || '').toLowerCase().includes(term)))
    }, [users, search])

    const columns = useMemo(() => [
        {
            field: 'avatar',
            headerName: '',
            width: 70,
            sortable: false,
            filterable: false,
            renderCell: (params) => <UserAvatar user={params.row} />,
        },
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 160 },
        { field: 'email', headerName: 'Email', flex: 1.2, minWidth: 200 },
        { field: 'username', headerName: 'Username', width: 130, valueGetter: (value) => value || '-' },
        {
            field: 'role',
            headerName: 'Role',
            width: 130,
            renderCell: (params) => {
                const tone = params.value === 'admin' ? 'bg-primary text-dark' : params.value === 'employee' ? 'bg-info text-dark' : 'bg-secondary'
                return <span className={`badge ${tone}`}>{params.value}</span>
            },
        },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 110,
            renderCell: (params) => <span className={`badge ${params.value ? 'bg-success' : 'bg-danger'}`}>{params.value ? 'Active' : 'Inactive'}</span>,
        },
        { field: 'createdAt', headerName: 'Joined', width: 130, valueFormatter: (value) => formatDate(value) },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 220,
            sortable: false,
            filterable: false,
            renderCell: (params) => {
                const active = Boolean(params.row.isActive)
                const isAdminAccount = params.row.role === 'admin'
                return (
                    <div className="pop-grid-actions">
                        <Link to={`/admin/user/${params.row._id}`} className="btn btn-sm btn-outline-primary">Edit</Link>
                        {!isAdminAccount && (
                            <button
                                type="button"
                                className={`btn btn-sm ${active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                onClick={() => confirmStatus(params.row)}
                            >
                                {active ? 'Deactivate' : 'Activate'}
                            </button>
                        )}
                    </div>
                )
            },
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [dispatch])

    return (
        <div>
            <MetaData title="All Users" />
            <h2 className="mb-3">Users</h2>
            <div className="input-group pop-search-box mb-3">
                <span className="input-group-text"><SearchIcon fontSize="small" /></span>
                <input
                    type="search"
                    className="form-control"
                    placeholder="Search name, email or username"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Search users"
                />
            </div>
            <div className="pop-grid-wrap">
                <DataGrid
                    rows={rows}
                    columns={columns}
                    getRowId={(row) => row._id}
                    loading={loading}
                    rowHeight={60}
                    autoHeight
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                />
            </div>
        </div>
    )
}

export default UsersList
