import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { newProduct, clearErrors } from '../../actions/productActions'
import { NEW_PRODUCT_RESET } from '../../constants/productConstants'
import { errMsg, successMsg } from '../../Utils/helpers'
import MetaData from '../Layout/MetaData'
import ProductForm from './ProductForm'

const NewProduct = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { loading, error, success } = useSelector(state => state.newProduct)

    useEffect(() => {
        if (error) {
            errMsg(error)
            dispatch(clearErrors())
        }
        if (success) {
            successMsg('Product created')
            dispatch({ type: NEW_PRODUCT_RESET })
            navigate('/admin/products')
        }
    }, [error, success, dispatch, navigate])

    return (
        <div>
            <MetaData title="New Product" />
            <h2 className="mb-4">New product</h2>
            <ProductForm
                onSubmit={(formData) => dispatch(newProduct(formData))}
                submitting={loading}
                submitLabel="Create product"
            />
        </div>
    )
}

export default NewProduct
