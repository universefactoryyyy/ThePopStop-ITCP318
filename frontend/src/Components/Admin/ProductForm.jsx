import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Formik, Form, useFormikContext } from 'formik'
import * as Yup from 'yup'
import { getFilterOptions, getNextSku } from '../../actions/productActions'
import { validateImageFile } from '../../Utils/validation'
import FormField from '../Layout/FormField'

const KNOWN_BRANDS = ['Funko', 'Pop Mart']
const KNOWN_SERIES = ['Anime', 'Crybaby', 'DC Comics', 'Games', 'Marvel', 'Pino Jelly', 'Skullpanda', 'The Monster']
const MAX_PHOTOS = 10

const optionList = (known, fromApi, current) =>
    [...new Set([...known, ...(fromApi || []), current].filter(Boolean))].sort((a, b) => a.localeCompare(b))

const SkuField = ({ productId }) => {
    const { values, setFieldValue } = useFormikContext()

    useEffect(() => {
        if (!values.brand || !values.series) {
            setFieldValue('sku', '')
            return undefined
        }
        let ignore = false
        getNextSku(values.brand, values.series, productId)
            .then(sku => { if (!ignore) setFieldValue('sku', sku) })
            .catch(() => { if (!ignore) setFieldValue('sku', '') })
        return () => { ignore = true }
    }, [values.brand, values.series, productId, setFieldValue])

    return (
        <FormField
            className="col-md-4"
            label="SKU"
            name="sku"
            type="text"
            readOnly
            help="Filled in from the brand, category, and the next number"
        />
    )
}

const productSchema = Yup.object({
    name: Yup.string().trim().required('Product name is required').max(150, 'Max 150 characters'),
    series: Yup.string().trim().required('Series / category is required').max(60, 'Max 60 characters'),
    brand: Yup.string().trim().required('Brand is required').max(60, 'Max 60 characters'),
    sku: Yup.string().trim(),
    price: Yup.number().typeError('Price must be a number').required('Price is required').moreThan(0, 'Price must be greater than 0').max(9999999, 'Price is too large'),
    costPrice: Yup.number().typeError('Cost price must be a number').min(0, 'Cost price cannot be negative').nullable().transform((value, original) => (original === '' ? null : value)),
    stock: Yup.number().typeError('Stock must be a number').required('Stock is required').integer('Stock must be a whole number').min(0, 'Stock cannot be negative'),
    description: Yup.string().trim().required('Description is required').max(3000, 'Max 3000 characters'),
})

