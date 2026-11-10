import React, { useContext, useEffect } from 'react'
import './Verify.css'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from "react-toastify";

const Verify = () => {
    const [searchParams]=useSearchParams();
    const sessionId=searchParams.get("session_id");
    const {url, token} =useContext(StoreContext);
    const navigate= useNavigate();

    const verifyPayment=async()=>{
        const authToken = token || localStorage.getItem("token");
        if (!authToken || !sessionId) { navigate("/cart"); return; }
        const response= await axios.post(url+"/api/order/verify",{sessionId},{headers:{token: authToken}});
        if(response.data.success){
            navigate("/myorders");
            toast.success("Order Placed Successfully");
        }else{
            toast.error(response.data.message || "Payment could not be verified");
            navigate("/cart");
        }
    }
    useEffect(()=>{
        verifyPayment().catch(() => { toast.error("Payment verification failed"); navigate("/cart"); });
    },[sessionId])
  return (
    <div className='verify'>
        <div className="spinner"></div>
    </div>
  )
}

export default Verify
