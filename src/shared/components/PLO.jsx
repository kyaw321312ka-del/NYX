import "./plo.css";
function PLO() {
  return (
    <>
      {[...Array(18)].map((_, index) => {
        return (
          <div className="plomain" key={index}>
            <span className="plo1"></span>
            <div className="plo2C">
              <span className="plo2"></span>
              <span className="plo2"></span>
            </div>
            <span className="plo3"></span>
          </div>
        );
      })}
    </>
  );
}
export default PLO;
