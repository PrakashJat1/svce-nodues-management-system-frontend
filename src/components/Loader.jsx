import { ClipLoader } from "react-spinners";

const override = {
  display: "block",
  borderColor: "red",
};

function Loader() {
  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 9999,
        backdropFilter: "blur(6px)",       // Blur effect
        WebkitBackdropFilter: "blur(6px)", // Safari support
        backgroundColor: "rgba(0, 0, 0, 0.3)", // Slight dark overlay
      }}
    >
      <ClipLoader
        color="#ffffff"
        loading={true}
        cssOverride={override}
        size={100}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </div>
  );
}

export default Loader;
