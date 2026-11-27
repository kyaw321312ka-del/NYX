import "../styles/login.css";
import LoginImg from "../../../assets/images/loginimg.png";
import { NavLink, Outlet } from 'react-router-dom';

function Login(){
    return(
        <div className="loginContainer">
            <img src={LoginImg} alt="loginimg" className='loginimg' />
            <div className='loginsection'>
               <h2 className='loginsectionheader'>Welcome Back</h2> 
               <p className='loginsectonp'>Login to access your community</p>
               <div className='switchwarper'>
                    <NavLink to='poslogin'>Point of Sales Account</NavLink>
                    <NavLink to='academiclogin'>Academic Account</NavLink>
               </div>
               <div className='loginOutlet'>
                <Outlet/>
               </div>
            </div>
        </div>
    )
}
export default Login;