import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Modal } from 'react-bootstrap'
import { DataGrid } from '@mui/x-data-grid'
import { Formik, Form } from 'formik'
import * as Yup from 'yup'
import Swal from 'sweetalert2'
import { getAllDiscounts, saveDiscount, deleteDiscount, clearErrors } from '../../actions/discountActions'
import { SAVE_DISCOUNT_RESET, DELETE_DISCOUNT_RESET } from '../../constants/discountConstants'
import { errMsg, successMsg, formatDate, formatPeso } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'
import FormField from '../Layout/FormField'

const discountSchema = Yup.object({
    code: Yup.string().trim().required('Code is required').max(50, 'Max 50 characters'),
    description: Yup.string().trim().max(255, 'Max 255 characters'),
    discountType: Yup.string().oneOf(['percent', 'fixed']).required(),
    discountValue: Yup.number()
        .typeError('Value must be a number')
        .required('Value is required')
        .moreThan(0, 'Value must be greater than 0')
        .when('discountType', {
            is: 'percent',
            then: (schema) => schema.max(100, 'A percent discount cannot exceed 100'),
        }),
    minOrderAmount: Yup.number().typeError('Must be a number').min(0, 'Cannot be negative').required('Minimum order is required'),
    maxUses: Yup.number().typeError('Must be a number').integer('Must be a whole number').min(1, 'Must be at least 1').nullable()
        .transform((value, original) => (original === '' ? null : value)),
    expiresAt: Yup.string(),
    isActive: Yup.string().oneOf(['true', 'false']).required(),
})

const EMPTY = { code: '', description: '', discountType: 'percent', discountValue: '', minOrderAmount: 0, maxUses: '', expiresAt: '', isActive: 'true' }

const toFormValues = (discount) => discount ? {
    code: discount.code,
    description: discount.description || '',
    discountType: discount.discountType,
    discountValue: discount.discountValue,
    minOrderAmount: discount.minOrderAmount,
    maxUses: discount.maxUses === null || discount.maxUses === undefined ? '' : discount.maxUses,
    expiresAt: discount.expiresAt ? String(discount.expiresAt).slice(0, 10) : '',
    isActive: String(discount.isActive),
} : EMPTY

