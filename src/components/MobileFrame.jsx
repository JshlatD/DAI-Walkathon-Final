export default function MobileFrame({ children }) {

  return (
    <div className="app-bg">

      <div className="mobile-frame">

        <div className="app-header">

          <img src="/logo.png" alt="logo" className="app-logo" />

          <h2>DAI Walkathon</h2>

        </div>


        <div className="app-content">
          {children}
        </div>

      </div>

    </div>
  );
}
