import './table-loading.css';
function TableLoading({data}){
    const times= data || 9;
    return(
        <tr className="loadingtable">
            {[...Array(times)].map((_, index) => (
                <td key={index} className="td-container">
                    <div className="loading-bar"></div>
                </td>
                ))
            }
        </tr>
    )
}
export default TableLoading;