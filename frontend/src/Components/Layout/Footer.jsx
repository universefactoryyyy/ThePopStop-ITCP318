import { Link } from 'react-router-dom'

const Footer = () => {
    return (
        <footer className="pop-footer">
            <div className="container-xl">
                <div className="row gy-4">
                    <div className="col-md-5">
                        <h5 className="heading-font">The Pop Stop</h5>
                        <p className="mb-0">Your one-stop shop for collectible figures, plushies, and more!</p>
                    </div>
                    <div className="col-6 col-md-3">
                        <h6>Quick Links</h6>
                        <ul className="list-unstyled mb-0">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/products">Products</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/orders/me">My Orders</Link></li>
                        </ul>
                    </div>
                    <div className="col-6 col-md-4">
                        <h6>Contact Us</h6>
                        <p className="mb-1"><a href="mailto:thepopstoppp@gmail.com">thepopstoppp@gmail.com</a></p>
                        <p className="mb-0">+63 912 345 6789</p>
                    </div>
                </div>
                <p className="pop-footer-copy">&copy; {new Date().getFullYear()} The Pop Stop. All rights reserved.</p>
            </div>
        </footer>
    )
}

export default Footer
