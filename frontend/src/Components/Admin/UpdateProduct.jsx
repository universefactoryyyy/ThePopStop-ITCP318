import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { getProductDetails, updateProduct, clearErrors } from '../../actions/productActions'
import { UPDATE_PRODUCT_RESET } from '../../constants/productConstants'
import { errMsg, successMsg } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'
import Loader from '../Layout/Loader'
import ProductForm from './ProductForm'

const UpdateProduct = () => {
    const { id } = useParams()
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { product, error: detailsError } = useSelector(state => state.productDetails)
    const { loading, error, isUpdated } = useSelector(state => state.product)

    useEffect(() => {
        dispatch(getProductDetails(id))
    }, [dispatch, id])

    useEffect(() => {
        if (detailsError) {
            errMsg(detailsError)
            dispatch(clearErrors())
            navigate('/admin/products')
        }
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
        if (isUpdated) {
            successMsg('Product updated')
            dispatch({ type: UPDATE_PRODUCT_RESET })
            navigate('/admin/products')
        }
    }, [detailsError, error, isUpdated, dispatch, navigate])

    if (!product || product._id !== id) return <Loader />

    return (
        <div>
            <MetaData title={`Edit ${product.name}`} />
            <h2 className="mb-4">Edit product</h2>
            <ProductForm
                product={product}
                onSubmit={(formData) => dispatch(updateProduct(id, formData))}
                submitting={loading}
                submitLabel="Save changes"
            />
        </div>
    )
}

export default UpdateProduct
