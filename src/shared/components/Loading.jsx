import './loading.css';

const Loading = ({ message = "Loading" }) => {
  return (
    <div className="loadingcard">
      <div className="loadingimg"></div>      
      <div className="loadingtext"></div>
    </div>
  );
};

export default Loading;