// Create / edit a product (Formik + Yup). Several photos: existing ones can be removed, new ones are added.
const ProductForm = ({ product, onSubmit, submitting, submitLabel }) => {
    const dispatch = useDispatch()
    const { series, brands } = useSelector(state => state.filterOptions)

    const [newFiles, setNewFiles] = useState([])
    const [removed, setRemoved] = useState([]) // public_ids of existing photos to delete
    const [imageError, setImageError] = useState('')

    useEffect(() => {
        dispatch(getFilterOptions())
    }, [dispatch])

    const existing = useMemo(() => (product && product.images ? product.images : []), [product])
    const brandOptions = optionList(KNOWN_BRANDS, brands, product && product.brand)
    const seriesOptions = optionList(KNOWN_SERIES, series, product && product.series)
    const keptExisting = existing.filter(image => !removed.includes(image.public_id))

    const previews = useMemo(() => newFiles.map(file => URL.createObjectURL(file)), [newFiles])
    useEffect(() => () => previews.forEach(url => URL.revokeObjectURL(url)), [previews])

    const addFiles = (e) => {
        const picked = Array.from(e.target.files)
        e.target.value = ''
        for (const file of picked) {
            const problem = validateImageFile(file)
            if (problem) return setImageError(`${file.name}: ${problem}`)
        }
        if (keptExisting.length + newFiles.length + picked.length > MAX_PHOTOS) {
            return setImageError(`A product can have at most ${MAX_PHOTOS} photos`)
        }
        setImageError('')
        setNewFiles(current => [...current, ...picked])
    }

    const removeNew = (index) => setNewFiles(current => current.filter((_, i) => i !== index))
    const toggleExisting = (publicId) =>
        setRemoved(current => (current.includes(publicId) ? current.filter(id => id !== publicId) : [...current, publicId]))

    const submit = (values) => {
        if (keptExisting.length + newFiles.length === 0) {
            return setImageError('Please add at least one product photo')
        }
        const formData = new FormData()
        Object.entries(values).forEach(([key, value]) => formData.set(key, String(value ?? '').trim()))
        newFiles.forEach(file => formData.append('images', file))
        if (product) formData.set('keepImages', JSON.stringify(keptExisting.map(image => image.public_id)))
        onSubmit(formData)
    }

    return (
        <Formik
            enableReinitialize
            initialValues={{
                name: product ? product.name : '',
                series: product ? product.series : '',
                brand: product ? product.brand : '',
                sku: product ? product.sku : '',
                price: product ? product.price : '',
                costPrice: product && product.costPrice !== undefined && product.costPrice !== null ? product.costPrice : '',
                stock: product ? product.stock : '',
                description: product ? product.description : '',
            }}
            validationSchema={productSchema}
            onSubmit={submit}
        >
            <Form noValidate className="card">
                <div className="card-body">
                    <div className="row">
                        <FormField className="col-md-8" label="Name" name="name" type="text" />
                        <SkuField productId={product && product._id} />
                    </div>
                    <div className="row">
                        <FormField className="col-md-6" label="Series / category" name="series" as="select">
                            <option value="">Select a category</option>
                            {seriesOptions.map(name => <option key={name} value={name}>{name}</option>)}
                        </FormField>
                        <FormField className="col-md-6" label="Brand" name="brand" as="select">
                            <option value="">Select a brand</option>
                            {brandOptions.map(name => <option key={name} value={name}>{name}</option>)}
                        </FormField>
                    </div>
                    <div className="row">
                        <FormField className="col-md-4" label="Price (PHP)" name="price" type="number" step="0.01" min="0" />
                        <FormField className="col-md-4" label="Cost price (optional)" name="costPrice" type="number" step="0.01" min="0" />
                        <FormField className="col-md-4" label="Stock" name="stock" type="number" step="1" min="0" help="Status (In / Low / Out of Stock) follows the stock automatically" />
                    </div>
                    <FormField label="Description" name="description" as="textarea" rows={5} />

                    <div className="mb-4">
                        <label htmlFor="images" className="form-label">Photos ({keptExisting.length + newFiles.length}/{MAX_PHOTOS})</label>
                        <input
                            id="images"
                            type="file"
                            multiple
                            accept="image/jpeg,image/png,image/webp"
                            className={`form-control ${imageError ? 'is-invalid' : ''}`}
                            onChange={addFiles}
                        />
                        {imageError && <div className="invalid-feedback">{imageError}</div>}
                        <div className="form-text">JPG, PNG or WEBP, up to 5MB each. The first photo is the main one.</div>

                        <div className="pop-photo-grid mt-3">
                            {existing.map(image => {
                                const isRemoved = removed.includes(image.public_id)
                                return (
                                    <div key={image.public_id} className={`pop-photo ${isRemoved ? 'removed' : ''}`}>
                                        <img src={image.url} alt="Current product" />
                                        <button type="button" className="pop-photo-btn" onClick={() => toggleExisting(image.public_id)}>
                                            {isRemoved ? 'Undo' : 'Remove'}
                                        </button>
                                    </div>
                                )
                            })}
                            {previews.map((url, index) => (
                                <div key={url} className="pop-photo">
                                    <img src={url} alt="New upload preview" />
                                    <span className="pop-photo-tag">New</span>
                                    <button type="button" className="pop-photo-btn" onClick={() => removeNew(index)}>Remove</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="d-flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : submitLabel}
                        </button>
                        <Link to="/admin/products" className="btn btn-outline-primary">Cancel</Link>
                    </div>
                </div>
            </Form>
        </Formik>
    )
}

export default ProductForm
