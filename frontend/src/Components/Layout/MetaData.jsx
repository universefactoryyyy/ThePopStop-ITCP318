import { Helmet } from 'react-helmet-async'

const MetaData = ({ title }) => {
    return (
        <Helmet>
            <title>{`${title} - The Pop Stop`}</title>
        </Helmet>
    )
}

export default MetaData