// Admin: discount codes (create, edit, delete)
const DiscountsList = () => {
    const dispatch = useDispatch()
    const { loading, error, discounts } = useSelector(state => state.discounts)
    const { loading: saving, error: actionError, isSaved, isDeleted } = useSelector(state => state.discount)

    // editing: null = closed, {} = new, discount = edit
    const [editing, setEditing] = useState(null)

    useEffect(() => {
        dispatch(getAllDiscounts())
    }, [dispatch])

    useEffect(() => {
        if (error) { errMsg(error); dispatch(clearErrors()) }
        if (actionError) { errMsg(actionError); dispatch(clearErrors()) }
    }, [error, actionError, dispatch])

    useEffect(() => {
        if (isSaved) {
            successMsg('Discount saved')
            dispatch({ type: SAVE_DISCOUNT_RESET })
            setEditing(null)
            dispatch(getAllDiscounts())
        }
    }, [isSaved, dispatch])

    useEffect(() => {
        if (isDeleted) {
            successMsg('Discount deleted')
            dispatch({ type: DELETE_DISCOUNT_RESET })
            dispatch(getAllDiscounts())
        }
    }, [isDeleted, dispatch])

    const confirmDelete = async (discount) => {
        const result = await Swal.fire({
            title: `Delete ${discount.code}?`,
            text: 'Existing orders keep the discount they used.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Delete',
        })
        if (result.isConfirmed) dispatch(deleteDiscount(discount._id))
    }

    const submit = (values) => {
        dispatch(saveDiscount(editing._id || null, {
            code: values.code.trim().toUpperCase(),
            description: values.description.trim(),
            discountType: values.discountType,
            discountValue: Number(values.discountValue),
            minOrderAmount: Number(values.minOrderAmount),
            maxUses: values.maxUses === '' || values.maxUses === null ? null : Number(values.maxUses),
            expiresAt: values.expiresAt || null,
            isActive: values.isActive === 'true',
        }))
    }

    const columns = useMemo(() => [
        { field: 'code', headerName: 'Code', width: 140 },
        { field: 'description', headerName: 'Description', flex: 1, minWidth: 180 },
        {
            field: 'discountValue',
            headerName: 'Discount',
            width: 120,
            valueGetter: (value, row) => (row.discountType === 'percent' ? `${row.discountValue}%` : formatPeso(row.discountValue)),
        },
        { field: 'minOrderAmount', headerName: 'Min order', width: 120, type: 'number', valueFormatter: (value) => formatPeso(value) },
        {
            field: 'usage',
            headerName: 'Used',
            width: 100,
            valueGetter: (value, row) => `${row.usedCount}${row.maxUses ? ` / ${row.maxUses}` : ''}`,
        },
        { field: 'expiresAt', headerName: 'Expires', width: 120, valueFormatter: (value) => (value ? formatDate(value) : 'Never') },
        {
            field: 'isActive',
            headerName: 'Status',
            width: 100,
            renderCell: (params) => <span className={`badge ${params.value ? 'bg-success' : 'bg-secondary'}`}>{params.value ? 'Active' : 'Inactive'}</span>,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 170,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <div className="pop-grid-actions">
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={() => setEditing(params.row)}>Edit</button>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => confirmDelete(params.row)}>Delete</button>
                </div>
            ),
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [dispatch])

    return (
        <div>
            <MetaData title="Discounts" />
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <h2 className="mb-0">Discounts</h2>
                <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>+ New discount</button>
            </div>

            <div className="pop-grid-wrap">
                <DataGrid
                    rows={discounts}
                    columns={columns}
                    getRowId={(row) => row._id}
                    loading={loading}
                    autoHeight
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                />
            </div>

            <Modal show={editing !== null} onHide={() => setEditing(null)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{editing && editing._id ? 'Edit discount' : 'New discount'}</Modal.Title>
                </Modal.Header>
                {editing !== null && (
                    <Formik
                        enableReinitialize
                        initialValues={toFormValues(editing._id ? editing : null)}
                        validationSchema={discountSchema}
                        onSubmit={submit}
                    >
                        {({ values }) => (
                            <Form noValidate>
                                <Modal.Body>
                                    <FormField label="Code" name="code" type="text" style={{ textTransform: 'uppercase' }} />
                                    <FormField label="Description" name="description" type="text" />
                                    <div className="row">
                                        <FormField className="col-6" label="Type" name="discountType" as="select">
                                            <option value="percent">Percent (%)</option>
                                            <option value="fixed">Fixed amount (PHP)</option>
                                        </FormField>
                                        <FormField className="col-6" label={values.discountType === 'percent' ? 'Percent off' : 'Amount off'} name="discountValue" type="number" step="0.01" min="0" />
                                    </div>
                                    <div className="row">
                                        <FormField className="col-6" label="Minimum order (PHP)" name="minOrderAmount" type="number" step="0.01" min="0" />
                                        <FormField className="col-6" label="Max uses" name="maxUses" type="number" step="1" min="1" help="Leave empty for unlimited" />
                                    </div>
                                    <div className="row">
                                        <FormField className="col-6" label="Expires on" name="expiresAt" type="date" help="Leave empty for no expiry" />
                                        <FormField className="col-6" label="Status" name="isActive" as="select">
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </FormField>
                                    </div>
                                </Modal.Body>
                                <Modal.Footer>
                                    <button type="button" className="btn btn-outline-primary" onClick={() => setEditing(null)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save discount'}</button>
                                </Modal.Footer>
                            </Form>
                        )}
                    </Formik>
                )}
            </Modal>
        </div>
    )
}

export default DiscountsList
