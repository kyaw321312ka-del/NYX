import { useRef, useState } from "react"
import CloseIcon from '@mui/icons-material/Close';
import UploadFileIcon from '@mui/icons-material/UploadFile';

function BrandPopUp({data}){
    const {setshow2}=data;

    const [img,setimg]=useState(null);
    const [selecttoDel,setselecttoDel]=useState(null);//for category update
    const [allow,setallow]=useState( selecttoDel ? true : false); //for category update

    let BrandName=useRef();
    let BrandImage=useRef();


    //for img preview
    const handleImageChange = (e) => {
    const file = e.target.files[0]; 
    if (file) {
        const imageUrl = URL.createObjectURL(file);
        setimg(imageUrl);
        }
    };

    async function edit_brand(item){
        //to be continue
    }

    return(
        <div className="showwarper">
            <form className='categorypopup'>

                <h1 className='categorypopupheader'>{selecttoDel ? 'Brand Details' : 'New Brand'}</h1>

                <button className='categorycloseIcon'
                type='button'
                    onClick={()=>{
                        setshow2(false)
                        setallow(false)
                        setselecttoDel(null)
                    }}
                ><CloseIcon/></button>

                <p>Brand Name</p>

                <input type='text' className='category'
                defaultValue={selecttoDel ? selecttoDel.name : ''}
                readOnly={ selecttoDel && !allow}
                required={!selecttoDel}
                ref={BrandName} key={selecttoDel ? 2 : ''} />

                            {/* <input type='file' ref={CategoryImage} 
                            disabled={ selecttoDel && !allow} required={!selecttoDel}/> */}

                <div className="imageuploaddiv">
                    <h4>Upload Image</h4>
                    <div onClick={()=>recepitimg.current.click()}>
                        {
                            !(img) ?
                                <>
                                    <UploadFileIcon/>
                                    <p>Upload</p>
                                </>:
                                <>
                                <img src={img} alt='recepit'  
                                style={{width:'100%',height:'100%',borderRadius:'10px'}}/>
                                </>
                                }
                    </div>
                        <input type='file'accept='image/*' 
                        onChange={handleImageChange}
                        ref={BrandImage} style={{display:'none'}} />
                </div>


                {selecttoDel ? 
                <div className='categoryupdate' id='brandupdate'>

                <button onClick={handleDeleteCategory} type='button'>Delete</button>

                    <div >
                        <button onClick={()=>{
                        setallow(true)
                        Categoryname.current.focus();
                        }} type='button'>Edit</button>
                        <button disabled={ selecttoDel && !allow } 
                        >Update</button>
                    </div>

                </div>
                    :
                     <div className='categorycreatebtn' id='brandcreate'>
                        <button style={{background:'#0D1B2A',color:'white'}}
                        >Create</button>
                        <button onClick={()=>setshow2(false)} type='button'>cancel</button>
                    </div>
                        }
            </form>
        </div>
    )
}
export default BrandPopUp;