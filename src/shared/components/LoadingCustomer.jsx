import './loading-customer.css';
function CustomerLoading({times}){
    let time = times || 8;
    return(
        <tr className="loadingcustomermain">
            
            {[...Array(time)].map((_,index)=>{
                return(
                    <td className='loadingcustomertd' key={index}>
                        <div className={index % 2 == 0 ? 'loadingcustomer' : 'loadingcustomer1'}></div>
                    </td>
                )
            })}

        </tr>
    )
}
export default CustomerLoading;