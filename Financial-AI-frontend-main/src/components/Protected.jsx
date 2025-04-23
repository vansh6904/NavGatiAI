import React,{useState,useEffect} from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

function Protected({ children, authentication = true }) {

const navigate = useNavigate();
const authStatus = useSelector(state => state.auth.status);
const [loader, setLoader] = useState(true);

useEffect(() => {
  if (authentication && authStatus !== authentication) {
    navigate("/login")
  } else if (!authentication && authStatus !== authentication) {
    navigate("/")
  }

  setLoader(false)
}, [authStatus, navigate])

return loader ? <div>Loading...</div> : <>{children}</>
}

export default Protected
