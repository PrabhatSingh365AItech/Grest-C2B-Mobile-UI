function Footer() {
  const currentDomain = window.location.origin;
  const WEBSITE_SHORT_NAME = currentDomain === import.meta.env.VITE_BUYBACK_URL ? import.meta.env.VITE_BUYBACK_SHORT_NAME : import.meta.env.VITE_WEBSITE_SHORT_NAME;

  return (
    <>
      <div className="footer h-[70px] w-screen bg-primary flex justify-center items-center flex-col  bottom-[0px] mt-auto ">
        <p className="text-white">
          &copy;{new Date().getFullYear()} {WEBSITE_SHORT_NAME} | All Rights Reserved
        </p>
      </div>
    </>
  );
}

export default Footer;
