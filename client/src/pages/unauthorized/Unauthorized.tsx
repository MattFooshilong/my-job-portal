import { Link } from 'react-router-dom'

const Unauthorized = () => {
  return (
    <article style={{ padding: '100px' }}>
      <h1>Oops!</h1>
      <p>You are unauthorized to view this page</p>
      <div>
        <Link to="/">Visit Our Homepage</Link>
      </div>
    </article>
  )
}

export default Unauthorized
